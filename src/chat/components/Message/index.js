import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FormattedTime } from 'react-intl';
import { MessageType } from '@amityco/js-sdk';

import customizableComponent from '~/core/hocs/customization';
import { backgroundImage as UserImage } from '~/icons/User';

import Options from './Options';
import MessageContent from './MessageContent';
import MessageHeader from './MessageHeader';
import MessageClaim from './MessageClaim';
import ReactionsTray from './ReactionsTray';

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
  bannerCode,
  xpTitle,
  metadata,
  client,
}) => {
  const isSupportedMessageType = [MessageType.Text, MessageType.Custom].includes(type);

  // Auto-post based state variables
  const isAutoPost = messageTags != null && messageTags.indexOf('autopost') > -1;
  const isMemberActivityAutoPost = isAutoPost && messageTags.indexOf('memberActivity') > -1;
  const isSharedQuestAutoPost = isAutoPost && messageTags.indexOf('sharedQuests') > -1;
  const isAnnouncementsAutoPost = isAutoPost && messageTags.indexOf('announcements') > -1;
  const isArenaRaidAutoPost = isAutoPost && messageTags.indexOf('arenaRaid') > -1;

  // Reaction tray state variables
  const [showReactions, setShowReactions] = useState(false);
  const [reactionTrayPosition, setReactionTrayPosition] = useState({ x: 0, y: 0 });
  const longPressTimer = useRef(null);
  const messageRef = useRef(null);

  const getAvatarProps = () => {
    if (avatar) return { avatar };
    return { backgroundImage: UserImage };
  };

  const handleLongPress = useCallback((event) => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    const rect = messageRef.current.getBoundingClientRect();
    setReactionTrayPosition({
      x: event ? event.clientX - rect.left : rect.width / 2,
      y: event ? event.clientY - rect.top : 0,
    });
    setShowReactions(true);
    console.log("AB - setShowReactions called.");
  }, []);
  
  const handleTouchStart = useCallback((event) => {
    longPressTimer.current = setTimeout(() => handleLongPress(event), 500);
  }, [handleLongPress]);
  
  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  }, []);

  const handleReact = useCallback((reaction) => {
    // We'll implement this in a later step when we add the API call
    console.log(`React with ${reaction} to message ${messageId}`);
    setShowReactions(false);
  }, [messageId]);

  function timeDifference(timestamp, locale) {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;
  
    const current = Date.now();
    const elapsed = current - timestamp;
  
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  
    if (elapsed < 5000){
      return "just now";
    }

    if (elapsed < msPerMinute) {
      return rtf.format(-Math.floor(elapsed / 1000), "seconds");
    } else if (elapsed < msPerHour) {
      return rtf.format(-Math.floor(elapsed / msPerMinute), "minutes");
    } else if (elapsed < msPerDay) {
      return rtf.format(-Math.floor(elapsed / msPerHour), "hours");
    } else {
      const formattedDate = new Date(timestamp);
      const options = { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" };
      return formattedDate.toLocaleDateString(locale, options);
    }
} 

  return (
    <MessageReservedRow isIncoming={isIncoming}>
      <MessageWrapper isAutoPost={isAutoPost}>
        {!isAutoPost && isIncoming && (
          <AvatarWrapper>{!isConsequent && <Avatar {...getAvatarProps()} />}</AvatarWrapper>
        )}
        <MessageContainer data-qa-anchor="message" ref={messageRef}>
          {/*!isAutoPost && <UserName>{userDisplayName}</UserName>*/}
          <MessageBody
            type={type}
            isIncoming={isIncoming}
            isDeleted={isDeleted}
            isSupportedMessageType={isSupportedMessageType}
            isMemberActivityAutoPost={isMemberActivityAutoPost}
            isSharedQuestAutoPost={isSharedQuestAutoPost}
            isAnnouncementsAutoPost={isAnnouncementsAutoPost}
            isArenaRaidAutoPost={isArenaRaidAutoPost}
            onMouseDown={(e) => handleTouchStart(e)}
            onMouseUp={handleTouchEnd}
            onTouchStart={(e) => handleTouchStart(e)}
            onTouchEnd={handleTouchEnd}
          >
            {!isAutoPost && <UserName>{userDisplayName}</UserName>}
            {isMemberActivityAutoPost && (
              <MessageHeader
                avatar={getAvatarProps()}
                userDisplayName={userDisplayName}
                bannerCode={bannerCode}
                xpTitle={xpTitle}
              />
            )}
            <MessageContent data={data} type={type} isDeleted={isDeleted} />
            {!isDeleted && (
              <BottomLine>
                <MessageDate>
                  {timeDifference(createdAt, "en")}
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
            {isMemberActivityAutoPost && metadata?.carePointsReward > 0 &&
              <MessageClaim
                messageId={messageId}
                metadata={metadata}
                client={client}
              />
            }
          </MessageBody>
          {showReactions && (
            <ReactionsTray
              onReact={handleReact}
              style={{
                position: 'absolute',
                left: `${reactionTrayPosition.x}px`,
                top: `${reactionTrayPosition.y}px`,
              }}
            />
          )}
        </MessageContainer>
        {!isAutoPost && !isIncoming && (
          <AvatarWrapper>{!isConsequent && <Avatar {...getAvatarProps()} />}</AvatarWrapper>
        )}
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
  bannerCode: PropTypes.string,
  xpTitle: PropTypes.string,
  metadata: PropTypes.object,
  client: PropTypes.object,
};

Message.defaultProps = {
  userDisplayName: '',
  avatar: '',
  isDeleted: false,
  isIncoming: false,
  isConsequent: false,
  messageTags: [],
  metadata: {},
  client: {},
};

export default customizableComponent('Message', Message);
