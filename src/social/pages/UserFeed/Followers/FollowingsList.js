import { useIntl } from 'react-intl';
import React from 'react';

import useFollowingsList from '~/core/hooks/useFollowingsList';
import List from '~/social/pages/UserFeed/Followers/List';

const FollowingsList = ({ currentUserId, profileUserId, allowChat }) => {
  const { formatMessage } = useIntl();

  return (
    <List
      profileUserId={profileUserId}
      currentUserId={currentUserId}
      emptyMessage={formatMessage({ id: 'follow.placeholder.noFollowings' })}
      hook={useFollowingsList}
      allowChat={!!allowChat}
    />
  );
};

export default FollowingsList;
