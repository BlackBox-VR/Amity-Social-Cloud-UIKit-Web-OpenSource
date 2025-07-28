import { useMemo } from 'react';
import usePostByIds from '~/v4/core/hooks/usePostByIds';

export function useLiveStreamParentPosts(posts: Amity.Post[]) {
  const parentPostIds = useMemo(
    () => posts.map((p) => p.parentPostId).filter(Boolean),
    [posts],
  ) as string[];

  const parentPosts = usePostByIds(parentPostIds);

  return useMemo(() => {
    return posts
      .filter((post) => !post.isDeleted)
      .map((post) => {
        if (post.dataType === 'liveStream' && post.parentPostId) {
          const parentPost = parentPosts.find(
            (p) => p.postId === post.parentPostId && !p.isDeleted,
          );

          if (parentPost) {
            return parentPost;
          }
        }
      });
  }, [posts, parentPosts]);
}
