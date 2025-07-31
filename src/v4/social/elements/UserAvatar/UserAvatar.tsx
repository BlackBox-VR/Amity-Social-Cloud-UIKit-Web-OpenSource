import clsx from 'clsx';
import React from 'react';
import Badge from '~/v4/icons/Badge';
import { Typography } from '~/v4/core/components';
import { Button } from '~/v4/core/natives/Button';
import { useImage } from '~/v4/core/hooks/useImage';
import { useAmityElement } from '~/v4/core/hooks/uikit';
import { useUser } from '~/v4/core/hooks/objects/useUser';
import { useSDK } from '~/v4/core/hooks/useSDK';
import { useNavigation } from '~/v4/core/providers/NavigationProvider';
import { usePopupContext } from '~/v4/core/providers/PopupProvider';
import { GoldCup } from '~/v4/social/icons/gold_cup';
import styles from './UserAvatar.module.css';

type UserAvatarProps = {
  pageId?: string;
  className?: string;
  componentId?: string;
  userId?: string | null;
  isShowModeratorBadge?: boolean;
  imageContainerClassName?: string;
  textPlaceholderClassName?: string;
  shouldRedirectToUserProfile?: boolean;
  onPressAvatar?: () => void;
  userData?: Amity.User;
  showTrophies?: boolean;
  avatarSize?: 'small' | 'medium' | 'large' | number;
};

export function UserAvatar({
  userId,
  className,
  pageId = '*',
  componentId = '*',
  imageContainerClassName,
  isShowModeratorBadge = false,
  textPlaceholderClassName = '',
  shouldRedirectToUserProfile = false,
  onPressAvatar,
  userData,
  showTrophies = false,
  avatarSize = 'small',
}: UserAvatarProps) {
  const elementId = 'user_avatar';

  const { onClickUser } = useNavigation();
  const { user, isLoading } = useUser({ userId, shouldCall: !!userId });
  const sdk = useSDK();
  const currentUserId = sdk?.currentUserId || '';

  const imageFromHook = useImage({
    fileId: userData?.avatarFileId || user?.avatar?.fileId,
  });

  const userImage =
    user?.avatarCustomUrl && user?.avatarCustomUrl?.length > 0
      ? user?.avatarCustomUrl
      : imageFromHook;

  const { accessibilityId } = useAmityElement({ pageId, componentId, elementId });
  const { closePopup } = usePopupContext();

  const displayName =
    userData?.displayName || user?.displayName || userData?.userId || user?.userId || '';
  const firstChar = displayName.trim().charAt(0).toUpperCase();

  const trophies = user?.metadata?.trophies || userData?.metadata?.trophies || 0;
  let trophyText = '';
  if (trophies > 0) {
    if (trophies >= 1000) {
      trophyText = `${(trophies / 1000).toFixed(1)}K`; // e.g., 96400 -> 96.4k
    } else {
      trophyText = `${trophies}`; // e.g., 500 -> 500
    }
  }

  const sizeRem =
    typeof avatarSize === 'number'
      ? avatarSize
      : { small: 2.5, medium: 3.5, large: 5 }[avatarSize] || 3.5;

  if (isLoading && !userData) {
    return (
      <div
        className={clsx(styles.userAvatar__skeleton, className)}
        style={{ '--avatar-size': `${sizeRem}rem` } as React.CSSProperties}
      />
    );
  }

  const handleAvatarClick = () => {
    if (!userId) return;
    if (userId && shouldRedirectToUserProfile) {
      closePopup();
      onClickUser(currentUserId, undefined, displayName);
    } else if (onPressAvatar && !shouldRedirectToUserProfile) {
      onPressAvatar();
    } else {
      shouldRedirectToUserProfile && onClickUser(currentUserId, undefined, displayName);
    }
  };

  if (userImage) {
    return (
      <Button
        onPress={() => handleAvatarClick()}
        className={clsx(styles.userAvatar__container, imageContainerClassName)}
        style={{ '--avatar-size': `${sizeRem}rem` } as React.CSSProperties}
      >
        <div className={styles.userAvatar__wrapper}>
          <img
            src={userImage}
            alt={displayName || 'User avatar'} // Added for accessibility
            data-testid={accessibilityId}
            className={clsx(styles.userAvatar__img, className)}
          />
          {showTrophies && trophyText && (
            <div className={styles.userAvatar__trophy}>
              <Typography.CaptionBold className={styles.userAvatar__trophyText}>
                {trophyText} <GoldCup aria-hidden="true" />
              </Typography.CaptionBold>
            </div>
          )}
        </div>
        {isShowModeratorBadge && <Badge className={styles.userAvatar__badge} />}
      </Button>
    );
  }

  return (
    <Button
      className={clsx(styles.userAvatar__placeholder, className)}
      onPress={() => handleAvatarClick()}
      style={{ '--avatar-size': `${sizeRem}rem` } as React.CSSProperties}
    >
      <div className={styles.userAvatar__wrapper}>
        {' '}
        {/* Wrapper for consistency */}
        <Typography.TitleBold
          className={clsx(styles.userAvatar__placeholder__text, textPlaceholderClassName)}
        >
          {firstChar}
        </Typography.TitleBold>
        {showTrophies && trophyText && (
          <div className={styles.userAvatar__trophy}>
            <Typography.CaptionBold className={styles.userAvatar__trophyText}>
              {trophyText} <GoldCup aria-hidden="true" />
            </Typography.CaptionBold>
          </div>
        )}
      </div>
      {isShowModeratorBadge && <Badge className={styles.userAvatar__badge} />}
    </Button>
  );
}
