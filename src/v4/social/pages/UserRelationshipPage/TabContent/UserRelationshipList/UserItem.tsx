import React, { FC } from 'react';
import { useIntl } from 'react-intl';
import styles from './UserItem.module.css';
import { Button } from '~/v4/core/natives/Button';
import { Typography } from '~/v4/core/components';
import { UserAvatar } from '~/v4/social/elements/UserAvatar';
import { useUser } from '~/v4/core/hooks/objects/useUser';
import { useDrawer } from '~/v4/core/providers/DrawerProvider';
import { Popover } from '~/v4/core/components/AriaPopover';
import { UserItemMenu } from './UserItemMenu';
import { useNavigation } from '~/v4/core/providers/NavigationProvider';
import { useSDK } from '~/v4/core/hooks/useSDK';
import useUserFollow from '~/v4/social/hooks/useUserFollow';
import { GoldCup } from '~/v4/social/icons/gold_cup';
import useFollowCount from '~/v4/core/hooks/objects/useFollowCount';

type UserItemProps = {
  userId: string;
  pageId?: string;
  componentId?: string;
  isShowFollow?: boolean;
};

export const UserItem: FC<UserItemProps> = ({
  userId,
  pageId = '*',
  componentId = '*',
  isShowFollow,
}) => {
  const { formatMessage } = useIntl();
  const { goToUserProfilePage } = useNavigation();
  const { setDrawerData } = useDrawer();
  const { followUser, unFollowUser } = useUserFollow();
  const currentUserId = useSDK()?.currentUserId || '';

  const { user } = useUser({ userId });
  const { followStatus, pendingCount } = useFollowCount(user?.userId);
  const { heroLevel, trophies } = user?.metadata ?? {};

  let trophyText = '';
  if (trophies >= 1000) {
    trophyText = `${(trophies / 1000).toFixed(1)}K`; // e.g., 96400 -> 96.4k
  } else {
    trophyText = `${trophies}`; // e.g., 500 -> 500
  }

  if (!user) return null;

  const onFollow = () => {
    if (followStatus === 'none') {
      followUser(user.userId);
    } else {
      unFollowUser({ userId: user.userId, pageId });
    }
  };

  return (
    <div className={styles.userItem}>
      <Button
        onPress={() => goToUserProfilePage(currentUserId, user.displayName)}
        className={styles.userItem__buttonWrap}
      >
        <UserAvatar
          pageId={pageId}
          componentId={componentId}
          userId={user.userId}
          className={styles.userItem__avatar}
        />

        <Typography.BodyBold className={styles.userItem__displayName}>
          {user.displayName}
        </Typography.BodyBold>
      </Button>
      <div className={styles.userItem__stats}>
        {!isShowFollow && (
          <div className={styles.userItem__userLevel}>LVL {parseInt(heroLevel ?? 0)}</div>
        )}
        <div className={styles.userItem__userTrophies}>
          {trophyText} <GoldCup />
        </div>
      </div>
      {isShowFollow && (
        <div className={styles.userItem__userFollow}>
          <Button
            className={styles.userItem__followButton}
            isDisabled={followStatus !== 'none'}
            onPress={onFollow}
          >
            {followStatus === 'none'
              ? formatMessage({ id: 'follow.button.label' })
              : formatMessage({ id: 'following.button.label' })}
          </Button>
        </div>
      )}
      {/* <Popover
        trigger={{
          pageId,
          componentId,
          className: styles.userItem__menuButton,
          onClick: ({ closePopover }) =>
            setDrawerData({
              content: <UserItemMenu closePopover={closePopover} user={user} />,
            }),
        }}
      >
        {({ closePopover }) => <UserItemMenu closePopover={closePopover} user={user} />}
      </Popover> */}
    </div>
  );
};
