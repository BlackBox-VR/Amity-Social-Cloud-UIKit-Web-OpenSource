import { useCallback, useEffect, useState } from 'react';
import { PostTargetType } from '@amityco/js-sdk';

import {
  AMITY_API_KEY,
  AMITY_GLOBAL_CATEGORY_ID,
  BBVR_GLOBAL_COMMUNITY_ID,
  CONTENT_SEARCH_API_URL,
} from '~/constants';

const COMMUNITY_TARGET_TYPE = 'community';

const resolveSearchParams = ({ targetType, targetId, searchType, showTargetId }) => {
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
      showTargetId: targetId,
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
}) => {
  const [page, setPage] = useState(0);
  const [data, setData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchData = useCallback(
    async (currentPage) => {
      const {
        targetType: resolvedTargetType,
        targetId: resolvedTargetId,
        searchType: resolvedSearchType,
        showTargetId: resolvedShowTargetId,
      } = resolveSearchParams({ targetType, targetId, searchType, showTargetId });

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

      const result = await response.json();
      const newData = (result?.postIds || []).map((id) => ({ postId: id }));

      setHasMore(newData.length === pageSize);

      if (currentPage === 0) {
        setData(newData);
      } else {
        setData((prev) => [...prev, ...newData]);
      }
    },
    [defaultNumber, loginUserId, queryLimit, searchType, showTargetId, targetId, targetType],
  );

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setPage(0);
      setHasMore(true);
      await fetchData(0);

      if (!cancelled) {
        setLoading(false);
      }
    }

    if (loginUserId) {
      init();
    }

    return () => {
      cancelled = true;
    };
  }, [fetchData, loginUserId]);

  const loadMore = async () => {
    const newPage = page + 1;
    setLoadingMore(true);
    setPage(newPage);
    await fetchData(newPage);
    setLoadingMore(false);
  };

  return [data, hasMore, loadMore, loading, loadingMore];
};

export default useSearchFeed;
