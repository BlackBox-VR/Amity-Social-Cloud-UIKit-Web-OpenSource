import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MessageType, MessageRepository, ReactionRepository, UserRepository } from '@amityco/js-sdk';
import customizableComponent from '~/core/hocs/customization';
import { backgroundImage as UserImage } from '~/icons/User';
import styled from 'styled-components';

import Options from './Options';
import MessageContent from './MessageContent';
import MessageHeader from './MessageHeader';
import MessageClaim from './MessageClaim';
import ReactionsTray from './ReactionsTray';
import ReactionUsersList from './ReactionUsersList';

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
  EmptyReactionBubble,
} from './styles';

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

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

  // Reactions based state vars
  const [showReactions, setShowReactions] = useState(false);
  const reactionTrayRef = useRef(null);
  const [reactionTrayPosition, setReactionTrayPosition] = useState({ x: 0, y: 0 });
  const messageRef = useRef(null);
  const [reactions, setReactions] = useState(initialReactions || {});
  const [message, setMessage] = useState(null);

  // Reactions user list state vars
  const [showReactionUsers, setShowReactionUsers] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [reactionUsers, setReactionUsers] = useState([]);

  const getAvatarProps = () => avatar ? { avatar } : { backgroundImage: UserImage };

  const handleEmptyReactionClick = useCallback((event) => 
  {
    event.preventDefault();
    if (messageRef.current && isIncoming) 
    {
      const rect = messageRef.current.getBoundingClientRect();
      setReactionTrayPosition({ x: rect.left + (rect.width / 2), y: rect.bottom - 55 });
      setShowReactions(true);
    }
  }, [isIncoming]);

  useEffect(() => 
  {
    console.log("showReactionUsers:", showReactionUsers);
    console.log("reactionUsers:", reactionUsers);
  }, [showReactionUsers, reactionUsers]);

  const handleReactionClick = useCallback(async (reaction, event) => 
  {
    if (!event) 
    {
      console.error('Event object is undefined in handleReactionClick');
      return;
    }

    setSelectedReaction(reaction);

    try {
      const reactionsCollection = await ReactionRepository.queryReactions({
        referenceId: messageId,
        referenceType: 'message'
      });

      console.log("Reactions Collection:", reactionsCollection);
      console.log("Reactions FULL:", JSON.stringify(reactionsCollection, null, 2));
      console.log("reactionsCollection type:", typeof reactionsCollection);
      console.log("reactionsCollection properties:", Object.keys(reactionsCollection));

      if (reactionsCollection && typeof reactionsCollection.on === 'function') 
      {
        reactionsCollection.on('dataUpdated', (data) => 
        {
          processReactions(data);
        });
        // Trigger initial data processing
        //processReactions(reactionsCollection.models);
      } 
      else 
      {
        console.error("Unexpected reactions data structure:", reactionsCollection);
      }

    } catch (error) {
      console.error('Error fetching reaction users:', error);
    }

    function processReactions(reactions) 
    {
      if (Array.isArray(reactions)) 
      {
        const filteredReactions = reactions.filter(r => r.reactionName === reaction);
        Promise.all(filteredReactions.map(r => 
        {
          return new Promise((resolve) => 
          {
            const liveUser = UserRepository.getUser(r.userId);
            liveUser.on("dataUpdated", user => {
              console.log("User data:", JSON.stringify(user));
              resolve({
                id: user.userId,
                displayName: user.displayName, // || user.userId,
                avatarUrl: user.avatarUrl,
                avatarCustomUrl: user.avatarCustomUrl,
                avatarFileId: user.avatarFileId
              });
            });
          });
        })).then(users => 
        {
          console.log("Processed users:", JSON.stringify(users));
          setReactionUsers(users);
          setShowReactionUsers(true);
        });
      } 
      else 
      {
        console.error("Reactions is not an array:", reactions);
      }
    }    
  }, [messageId]);

  const handleReact = useCallback(async (newReaction) => 
  {
    console.log(`handleReact() called for id ${messageId}. Tapped Reaction: ${newReaction}!`);

    try {
      // Check if the user has already reacted with this reaction
      const userReactions = message?.myReactions || [];

      console.log("Total Reactions On Message: " + JSON.stringify(reactions));
      console.log("My Reactions: " + JSON.stringify(userReactions));

      const isDuplicateReaction = userReactions.includes(newReaction);
      
      // Remove all existing user reactions
      for (const userReaction of userReactions) 
      {
        const isRemoved = await MessageRepository.removeReaction({
          messageId: messageId,
          reactionName: userReaction,
        });

        if (isRemoved)
        {
          console.log(`Removed existing reaction ${userReaction.reactionName}.`);

          setReactions(prev => {
            const updated = {...prev};
            updated[userReaction] = Math.max((updated[userReaction] || 1) - 1, 0);
            if (updated[userReaction] === 0) delete updated[userReaction];
            return updated;
          });
        }
      }

      // If the new reaction is different from the existing one(s), add it
      if (!isDuplicateReaction) 
      {
        const isAdded = await MessageRepository.addReaction({
          messageId: messageId,
          reactionName: newReaction,
        });
        
        if (isAdded) 
        {
          console.log(`New reaction added ${newReaction}.`);
        }
      }
  
      setShowReactions(false);
    } 
    catch (error) 
    { 
      console.error('Error handling reaction:', error); 
    }
  }, 
  [messageId, reactions, message]);

  
  // useEffect for querying messages and their complete updated data
  useEffect(() => {
    let liveObject;  

    const fetchMessage = async () => {
      try {
        liveObject = await MessageRepository.getMessage(messageId);
        
        const processMessage = (message) => {
          if (message) 
          {
            setMessage(message);
            setReactions(message.reactions || {});
            // You might want to store myReactions in a separate state if needed
            // setMyReactions(message.myReactions || []);
          }
        };
  
        console.log("Fetching...");
        processMessage(liveObject.model);
  
        liveObject.on('dataUpdated', updatedMessage => {
          console.log(`Message data updated for id ${messageId}: ${JSON.stringify(updatedMessage?.myReactions)}`);
          processMessage(updatedMessage);
        });
  
        liveObject.on('dataError', error => {
          console.error('Error fetching message:', error);
          setReactions({});
        });
      } 
      catch (error) 
      {
        console.error('Error initializing message live object:', error);
        setReactions({});
      }
    };
  
    fetchMessage();
  
    return () => {
      if (liveObject) 
      {
        liveObject.dispose();
      }
    };
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
          >
            {!isAutoPost && <UserName>{userDisplayName}</UserName>}
            {isMemberActivityAutoPost && <MessageHeader avatar={getAvatarProps()} userDisplayName={userDisplayName} bannerCode={bannerCode} xpTitle={xpTitle} />}
            <MessageContent data={data} type={type} isDeleted={isDeleted} />
            {!isDeleted && (
              <BottomLine>
                <MessageDate>{timeDifference(createdAt, "en")}</MessageDate>
                {/* {!isAutoPost && <Options messageId={messageId} data={data} isIncoming={isIncoming} isSupportedMessageType={isSupportedMessageType} popupContainerRef={containerRef} />} */}
              </BottomLine>
            )}
            {isMemberActivityAutoPost && metadata?.carePointsReward > 0 && <MessageClaim messageId={messageId} metadata={metadata} client={client} />}
          </MessageBody>
            <ReactionDisplay>
            {Object.entries(reactions).map(([reactionName, count]) => (
              <ReactionBubble 
                key={reactionName}
                isFromMe={message?.myReactions?.includes(reactionName)}
                onClick={(event) => handleReactionClick(reactionName, event)}
              >
              {reactionName} {count}
            </ReactionBubble>
            ))}
            {isIncoming && (
              <EmptyReactionBubble onClick={handleEmptyReactionClick} />
            )}
          </ReactionDisplay>
          {showReactionUsers && (
            <Backdrop onClick={() => setShowReactionUsers(false)}>
              <ReactionUsersList
                users={reactionUsers}
                reaction={selectedReaction}
                onClose={() => setShowReactionUsers(false)}
              />
            </Backdrop>
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