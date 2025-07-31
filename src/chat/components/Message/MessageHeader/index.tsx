import React from 'react';

import { BANNER_SPRITES_URL } from '~/constants';
import { AvatarProps } from '~/core/components/Avatar';

import {
  MessageHeaderWrapper,
  MessageHeaderAvatar,
  MessageHeaderContent,
  MessageHeaderUserName,
  XpTitle,
} from './styles';

interface MessageHeaderProps {
  avatar: AvatarProps;
  userDisplayName: string;
  bannerCode?: string;
  xpTitle?: string;
}

const MessageHeader = ({ avatar, userDisplayName, bannerCode, xpTitle }: MessageHeaderProps) => {
  const headerBgImage = bannerCode ? `${BANNER_SPRITES_URL}/${bannerCode}.png` : '';

  return (
    <MessageHeaderWrapper background={headerBgImage}>
      <MessageHeaderAvatar {...avatar} />
      <MessageHeaderContent>
        <MessageHeaderUserName>{userDisplayName}</MessageHeaderUserName>
        <XpTitle>
          <span>XP Title: </span>
          {xpTitle}
        </XpTitle>
      </MessageHeaderContent>
    </MessageHeaderWrapper>
  );
};

export default React.memo(MessageHeader);
