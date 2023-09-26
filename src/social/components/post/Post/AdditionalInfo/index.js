import React from 'react';
import PropTypes from 'prop-types';
import { PostTargetType } from '@amityco/js-sdk';
import { FormattedMessage } from 'react-intl';

import usePost from '~/social/hooks/usePost';
import useCommunity from '~/social/hooks/useCommunity';
import useCommunityOneMember from '~/social/hooks/useCommunityOneMember';
import { isAdmin, isModerator } from '~/helpers/permissions';

import Time from '~/core/components/Time';

import { ShieldIcon, ModeratorBadge, InfoWrapper, MessageContainer } from './styles';

const AdditionalInfo = ({ postId }) => {
  const { post, user } = usePost(postId);

  const { targetId, targetType, createdAt, editedAt } = post;
  const isCommunityPost = targetType === PostTargetType.CommunityFeed;

  const { community } = useCommunity(targetId, () => !isCommunityPost);
  const { isCommunityModerator } = useCommunityOneMember(
    community?.communityId,
    user.userId,
    community?.userId,
  );

  const showModerator = isCommunityModerator || isModerator(user?.roles) || isAdmin(user?.roles);
  const isEdited = createdAt < editedAt;

  return (
    <InfoWrapper data-qa-anchor="post-header-additional-info" showTime={!!createdAt}>
      {showModerator && (
        <ModeratorBadge data-qa-anchor="post-header-additional-info-moderator-badge">
          <ShieldIcon /> <FormattedMessage id="moderator" />
        </ModeratorBadge>
      )}

      {createdAt && <Time data-qa-anchor="post-header-additional-info-time-ago" date={createdAt} />}

      {isEdited && (
        <MessageContainer data-qa-anchor="post-header-additional-info-edited-label">
          <FormattedMessage id="post.edited" />
        </MessageContainer>
      )}
    </InfoWrapper>
  );
};

AdditionalInfo.propTypes = {
  postId: PropTypes.string,
};

export default AdditionalInfo;
