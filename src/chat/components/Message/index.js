import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MessageType } from '@amityco/js-sdk';
import { MessageRepository, ReactionRepository } from '@amityco/js-sdk';
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
  // Auto-post related state vars
  const isSupportedMessageType = [MessageType.Text, MessageType.Custom].includes(type);
  const isAutoPost = messageTags?.includes('autopost');
  const isMemberActivityAutoPost = messageTags?.includes('memberActivity');
  const isSharedQuestAutoPost = messageTags?.includes('sharedQuests');
  const isAnnouncementsAutoPost = messageTags?.includes('announcements');
  const isArenaRaidAutoPost = messageTags?.includes('arenaRaid');

  // Reactions state vars
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
  
      // Log existing reactions
      console.log(`Reaction tray opened for id ${messageId}! Existing reactions:`, reactions);
    }
  }, 
  [messageId, reactions]);

  const handleTouchStart = useCallback((event) => 
  {
    longPressTimer.current = setTimeout(() => handleLongPress(event), 250);
  }, 
  [handleLongPress]);

  const handleTouchEnd = useCallback(() => 
  {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, 
  []);

  const handleReact = useCallback(async (newReaction) => {
    console.log(`handleReact: called for id ${messageId}. newReaction: ${newReaction}!\nDATA: ${JSON.stringify(reactions)}`);
  
    try {
      // Query existing reactions
      const { models: userReactions = [] } = await ReactionRepository.queryReactions({
        referenceId: messageId,
        referenceType: 'message',
      });
  
      // Find the user's existing reaction, if any
      const existingReaction = userReactions.find(reaction => reaction.userId === client.currentUserId);
  
      console.log("Queried DATA: " + JSON.stringify(userReactions));
  
      if (existingReaction) 
      {
        console.log(`Existing reaction found! ${JSON.stringify(existingReaction)}`);
  
        if (existingReaction.reactionName === newReaction) 
        {
          // Remove existing reaction if it's the same as the new one
          const isRemoved = await MessageRepository.removeReaction({
            messageId: messageId,
            reactionName: existingReaction.reactionName,
          });

          if (isRemoved)
          { 
            console.log('Duplicate - reaction removed.');
        
            // Add a delay before querying reactions again
            setTimeout(async () => {
              const { models: updatedReactions } = await ReactionRepository.queryReactions({
                referenceId: messageId,
                referenceType: 'message',
              });
              console.log('Reactions after deleting????? (with delay):', JSON.stringify(updatedReactions));
            }, 2000); // 1 second delay
          }
          else console.log("Attempted to remove duplicate, but isRemoved is false?");

          // Update local state to reflect removal
          setReactions(prev => {
            const updated = { ...prev };
            updated[existingReaction.reactionName] = Math.max((updated[existingReaction.reactionName] || 1) - 1, 0);
            if (updated[existingReaction.reactionName] === 0) delete updated[existingReaction.reactionName];
            return updated;
          });
  
        } 
        else 
        {
          // Remove the old reaction and add the new one
          await MessageRepository.removeReaction({
            messageId: messageId,
            reactionName: existingReaction.reactionName,
          });
          console.log('Old reaction removed...');
  
          // Update local state to reflect removal
          setReactions(prev => {
            const updated = { ...prev };
            updated[existingReaction.reactionName] = Math.max((updated[existingReaction.reactionName] || 1) - 1, 0);
            if (updated[existingReaction.reactionName] === 0) delete updated[existingReaction.reactionName];
            return updated;
          });

          await MessageRepository.addReaction({
            messageId: messageId,
            reactionName: newReaction,
          });
          console.log('...another reaction replaced it.');
  
          // Update local state to reflect the new reaction
          // setReactions(prev => ({
          //   ...prev,
          //   [existingReaction.reactionName]: Math.max((prev[existingReaction.reactionName] || 1) - 1, 0),
          //   [newReaction]: (prev[newReaction] || 0) + 1,
          // }));
        }
      } 
      else 
      {
        // No existing reaction, this is a new reaction
        console.log(`No existing reaction.`);
  
        // Add new reaction
        await MessageRepository.addReaction({
          messageId: messageId,
          reactionName: newReaction,
        });
        console.log('New reaction added!');
  
        // Update local state to reflect the new reaction
        // setReactions(prev => ({
        //   ...prev,
        //   [newReaction]: (prev[newReaction] || 0) + 1,
        // }));
      }
  
      setShowReactions(false);
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  }, [messageId, client.currentUserId, reactions]);
  

  useEffect(() => 
  {
    console.log(`Second useEffect: got called for ${messageId}.`);

    const liveCollection = ReactionRepository.queryReactions({ referenceId: messageId, referenceType: 'message' });

    liveCollection.on('dataUpdated', updatedReactions => 
    {
      console.log(`Second useEffect: liveCollection onDataUpdated got called for id ${messageId}. ${JSON.stringify(updatedReactions)}`);
      const reactionCounts = updatedReactions.reduce((acc, reaction) => 
      {
        acc[reaction.reactionName] = (acc[reaction.reactionName] || 0) + 1;
        return acc;
      }, {});
      setReactions(reactionCounts);
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
