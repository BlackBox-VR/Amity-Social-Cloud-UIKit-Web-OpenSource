import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { PostTargetType, FeedType, CommunityFilter } from '@amityco/js-sdk';

import { useSDK } from '~/core/hooks/useSDK';
import useCommunitiesList from '~/social/hooks/useCommunitiesList';
import useFeed from '~/social/hooks/useFeed';
import useSearchFeed from '~/social/hooks/useSearchFeed';

import customizableComponent from '~/core/hocs/customization';

import DefaultPostRenderer from '~/social/components/post/Post/DefaultPostRenderer';
import PostCreator from '~/social/components/post/Creator';
import Post from '~/social/components/post/Post';
import ConditionalRender from '~/core/components/ConditionalRender';
import EmptyFeed from '~/social/components/EmptyFeed';
import LoadMore from '~/social/components/LoadMore';
import PrivateFeed from '~/social/components/PrivateFeed';

import { FeedScrollContainer, FeedError } from './styles';

const defaultNumber = 10;
const perPageNumber = 10;
const queryParams = { filter: CommunityFilter.Member };

const renderLoadingSkeleton = () =>
  new Array(3).fill(3).map((x, index) => <DefaultPostRenderer key={index} loading />);

const Feed = ({
  className = null,
  feedType,
  targetType = PostTargetType.MyFeed,
  targetId = '',
  searchType,
  showTargetId,
  useContentSearch = false,
  showPostCreator = false,
  onPostCreated,
  goToExplore,
  readonly = false,
  isHiddenProfile = false,
  showOptionMenu,
  isHideWhenEmpty = false,
}) => {
  const { currentUserId } = useSDK();
  const enablePostTargetPicker = false;

  const sdkFeed = useFeed({
    targetType,
    targetId,
    feedType,
  });
  const contentSearchFeed = useSearchFeed({
    targetType,
    targetId,
    loginUserId: currentUserId,
    searchType,
    showTargetId,
    defaultNumber,
    queryLimit: perPageNumber,
    enabled: useContentSearch,
  });

  const [posts, hasMore, loadMore, loading, loadingMore] = useContentSearch
    ? [
        contentSearchFeed.posts,
        contentSearchFeed.hasMore,
        contentSearchFeed.loadMore,
        contentSearchFeed.loading,
        contentSearchFeed.loadingMore,
      ]
    : sdkFeed;

  const { error, prependPost, retry } = useContentSearch
    ? contentSearchFeed
    : { error: null, prependPost: () => {}, retry: () => {} };

  const [communities, hasMoreCommunities, loadMoreCommunities] = useCommunitiesList(
    queryParams,
    false,
    () => !showPostCreator && !enablePostTargetPicker,
  );

  const handlePostCreated = (postId) => {
    if (useContentSearch) {
      prependPost(postId);
    }

    onPostCreated?.(postId);
  };

  if (isHideWhenEmpty && useContentSearch && !loading && !error && !hasMore && posts.length === 0) {
    return null;
  }

  const showEmptyFeed = !loading && !error && posts.length === 0;
  const containerClassName =
    useContentSearch && (posts.length > 0 || loading)
      ? `show-padding ${className || ''}`
      : className;

  const getVisiblePosts = () => {
    if (useContentSearch) {
      return posts;
    }

    if (targetType === PostTargetType.GlobalFeed) {
      return [...posts].sort((a, b) => b.createdAt - a.createdAt);
    }

    return posts
      .filter((post) => post.postedUserId === targetId)
      .sort((a, b) => b.createdAt - a.createdAt);
  };

  return (
    <FeedScrollContainer className={containerClassName} dataLength={posts.length}>
      <ConditionalRender condition={!isHiddenProfile}>
        {showPostCreator && (
          <PostCreator
            data-qa-anchor="feed-post-creator-textarea"
            targetType={targetType}
            targetId={targetId}
            communities={communities}
            enablePostTargetPicker={enablePostTargetPicker}
            hasMoreCommunities={hasMoreCommunities}
            loadMoreCommunities={loadMoreCommunities}
            onCreateSuccess={handlePostCreated}
          />
        )}

        {loading && renderLoadingSkeleton()}

        {error && (
          <FeedError>
            <p>{error}</p>
            <button type="button" onClick={retry}>
              Retry
            </button>
          </FeedError>
        )}

        {!loading &&
          posts.length > 0 &&
          !useContentSearch &&
          targetType !== PostTargetType.GlobalFeed &&
          posts.filter((post) => post.postedUserId === targetId).length < 10 &&
          hasMore &&
          loadMore()}

        {!loading && posts.length > 0 && (
          <LoadMore
            hasMore={hasMore && !loadingMore}
            loadMore={loadMore}
            className="load-more no-border"
          >
            {getVisiblePosts().map(({ postId }) => (
              <Post
                key={postId}
                postId={postId}
                hidePostTarget
                readonly={readonly}
                showOptionMenu={showOptionMenu}
              />
            ))}
            {loadingMore && renderLoadingSkeleton()}
          </LoadMore>
        )}

        {showEmptyFeed && (
          <EmptyFeed
            targetType={targetType}
            goToExplore={goToExplore}
            canPost={showPostCreator}
            feedType={feedType}
          />
        )}
        <PrivateFeed />
      </ConditionalRender>
    </FeedScrollContainer>
  );
};

Feed.propTypes = {
  className: PropTypes.string,
  feedType: PropTypes.oneOf(Object.values(FeedType)),
  targetType: PropTypes.oneOf(Object.values(PostTargetType)),
  targetId: PropTypes.string,
  searchType: PropTypes.string,
  showTargetId: PropTypes.string,
  useContentSearch: PropTypes.bool,
  showPostCreator: PropTypes.bool,
  goToExplore: PropTypes.func,
  readonly: PropTypes.bool,
  isHiddenProfile: PropTypes.bool,
  showOptionMenu: PropTypes.bool,
  isHideWhenEmpty: PropTypes.bool,
  onPostCreated: PropTypes.func,
};

export default memo(customizableComponent('Feed', Feed));
