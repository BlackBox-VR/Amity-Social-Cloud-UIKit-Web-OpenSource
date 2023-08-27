import { useIntl } from 'react-intl';
import React from 'react';

import useFollowingsList from '~/core/hooks/useFollowingsList';
import List from '~/social/pages/UserFeed/Followers/List';

const FollowingsList = ({ currentUserId, profileUserId, setUserFeedTab }) => {
  const { formatMessage } = useIntl();
  return (
    <List
      profileUserId={profileUserId}
      currentUserId={currentUserId}
      emptyMessage={"Not following anyone yet"}
      hook={useFollowingsList}
      setUserFeedTab={setUserFeedTab}
    />
  );
};

export default FollowingsList;
