import { FollowRequestStatus } from '@amityco/js-sdk';
import { FormattedMessage, useIntl } from 'react-intl';
import React, { useMemo } from 'react';

import useUser from '~/core/hooks/useUser';
import { formatCompactNumber } from '~/helpers/utils';
import { WEB_COMMUNITY_URL } from '~/constants';

import PaginatedList from '~/core/components/PaginatedList';
import { Grid } from '~/social/components/community/CategoryCommunitiesList/styles';
import EmptyFeedIcon from '~/icons/EmptyFeed';
import Skeleton from '~/core/components/Skeleton';
import { backgroundImage as UserImage } from '~/icons/User';
import BanIcon from '~/icons/Ban';
import GoldCup from '~/icons/GoldCup';

import {
  Header,
  UserHeaderContainer,
  ListEmptyState,
  UserHeaderAvatar,
  UserHeaderTitle,
  UserHeaderLevel,
  UserHeaderTrophies,
  UserFollow,
  FollowButton,
} from '~/social/pages/UserFeed/Followers/styles';

const UserItem = ({ userId, isShowFollow }) => {
  const { formatMessage } = useIntl();
  const { user, file } = useUser(userId, [userId]);
  const { heroLevel, trophies } = user?.metadata ?? {};

  const goToWebProfile = (username) => {
    window.open(`${WEB_COMMUNITY_URL}/member/${username}`, '_blank');
  };

  return (
    <UserHeaderContainer>
      <Header isShowFollow={isShowFollow}>
        <UserHeaderAvatar
          avatar={file.fileUrl}
          backgroundImage={UserImage}
          onClick={() => goToWebProfile(user.displayName)}
        />
        <UserHeaderTitle title={userId}>
          <span onClick={() => goToWebProfile(user.displayName)}>{user.displayName}</span>
          {user.isGlobalBan && <BanIcon />}
        </UserHeaderTitle>
        {!isShowFollow && <UserHeaderLevel>LVL {parseInt(heroLevel ?? 0)}</UserHeaderLevel>}
        <UserHeaderTrophies>
          {formatCompactNumber(trophies)} <GoldCup />
        </UserHeaderTrophies>
        {isShowFollow && (
          <UserFollow>
            <FollowButton>{formatMessage({ id: 'follow.button.label' })}</FollowButton>
          </UserFollow>
        )}
      </Header>
    </UserHeaderContainer>
  );
};

const List = ({ profileUserId, isShowFollow, hook, emptyMessage }) => {
  const [followings, hasMore, loadMore, loading, loadingMore] = hook(
    profileUserId,
    FollowRequestStatus.Accepted,
  );

  const items = useMemo(() => {
    function getLoadingItems() {
      return new Array(5).fill(1).map((x, index) => ({ userId: index, skeleton: true }));
    }

    if (loading) {
      return getLoadingItems();
    }

    if (!loadingMore) {
      return followings;
    }

    return [...followings, ...getLoadingItems()];
  }, [followings, loading, loadingMore]);

  return (
    <PaginatedList
      items={items}
      hasMore={hasMore}
      loadMore={loadMore}
      container={Grid}
      emptyState={
        <ListEmptyState
          icon={<EmptyFeedIcon width={48} height={48} />}
          title="It's empty here..."
          description={emptyMessage}
        />
      }
    >
      {({ skeleton, userId }) =>
        skeleton ? (
          <Skeleton key={userId} count={3} style={{ fontSize: 8 }} />
        ) : (
          <UserItem key={userId} userId={userId} isShowFollow={isShowFollow} />
        )
      }
    </PaginatedList>
  );
};

export default List;
