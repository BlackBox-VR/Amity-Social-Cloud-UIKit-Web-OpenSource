import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MessageType, MessageRepository, ReactionRepository } from '@amityco/js-sdk';
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
  if (isMemberActivityAutoPost) return <MemberActivityAutoPostBody {...otherProps} data-qa-anchor="message-body-auto-post" />;
  if (isSharedQuestAutoPost) return <SharedQuestsAutoPostBody {...otherProps} data-qa-anchor="message-body-auto-post" />;
  if (isAnnouncementsAutoPost) return <AnnouncementsAutoPostBody {...otherProps} data-qa-anchor="message-body-auto-post" />;
  if (isArenaRaidAutoPost) return <ArenaRaidAutoPostBody {...otherProps} data-qa-anchor="message-body-auto-post" />;
  if (isDeleted) return <DeletedMessageBody {...otherProps} data-qa-anchor="message-body-deleted" />;
  if (!isSupportedMessageType) return <UnsupportedMessageBody {...otherProps} data-qa-anchor="message-body-unsupported" />;
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
}) => 
{
  const isSupportedMessageType = [MessageType.Text, MessageType.Custom].includes(type);
  const isAutoPost = messageTags?.includes('autopost');
  const isMemberActivityAutoPost = messageTags?.includes('memberActivity');
  const isSharedQuestAutoPost = messageTags?.includes('sharedQuests');
  const isAnnouncementsAutoPost = messageTags?.includes('announcements');
  const isArenaRaidAutoPost = messageTags?.includes('arenaRaid');

  const [showReactions, setShowReactions] = useState(false);
  const reactionTrayRef = useRef(null);
  const [reactionTrayPosition, setReactionTrayPosition] = useState({ x: 0, y: 0 });
  const longPressTimer = useRef(null);
  const messageRef = useRef(null);
  const [reactions, setReactions] = useState(initialReactions || {});

  const getAvatarProps = () => avatar ? { avatar } : { backgroundImage: UserImage };

  const handleLongPress = useCallback((event) => 
  {
    event?.preventDefault();
    if (messageRef.current) 
    {
      const rect = messageRef.current.getBoundingClientRect();
      setReactionTrayPosition({ x: rect.left + (rect.width / 2), y: rect.bottom - 55 });
      setShowReactions(true);
    }
  }, []);

  const handleTouchStart = useCallback((event) => 
  {
    longPressTimer.current = setTimeout(() => handleLongPress(event), 250);
  }, [handleLongPress]);

  const handleTouchEnd = useCallback(() => 
  {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  const handleReact = useCallback(async (newReaction) => 
  {
    console.log(`handleReact() called for id ${messageId}. Tapped Reaction: ${newReaction}!`);
  
    try {
      // Check if the user has already reacted with this reaction
      const userReactions = reactions.filter(reaction => reaction.userId === client.currentUserId);

      console.log("Total Reactions On Message: " + JSON.stringify(reactions));
      console.log("My Reactions: " + JSON.stringify(userReactions));

      const hasReacted = userReactions.includes(newReaction);
      
      if (hasReacted) 
      {
        // Remove the existing reaction
        const isRemoved = await MessageRepository.removeReaction(
          {
          messageId: messageId,
          reactionName: newReaction,
        });
        
        if (isRemoved) 
        {
          console.log(`Existing reaction ${newReaction} removed.`);

          setReactions(prev => {
            const updatedReactions = {
              ...prev,
              [newReaction]: Math.max((prev[newReaction] || 1) - 1, 0)
            };
            return Object.fromEntries(
              Object.entries(updatedReactions).filter(([_, count]) => count > 0)
            );
          });
        }
      } 
      else 
      {
        // Remove any existing reaction by the user
        for (const reaction of userReactions) 
        {
          const isRemoved = await MessageRepository.removeReaction(
            {
            messageId: messageId,
            reactionName: reaction,
          });

          if (isRemoved)
          {
            console.log(`Removed a reaction ${reaction}, to be replaced.`);

            setReactions(prev => {
              const updatedReactions = {
                ...prev,
                [reaction]: Math.max((prev[reaction] || 1) - 1, 0)
              };              
              return Object.fromEntries(
                Object.entries(updatedReactions).filter(([_, count]) => count > 0)
              );
            });
          }
        }
        
        // Add the new reaction
        const isAdded = await MessageRepository.addReaction(
          {
          messageId: messageId,
          reactionName: newReaction,
        });        
        if (isAdded) console.log(`New reaction added ${newReaction}.`);        
      }
  
      setShowReactions(false);
    } 
    catch (error) { console.error('Error handling reaction:', error); }
  }, 
  [messageId, reactions]);
  
  // useEffect for querying reactions and getting an updated object
  useEffect(() => 
  {
    const liveCollection = ReactionRepository.queryReactions({ referenceId: messageId, referenceType: 'message' });

    liveCollection.on('dataUpdated', updatedReactions => 
    {
      console.log(`useEffect: Reactions updated for id ${messageId}. ${JSON.stringify(updatedReactions)}`);
      setReactions(updatedReactions);
    });

    return () => liveCollection.dispose();
  }, 
  [messageId]);


  useEffect(() => 
  {
    const handleClickOutside = event => 
    {
      if (reactionTrayRef.current && !reactionTrayRef.current.contains(event.target)) 
      {
        setShowReactions(false);
      }
    };
    if (showReactions) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, 
  [showReactions]);

  const timeDifference = (timestamp, locale) => {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;

    const elapsed = Date.now() - timestamp;
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    if (elapsed < 5000) return "just now";
    if (elapsed < msPerMinute) return rtf.format(-Math.floor(elapsed / 1000), "seconds");
    if (elapsed < msPerHour) return rtf.format(-Math.floor(elapsed / msPerMinute), "minutes");
    if (elapsed < msPerDay) return rtf.format(-Math.floor(elapsed / msPerHour), "hours");

    const formattedDate = new Date(timestamp);
    const options = { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return formattedDate.toLocaleDateString(locale, options);
  };

  return (
    <MessageReservedRow isIncoming={isIncoming}>
      <MessageWrapper isAutoPost={isAutoPost}>
        {!isAutoPost && isIncoming && <AvatarWrapper>{!isConsequent && <Avatar {...getAvatarProps()} />}</AvatarWrapper>}
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
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {!isAutoPost && <UserName>{userDisplayName}</UserName>}
            {isMemberActivityAutoPost && <MessageHeader avatar={getAvatarProps()} userDisplayName={userDisplayName} bannerCode={bannerCode} xpTitle={xpTitle} />}
            <MessageContent data={data} type={type} isDeleted={isDeleted} />
            {!isDeleted && (
              <BottomLine>
                <MessageDate>{timeDifference(createdAt, "en")}</MessageDate>
                {!isAutoPost && <Options messageId={messageId} data={data} isIncoming={isIncoming} isSupportedMessageType={isSupportedMessageType} popupContainerRef={containerRef} />}
              </BottomLine>
            )}
            {isMemberActivityAutoPost && metadata?.carePointsReward > 0 && <MessageClaim messageId={messageId} metadata={metadata} client={client} />}
          </MessageBody>
          {Object.keys(reactions).length > 0 && (
            <ReactionDisplay>
              {Object.entries(reactions.reduce((acc, reaction) => {
                acc[reaction.reactionName] = (acc[reaction.reactionName] || 0) + 1;
                return acc;
              }, {})).map(([reaction, count]) => (
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
              style={{ left: reactionTrayPosition.x, top: reactionTrayPosition.y }}
            />
          )}
        </MessageContainer>
        {!isAutoPost && !isIncoming && <AvatarWrapper>{!isConsequent && <Avatar {...getAvatarProps()} />}</AvatarWrapper>}
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