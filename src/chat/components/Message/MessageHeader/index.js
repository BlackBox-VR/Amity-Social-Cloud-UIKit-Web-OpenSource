import React from 'react';
import PropTypes from 'prop-types';

import { ATHENA_API_URL, BANNER_SPRITES_URL } from '~/constants';
import { useGETRequest } from '~/hooks/useApiResponse';

import {
  MessageHeaderWrapper,
  MessageHeaderAvatar,
  MessageHeaderContent,
  MessageHeaderUserName,
  XpTitle,
} from './styles';

const MessageHeader = ({ avatar, userId, userDisplayName }) => {
  const { data } = useGETRequest(`${ATHENA_API_URL}/gettitleandbannerdetails?userid=${userId}`);

  const bannerCode = (data?.results?.profile_banner || '').toLowerCase();
  const xpTitle = data?.results?.xp_title || '';

  return (
    <MessageHeaderWrapper>
      <MessageHeaderAvatar {...avatar} />
      <MessageHeaderContent
        background={bannerCode ? `${BANNER_SPRITES_URL}/${bannerCode}.png` : ''}
      >
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
  userId: PropTypes.string,
  userDisplayName: PropTypes.string,
};

export default MessageHeader;
