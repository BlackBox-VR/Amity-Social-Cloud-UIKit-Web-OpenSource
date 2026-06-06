import { useCallback, useEffect, useRef, useState } from 'react';
import { PostTargetType } from '@amityco/js-sdk';

import {
  AMITY_API_KEY,
  AMITY_GLOBAL_CATEGORY_ID,
  BBVR_GLOBAL_COMMUNITY_ID,
  CONTENT_SEARCH_API_URL,
} from '~/constants';

const COMMUNITY_TARGET_TYPE = 'community';
const FEED_DEBUG_KEY = '__BBVR_FEED_DEBUG__';

const resolveSearchParams = ({ targetType, targetId, searchType, showTargetId, loginUserId }) => {
  if (searchType) {
    return {
      targetType: COMMUNITY_TARGET_TYPE,
      targetId: BBVR_GLOBAL_COMMUNITY_ID,
      searchType,
      showTargetId,
    };
  }

  if (targetType === PostTargetType.UserFeed || targetType === PostTargetType.MyFeed) {
    return {
      targetType: COMMUNITY_TARGET_TYPE,
      targetId: BBVR_GLOBAL_COMMUNITY_ID,
      searchType: 'user',
      showTargetId: targetId || (targetType === PostTargetType.MyFeed ? loginUserId : ''),
    };
  }

  if (targetType === PostTargetType.GlobalFeed || targetType === PostTargetType.CommunityFeed) {
    return {
      targetType: COMMUNITY_TARGET_TYPE,
      targetId: targetId || BBVR_GLOBAL_COMMUNITY_ID,
    };
  }

  return {
    targetType: targetType || COMMUNITY_TARGET_TYPE,
    targetId: targetId || BBVR_GLOBAL_COMMUNITY_ID,
  };
};

const useSearchFeed = ({
  targetType,
  targetId,
  loginUserId,
  searchType,
  showTargetId,
  queryLimit,
  defaultNumber,
  enabled = true,
}) => {
  const [page, setPage] = useState(0);
  const [data, setData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const fetchData = useCallback(
    async (currentPage) => {
      const {
        targetType: resolvedTargetType,
        targetId: resolvedTargetId,
        searchType: resolvedSearchType,
        showTargetId: resolvedShowTargetId,
      } = resolveSearchParams({ targetType, targetId, searchType, showTargetId, loginUserId });

      const pageSize = currentPage === 0 ? defaultNumber : queryLimit;
      const query = {
        apiKey: AMITY_API_KEY,
        userId: loginUserId,
        categoryId: AMITY_GLOBAL_CATEGORY_ID,
        from: currentPage === 0 ? 0 : (currentPage - 1) * queryLimit + defaultNumber,
        size: pageSize,
        query: {
          targetId: [resolvedTargetId],
          targetType: resolvedTargetType,
        },
        sort: [
          {
            createdAt: {
              order: 'desc',
            },
          },
        ],
      };

      if (resolvedSearchType === 'user') {
        query.query.postedUserId = resolvedShowTargetId;
      } else if (resolvedSearchType === 'team') {
        query.query.metadata = { team_id: resolvedShowTargetId };
      } else if (resolvedSearchType === 'gym') {
        query.query.metadata = { gym_id: resolvedShowTargetId };
      } else if (resolvedSearchType === 'gem') {
        query.query.metadata = { type: 'unityGemItemPurchased,unityGemsEarned' };
      }

      const response = await fetch(CONTENT_SEARCH_API_URL, {
        method: 'POST',
        body: JSON.stringify(query),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Content search failed (${response.status})`);
      }

      const result = await response.json();

      if (!result?.success) {
        throw new Error(result?.message || 'Content search failed');
      }

      const newData = (result?.postIds || []).map((id) => ({ postId: id }));

      if (typeof window !== 'undefined') {
        window[FEED_DEBUG_KEY] = {
          loginUserId,
          count: newData.length,
          ids: newData.slice(0, 3).map((post) => post.postId),
          currentPage,
        };
      }

      setError(null);
      setHasMore(newData.length === pageSize);

      if (currentPage === 0) {
        setData(newData);
      } else {
        setData([...dataRef.current, ...newData]);
      }
    },
    [defaultNumber, loginUserId, queryLimit, searchType, showTargetId, targetId, targetType],
  );

  useEffect(() => {
    if (!enabled || !loginUserId) {
      setLoading(false);
      setLoadingMore(false);
      setData([]);
      setHasMore(false);
      setError(null);
      return undefined;
    }

    let cancelled = false;

    async function init() {
      setLoading(true);
      setError(null);
      setPage(0);
      setHasMore(true);

      try {
        await fetchData(0);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Failed to load feed');
          setData([]);
          setHasMore(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [enabled, fetchData, loginUserId]);

  const loadMore = useCallback(async () => {
    const newPage = page + 1;
    setLoadingMore(true);
    setPage(newPage);

    try {
      await fetchData(newPage);
    } catch (err) {
      setError(err?.message || 'Failed to load feed');
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [fetchData, page]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPage(0);
    setHasMore(true);

    try {
      await fetchData(0);
    } catch (err) {
      setError(err?.message || 'Failed to load feed');
      setData([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  const prependPost = useCallback((postId) => {
    if (!postId) return;

    setData((prev) => {
      if (prev.some((post) => post.postId === postId)) {
        return prev;
      }

      return [{ postId }, ...prev];
    });
    setError(null);
  }, []);

  return {
    posts: data,
    hasMore,
    loadMore,
    loading,
    loadingMore,
    error,
    refresh,
    prependPost,
    retry: refresh,
  };
};

export default useSearchFeed;
