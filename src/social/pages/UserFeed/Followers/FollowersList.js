import { useIntl } from 'react-intl';
import React from 'react';

import useFollowersList from '~/core/hooks/useFollowersList';
import List from '~/social/pages/UserFeed/Followers/List';

const FollowersList = ({ currentUserId, profileUserId, isShowFollow, onFollwingMember, allowChat }) => {
  const { formatMessage } = useIntl();

  return (
    <List
      profileUserId={profileUserId}
      currentUserId={currentUserId}
      isShowFollow={isShowFollow}
      emptyMessage={formatMessage({ id: 'follow.placeholder.noFollowers' })}
      hook={useFollowersList}
      onFollwingMember={onFollwingMember}
      allowChat={!!allowChat}
    />
  );
};

export default FollowersList;
