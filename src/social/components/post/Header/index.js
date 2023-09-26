import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { PostTargetType } from '@amityco/js-sdk';
import { FormattedMessage } from 'react-intl';
import usePost from '~/social/hooks/usePost';
import useCommunity from '~/social/hooks/useCommunity';
import { useNavigation } from '~/social/providers/NavigationProvider';
import UIPostHeader from './UIPostHeader';

const PostHeader = ({ postId, hidePostTarget, trophies, xpTitle, teamName, loading }) => {
  const { onClickCommunity, onClickUser } = useNavigation();
  const { post, file, user } = usePost(postId);

  const { targetId, targetType, postedUserId } = post;

  // If the post is targetting a community feed, get the name of that community.
  const isCommunityPost = targetType === PostTargetType.CommunityFeed;
  const { community } = useCommunity(targetId, () => !isCommunityPost);
  const postTargetName = isCommunityPost ? community?.displayName : null;
  const handleClickCommunity = isCommunityPost ? () => onClickCommunity(targetId) : null;

  const handleClickUser = () => onClickUser(postedUserId);

  return (
    <UIPostHeader
      avatarFileUrl={file.fileUrl}
      postAuthorName={user.displayName || <FormattedMessage id="anonymous" />}
      postTargetName={postTargetName}
      isBanned={user.isGlobalBan}
      hidePostTarget={hidePostTarget}
      trophies={trophies}
      xpTitle={xpTitle}
      teamName={teamName}
      loading={loading}
      onClickCommunity={handleClickCommunity}
      onClickUser={handleClickUser}
    />
  );
};

PostHeader.propTypes = {
  postId: PropTypes.string,
  hidePostTarget: PropTypes.bool,
  trophies: PropTypes.number,
  xpTitle: PropTypes.string,
  teamName: PropTypes.string,
  loading: PropTypes.bool,
};

PostHeader.defaultProps = {
  hidePostTarget: false,
  loading: false,
};

export { UIPostHeader };
export default memo(PostHeader);
