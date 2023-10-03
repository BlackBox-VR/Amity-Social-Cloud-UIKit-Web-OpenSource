import React, { useEffect, useCallback } from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { FollowRequestStatus } from '@amityco/js-sdk';
import { toHumanString } from 'human-readable-numbers';

import * as utils from '~/helpers/utils';
import withSDK from '~/core/hocs/withSDK';
import useFollowersList from '~/core/hooks/useFollowersList';
import useFollowCount from '~/core/hooks/useFollowCount';

import FollowingsList from '~/social/pages/UserFeed/Followers/FollowingsList';
import FollowersList from '~/social/pages/UserFeed/Followers/FollowersList';
import PendingList from '~/social/pages/UserFeed/Followers/PendingList';
import { FollowersTabs, PENDING_TAB } from '~/social/pages/UserFeed/Followers/constants';

const Followers = ({
  currentUserId,
  userId,
  activeTab,
  setActiveTab,
  networkSettings,
  setUserFeedTab,
  setAllTabs,
}) => {
  const isPrivateNetwork = utils.isPrivateNetwork(networkSettings);

  const { formatMessage } = useIntl();

  const { followerCount, followingCount } = useFollowCount(userId);
  const [pendingUsers] = useFollowersList(currentUserId, FollowRequestStatus.Pending);

  const isMe = currentUserId === userId;

  useEffect(() => {
    const tabs = getTabs();

    if (pendingUsers?.length && isMe && isPrivateNetwork) {
      setAllTabs(
        tabs.concat({
          value: PENDING_TAB,
          label: formatMessage({ id: 'tabs.pending' }),
        }),
      );
    } else {
      setAllTabs(tabs);
      setActiveTab(FollowersTabs.FOLLOWINGS);
    }
  }, [formatMessage, isMe, isPrivateNetwork, pendingUsers, setActiveTab]);

  const getTabs = useCallback(() => {
    const tabs = [
      {
        value: FollowersTabs.FOLLOWINGS,
        label: `${toHumanString(followingCount)} ${FollowersTabs.FOLLOWINGS}`,
      },
      {
        value: FollowersTabs.FOLLOWERS,
        label: `${toHumanString(followerCount)} ${FollowersTabs.FOLLOWERS}`,
      },
    ];

    return tabs;
  }, [followingCount, followerCount]);

  return (
    <div>
      {activeTab === FollowersTabs.FOLLOWINGS && (
        <FollowingsList currentUserId={currentUserId} profileUserId={userId} />
      )}

      {activeTab === FollowersTabs.FOLLOWERS && (
        <FollowersList
          currentUserId={currentUserId}
          profileUserId={userId}
          setUserFeedTab={setUserFeedTab}
        />
      )}

      {activeTab.includes(PENDING_TAB) && isMe && isPrivateNetwork && <PendingList />}
    </div>
  );
};

Followers.propTypes = {
  currentUserId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  networkSettings: PropTypes.object.isRequired,
  setAllTabs: PropTypes.func.isRequired,
};

export default withSDK(Followers);
