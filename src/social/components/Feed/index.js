import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { PostTargetType, FeedType, CommunityFilter } from '@amityco/js-sdk';

import { useSDK } from '~/core/hooks/useSDK';
import useCommunitiesList from '~/social/hooks/useCommunitiesList';
import useSearchFeed from '~/social/hooks/useSearchFeed';

import customizableComponent from '~/core/hocs/customization';

import DefaultPostRenderer from '~/social/components/post/Post/DefaultPostRenderer';
import PostCreator from '~/social/components/post/Creator';
import Post from '~/social/components/post/Post';
import ConditionalRender from '~/core/components/ConditionalRender';
import LoadMore from '~/social/components/LoadMore';
import PrivateFeed from '~/social/components/PrivateFeed';

import { FeedScrollContainer } from './styles';

const defaultNumber = 10;
const perPageNumber = 10;
const queryParams = { filter: CommunityFilter.Member };

const Feed = ({
  className = null,
  feedType,
  targetType = PostTargetType.MyFeed,
  targetId = '',
  searchType,
  showTargetId,
  showPostCreator = false,
  onPostCreated,
  goToExplore,
  readonly = false,
  isHiddenProfile = false,
  showOptionMenu,
}) => {
  const { currentUserId } = useSDK();

  const enablePostTargetPicker = false;
  const [page, setPage] = useState(1);

  const [posts, hasMore, loadMore, loading, loadingMore] = useSearchFeed({
    targetType,
    targetId,
    loginUserId: currentUserId,
    searchType,
    showTargetId,
    defaultNumber,
    queryLimit: perPageNumber,
  });
  const [communities, hasMoreCommunities, loadMoreCommunities] = useCommunitiesList(
    queryParams,
    false,
    () => !showPostCreator && !enablePostTargetPicker,
  );

  const renderLoadingSkeleton = () => {
    return new Array(3).fill(3).map((x, index) => <DefaultPostRenderer key={index} loading />);
  };

  const onNextPage = () => {
    setPage(page + 1);
    loadMore();
  };

  if (!loading && !hasMore && posts.length === 0) {
    return <></>;
  }

  return (
    <FeedScrollContainer
      className={posts.length > 0 || loading ? `show-padding ${className}` : className}
      dataLength={posts.length}
    >
      <ConditionalRender condition={!isHiddenProfile}>
        <>
          {showPostCreator && (
            <PostCreator
              data-qa-anchor="feed-post-creator-textarea"
              targetType={targetType}
              targetId={targetId}
              communities={communities}
              enablePostTargetPicker={enablePostTargetPicker}
              hasMoreCommunities={hasMoreCommunities}
              loadMoreCommunities={loadMoreCommunities}
              onCreateSuccess={onPostCreated}
            />
          )}

          {loading && renderLoadingSkeleton()}

          {posts.length > 0 && (
            <LoadMore
              hasMore={hasMore && !loadingMore}
              loadMore={onNextPage}
              className="load-more no-border"
            >
              {posts.map(({ postId }) => (
                <Post
                  key={postId}
                  postId={postId}
                  hidePostTarget={true}
                  readonly={readonly}
                  showOptionMenu={showOptionMenu}
                />
              ))}
              {loadingMore && renderLoadingSkeleton()}
            </LoadMore>
          )}
        </>
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
  showPostCreator: PropTypes.bool,
  goToExplore: PropTypes.func,
  readonly: PropTypes.bool,
  isHiddenProfile: PropTypes.bool,
  showOptionMenu: PropTypes.bool,
  onPostCreated: PropTypes.func,
};

export default memo(customizableComponent('Feed', Feed));
