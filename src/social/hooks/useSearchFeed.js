import { useCallback, useEffect, useRef, useState } from 'react';
import { PostTargetType } from '@amityco/js-sdk';

import {
  AMITY_API_KEY,
  AMITY_GLOBAL_CATEGORY_ID,
  BBVR_GLOBAL_COMMUNITY_ID,
  CONTENT_SEARCH_API_URL,
} from '~/constants';

const COMMUNITY_TARGET_TYPE = 'community';

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
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(true);

  const abortInflightRequest = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  const fetchData = useCallback(
    async (currentPage) => {
      abortInflightRequest();

      const controller = new AbortController();
      abortControllerRef.current = controller;
      const { signal } = controller;

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

      try {
        const response = await fetch(CONTENT_SEARCH_API_URL, {
          method: 'POST',
          body: JSON.stringify(query),
          headers: {
            'Content-Type': 'application/json',
          },
          signal,
        });

        if (signal.aborted) {
          return false;
        }

        if (!response.ok) {
          throw new Error(`Content search failed (${response.status})`);
        }

        const result = await response.json();

        if (signal.aborted) {
          return false;
        }

        if (!result?.success) {
          throw new Error(result?.message || 'Content search failed');
        }

        const newData = (result?.postIds || []).map((id) => ({ postId: id }));

        setError(null);
        setHasMore(newData.length === pageSize);

        if (currentPage === 0) {
          setData(newData);
        } else {
          setData((prev) => [...prev, ...newData]);
        }

        return true;
      } catch (err) {
        if (err?.name === 'AbortError' || signal.aborted) {
          return false;
        }

        setError(err?.message || 'Failed to load feed');

        if (currentPage === 0) {
          setData([]);
        }

        setHasMore(false);
        return false;
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [
      abortInflightRequest,
      defaultNumber,
      loginUserId,
      queryLimit,
      searchType,
      showTargetId,
      targetId,
      targetType,
    ],
  );

  const refresh = useCallback(async () => {
    if (!mountedRef.current) {
      return;
    }

    setLoading(true);
    setError(null);
    setPage(0);
    setHasMore(true);

    try {
      await fetchData(0);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
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

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      abortInflightRequest();
    };
  }, [abortInflightRequest]);

  useEffect(() => {
    if (!enabled) {
      abortInflightRequest();
      setLoading(false);
      setLoadingMore(false);
      setError(null);
      setData([]);
      setHasMore(false);
      return undefined;
    }

    if (!loginUserId) {
      abortInflightRequest();
      setLoading(false);
      setData([]);
      setHasMore(false);
      return undefined;
    }

    let active = true;

    async function init() {
      setLoading(true);
      setError(null);
      setPage(0);
      setHasMore(true);

      try {
        await fetchData(0);
      } finally {
        if (active && mountedRef.current) {
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      active = false;
      abortInflightRequest();
    };
  }, [abortInflightRequest, enabled, fetchData, loginUserId]);

  const loadMore = useCallback(async () => {
    if (!mountedRef.current) {
      return;
    }

    const newPage = page + 1;
    setLoadingMore(true);

    try {
      setPage(newPage);
      await fetchData(newPage);
    } finally {
      if (mountedRef.current) {
        setLoadingMore(false);
      }
    }
  }, [fetchData, page]);

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
