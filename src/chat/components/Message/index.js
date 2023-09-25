import React from 'react';
import PropTypes from 'prop-types';
import { FormattedTime } from 'react-intl';
import { MessageType } from '@amityco/js-sdk';

import customizableComponent from '~/core/hocs/customization';
import { backgroundImage as UserImage } from '~/icons/User';

import Options from './Options';
import MessageContent from './MessageContent';
import MessageHeader from './MessageHeader';

import {
  Avatar,
  AvatarWrapper,
  MessageReservedRow,
  MessageWrapper,
  MessageContainer,
  GeneralMessageBody,
  DeletedMessageBody,
  UnsupportedMessageBody,
  MemberActivityAutoPostBody,
  SharedQuestsAutoPostBody,
  AnnouncementsAutoPostBody,
  ArenaRaidAutoPostBody,
  UserName,
  BottomLine,
  MessageDate,
} from './styles';

const MessageBody = ({
  isDeleted,
  type,
  isSupportedMessageType,
  isMemberActivityAutoPost,
  isSharedQuestAutoPost,
  isAnnouncementsAutoPost,
  isArenaRaidAutoPost,
  ...otherProps
}) => {
  if (isMemberActivityAutoPost) {
    return <MemberActivityAutoPostBody {...otherProps} data-qa-anchor="message-body-auto-post" />;
  }

  if (isSharedQuestAutoPost) {
    return <SharedQuestsAutoPostBody {...otherProps} data-qa-anchor="message-body-auto-post" />;
  }

  if (isAnnouncementsAutoPost) {
    return <AnnouncementsAutoPostBody {...otherProps} data-qa-anchor="message-body-auto-post" />;
  }

  if (isArenaRaidAutoPost) {
    return <ArenaRaidAutoPostBody {...otherProps} data-qa-anchor="message-body-auto-post" />;
  }

  if (isDeleted) {
    return <DeletedMessageBody {...otherProps} data-qa-anchor="message-body-deleted" />;
  }

  if (!isSupportedMessageType) {
    return <UnsupportedMessageBody {...otherProps} data-qa-anchor="message-body-unsupported" />;
  }

  return <GeneralMessageBody {...otherProps} data-qa-anchor="message-body-general" />;
};

const Message = ({
  messageId,
  avatar,
  type,
  data,
  createdAt,
  isDeleted,
  isIncoming,
  isConsequent,
  userDisplayName,
  containerRef,
  messageTags,
  userId,
}) => {
  const shouldShowUserName = isIncoming && !isConsequent && userDisplayName;
  const isSupportedMessageType = [MessageType.Text, MessageType.Custom].includes(type);

  const isAutoPost = messageTags != null && messageTags.indexOf('autopost') > -1;
  const isMemberActivityAutoPost = isAutoPost && messageTags.indexOf('memberActivity') > -1;
  const isSharedQuestAutoPost = isAutoPost && messageTags.indexOf('sharedQuests') > -1;
  const isAnnouncementsAutoPost = isAutoPost && messageTags.indexOf('announcements') > -1;
  const isArenaRaidAutoPost = isAutoPost && messageTags.indexOf('arenaRaid') > -1;

  const getAvatarProps = () => {
    if (avatar) return { avatar };
    return { backgroundImage: UserImage };
  };

  return (
    <MessageReservedRow isIncoming={isIncoming}>
      <MessageWrapper>
        {!isAutoPost && (
          <AvatarWrapper>{!isConsequent && <Avatar {...getAvatarProps()} />}</AvatarWrapper>
        )}
        <MessageContainer data-qa-anchor="message">
          {!isAutoPost && <UserName>{userDisplayName}</UserName>}
          <MessageBody
            type={type}
            isIncoming={isIncoming}
            isDeleted={isDeleted}
            isSupportedMessageType={isSupportedMessageType}
            isMemberActivityAutoPost={isMemberActivityAutoPost}
            isSharedQuestAutoPost={isSharedQuestAutoPost}
            isAnnouncementsAutoPost={isAnnouncementsAutoPost}
            isArenaRaidAutoPost={isArenaRaidAutoPost}
          >
            {isMemberActivityAutoPost && (
              <MessageHeader
                avatar={getAvatarProps()}
                userId={userId}
                userDisplayName={userDisplayName}
              />
            )}
            <MessageContent data={data} type={type} isDeleted={isDeleted} />
            {!isDeleted && (
              <BottomLine>
                <MessageDate>
                  <FormattedTime value={createdAt} />
                </MessageDate>
                {!isAutoPost && (
                  <Options
                    messageId={messageId}
                    data={data}
                    isIncoming={isIncoming}
                    isSupportedMessageType={isSupportedMessageType}
                    popupContainerRef={containerRef}
                  />
                )}
              </BottomLine>
            )}
          </MessageBody>
        </MessageContainer>
      </MessageWrapper>
    </MessageReservedRow>
  );
};

Message.propTypes = {
  messageId: PropTypes.string.isRequired,
  type: PropTypes.oneOf(Object.values(MessageType)).isRequired,
  data: PropTypes.object.isRequired,
  createdAt: PropTypes.instanceOf(Date),
  userDisplayName: PropTypes.string,
  isDeleted: PropTypes.bool,
  isIncoming: PropTypes.bool,
  isConsequent: PropTypes.bool,
  avatar: PropTypes.string,
  containerRef: PropTypes.object.isRequired,
  messageTags: PropTypes.array,
  userId: PropTypes.string,
};

Message.defaultProps = {
  userDisplayName: '',
  avatar: '',
  isDeleted: false,
  isIncoming: false,
  isConsequent: false,
  messageTags: [],
  userId: '',
};

export default customizableComponent('Message', Message);
