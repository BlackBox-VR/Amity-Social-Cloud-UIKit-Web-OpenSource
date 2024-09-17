import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedTime } from 'react-intl';
import { MessageType } from '@amityco/js-sdk';
import { MessageRepository } from '@amityco/js-sdk';
import { ReactionRepository } from '@amityco/js-sdk';
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
  ReactionDisplay,
  ReactionBubble,
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
  reactions: initialReactions
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
  const [reactions, setReactions] = useState(initialReactions || {});
  const reactionTrayRef = useRef(null);

  const getAvatarProps = () => {
    if (avatar) return { avatar };
    return { backgroundImage: UserImage };
  };

  const handleLongPress = useCallback((event) => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    
    if (messageRef.current) {
      const rect = messageRef.current.getBoundingClientRect();
      
      setReactionTrayPosition({
        x: rect.left + (rect.width / 2),
        y: rect.bottom - 20, // 20px above the bottom of the message
      });
      
      setShowReactions(true);
      console.log("AB - setShowReactions called.");
    }
  }, []);
  
  const handleTouchStart = useCallback((event) => {
    longPressTimer.current = setTimeout(() => handleLongPress(event), 250);
  }, [handleLongPress]);
  
  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  }, []);

  const handleReact = useCallback((reaction) => {
    MessageRepository.addReaction({
      messageId: messageId,
      reactionName: reaction
    })
      .then(() => {
        console.log(`Reaction '${reaction}' added to message ${messageId}`);
        setShowReactions(false);
        setReactions(prev => ({
          ...prev,
          [reaction]: (prev[reaction] || 0) + 1
        }));
      })
      .catch((error) => {
        console.error('Error adding reaction:', error);
      });
  }, [messageId]);

  useEffect(() => {
    const liveCollection = ReactionRepository.queryReactions({ 
      referenceId: messageId, 
      referenceType: 'message'
    });
  
    const handleReactionsUpdated = (updatedReactions) => 
    {
      console.log("AB - we got reactions, which are: " + JSON.stringify(updatedReactions));
      
      const reactionCounts = updatedReactions.reduce((acc, reaction) => 
      {
        acc[reaction.reactionName] = (acc[reaction.reactionName] || 0) + 1;
        return acc;
      }, {});
      setReactions(reactionCounts);
    };
  
    liveCollection.on('dataUpdated', handleReactionsUpdated);
  
    return () => {
      liveCollection.dispose();
    };
  }, [messageId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (reactionTrayRef.current && !reactionTrayRef.current.contains(event.target)) {
        setShowReactions(false);
      }
    };
  
    if (showReactions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showReactions]);

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
          {Object.keys(reactions).length > 0 && (
            <ReactionDisplay>
              {Object.entries(reactions).map(([reaction, count]) => (
                <ReactionBubble key={reaction}>
                  {reaction} {count}
                </ReactionBubble>
              ))}
            </ReactionDisplay>
          )}
          {showReactions && (
            <ReactionsTray
              key={showReactions ? 'visible' : 'hidden'}
              ref={reactionTrayRef}
              onReact={handleReact}
              style={{
                left: reactionTrayPosition.x,
                top: reactionTrayPosition.y,
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
