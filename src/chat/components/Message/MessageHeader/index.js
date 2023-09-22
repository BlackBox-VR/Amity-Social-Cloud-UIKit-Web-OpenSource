import React from 'react';
import PropTypes from 'prop-types';

import {
  MessageHeaderWrapper,
  MessageHeaderAvatar,
  MessageHeaderContent,
  MessageHeaderUserName,
  XpTitle,
} from './styles';

const MessageHeader = ({ avatar, userId }) => {
  return (
    <MessageHeaderWrapper>
      <MessageHeaderAvatar {...avatar} />
      <MessageHeaderContent background={''}>
        <MessageHeaderUserName>Prestonlewis</MessageHeaderUserName>
        <XpTitle>
          <span>XP Title: </span>
          1-Valarian
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
};

export default MessageHeader;
