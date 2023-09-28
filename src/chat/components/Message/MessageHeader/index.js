import React from 'react';
import PropTypes from 'prop-types';

import { BANNER_SPRITES_URL } from '~/constants';

import {
  MessageHeaderWrapper,
  MessageHeaderAvatar,
  MessageHeaderContent,
  MessageHeaderUserName,
  XpTitle,
} from './styles';

const MessageHeader = ({ avatar, userDisplayName, bannerCode, xpTitle }) => {
  const headerBgImage = !!bannerCode ? `${BANNER_SPRITES_URL}/${bannerCode}.png` : '';

  return (
    <MessageHeaderWrapper>
      <MessageHeaderAvatar {...avatar} />
      <MessageHeaderContent background={headerBgImage}>
        <MessageHeaderUserName>{userDisplayName}</MessageHeaderUserName>
        <XpTitle>
          <span>XP Title: </span>
          {xpTitle}
        </XpTitle>
      </MessageHeaderContent>
    </MessageHeaderWrapper>
  );
};

MessageHeader.defaultProps = {
  avatar: {},
};

MessageHeader.propTypes = {
  children: PropTypes.object,
  userDisplayName: PropTypes.string,
  bannerCode: PropTypes.string,
  xpTitle: PropTypes.string,
};

export default MessageHeader;
