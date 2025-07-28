import React, { useEffect, useState } from 'react';
import { useAmityComponent } from '~/v4/core/hooks/uikit';
import { PostContent } from '~/v4/social/components/PostContent';
import {
  AmityPostCategory,
  AmityPostContentComponentStyle,
} from '~/v4/social/components/PostContent/PostContent';
import usePostsCollection from '~/v4/social/hooks/collections/usePostsCollection';
import EmptyPost from '~/v4/icons/EmptyPost';
import useCommunity from '~/v4/core/hooks/collections/useCommunity';
import LockPrivateContent from '~/v4/social/internal-components/LockPrivateContent';
import { Button } from '~/v4/core/natives/Button';
import { usePageBehavior } from '~/v4/core/providers/PageBehaviorProvider';
import usePinnedPostsCollection from '~/v4/social/hooks/collections/usePinnedPostCollection';
import { Typography } from '~/v4/core/components';
import useIntersectionObserver from '~/v4/core/hooks/useIntersectionObserver';
import { NoInternetConnectionHoc } from '~/v4/social/internal-components/NoInternetConnection/NoInternetConnectionHoc';
import styles from './LiveStreamsFeed.module.css';
import { useLiveStreamParentPosts } from '~/v4/social/hooks/useLiveStreamParentPosts';

export const LiveStreamFeedPostContentSkeleton = () => {
  return (
    <div className={styles.liveStreamFeed__postSkeleton}>
      <div className={styles.liveStreamFeed__postSkeletonHeader}>
        <div className={styles.liveStreamFeed__postSkeletonAvatar}></div>
        <div className={styles.liveStreamFeed__postSkeletonUserInfo}>
          <div className={styles.liveStreamFeed__postSkeletonUsername}></div>
          <div className={styles.liveStreamFeed__postSkeletonSubtitle}></div>
        </div>
      </div>
      <div className={styles.liveStreamFeed__postSkeletonContent}>
        <div className={styles.liveStreamFeed__postSkeletonLine}></div>
        <div className={styles.liveStreamFeed__postSkeletonLine}></div>
        <div className={styles.liveStreamFeed__postSkeletonLine}></div>
      </div>
    </div>
  );
};

interface LiveStreamFeedProps {
  communityId: string;
  pageId?: string;
}

export const LiveStreamFeed = ({ pageId = '*', communityId }: LiveStreamFeedProps) => {
  const componentId = 'livestream_feed_component';
  const { isExcluded, accessibilityId, themeStyles } = useAmityComponent({
    pageId,
    componentId,
  });

  const { community } = useCommunity({ communityId, shouldCall: !!communityId });

  const {
    posts,
    hasMore,
    loadMore,
    isLoading,
    refresh: refreshPosts,
  } = usePostsCollection({
    feedType: 'published',
    targetId: communityId,
    targetType: 'community',
    dataTypes: ['liveStream'],
    limit: 10,
  });

  const parentPosts = useLiveStreamParentPosts(posts);

  const { pinnedPost: allPinnedPost, refresh: refreshPinnedPosts } = usePinnedPostsCollection({
    communityId,
    shouldCall: !!communityId && community?.isJoined,
  });

  const { AmityCommunityProfilePageBehavior } = usePageBehavior();

  const [intersectionNode, setIntersectionNode] = useState<HTMLDivElement | null>(null);

  const announcementPosts =
    allPinnedPost?.filter((item) => item?.placement === 'announcement' && item?.post) || [];

  const pinnedPosts =
    allPinnedPost.length > 0
      ? allPinnedPost.filter(
          (item) =>
            item?.placement === 'default' &&
            item?.post &&
            !announcementPosts.map((aItem) => aItem?.post?.postId).includes(item?.post?.postId),
        )
      : null;

  const filteredPosts = parentPosts.filter(
    (post) =>
      post &&
      !announcementPosts.some(
        (announcementPost) => announcementPost?.post?.postId === post?.postId,
      ),
  );

  const filteredPostWithPlacement: (Amity.Post & { placement?: string })[] = filteredPosts.map(
    (post) => {
      const matchedPinnedPost = pinnedPosts?.find(
        (pinned) => pinned?.post?.postId === post?.postId,
      );
      if (matchedPinnedPost)
        return {
          ...post,
          placement: matchedPinnedPost.placement,
        };
      return post;
    },
  );

  useIntersectionObserver({
    node: intersectionNode,
    onIntersect: () => {
      if (hasMore && !isLoading) loadMore();
    },
  });

  useEffect(() => {
    refreshPosts();
    refreshPinnedPosts();
  }, []);

  if (isExcluded) return null;

  const handlePostNavigation = (postId?: string, category?: AmityPostCategory) => {
    if (!postId) return;

    AmityCommunityProfilePageBehavior?.goToPostDetailPage?.({
      postId,
      hideTarget: true,
      category: category || AmityPostCategory.GENERAL,
    });
  };

  const renderPublicLiveStreamFeed = () => {
    return (
      <>
        {filteredPostWithPlacement.length > 0 &&
          filteredPostWithPlacement
            .filter((post) => post && !!post.postId)
            .map((post) => {
              if (!post || !post.postId) return null;

              const category =
                post?.placement === 'default' ? AmityPostCategory.PIN : AmityPostCategory.GENERAL;

              return (
                <Button
                  key={post.postId}
                  className={styles.liveStreamFeed__postContent}
                  onPress={() => handlePostNavigation(post.postId, category)}
                >
                  <PostContent
                    pageId={pageId}
                    key={post.postId}
                    post={post}
                    category={category}
                    style={AmityPostContentComponentStyle.FEED}
                    hideTarget
                    onClick={() => handlePostNavigation(post.postId, category)}
                  />
                </Button>
              );
            })}
        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <LiveStreamFeedPostContentSkeleton key={index} />
          ))}
        {parentPosts?.length === 0 && !isLoading && (
          <div className={styles.liveStreamFeed__emptyPost}>
            <EmptyPost className={styles.liveStreamFeed__emptyPostIcon} />
            <Typography.Body className={styles.liveStreamFeed__emptyPostText}>
              No posts yet
            </Typography.Body>
          </div>
        )}
        <div
          ref={(node) => setIntersectionNode(node)}
          className={styles.liveStreamFeed__observerTarget}
        />
      </>
    );
  };

  return (
    <div
      data-testid={accessibilityId}
      className={styles.liveStreamFeed__container}
      style={themeStyles}
    >
      <NoInternetConnectionHoc
        page="feed"
        refresh={() => {
          refreshPosts();
          refreshPinnedPosts();
        }}
        className={styles.liveStreamFeed__noInternet}
      >
        <>
          {community?.isJoined || community?.isPublic ? (
            <>{renderPublicLiveStreamFeed()}</>
          ) : isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <LiveStreamFeedPostContentSkeleton key={index} />
            ))
          ) : (
            <LockPrivateContent />
          )}
        </>
      </NoInternetConnectionHoc>
    </div>
  );
};
