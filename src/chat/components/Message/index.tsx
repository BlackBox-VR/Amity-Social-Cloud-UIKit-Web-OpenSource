import React, { useState, useRef, useCallback, useEffect } from 'react';
import { backgroundImage as UserImage } from '~/icons/User';
import {
  ReactionRepository,
  UserRepository,
  MessageRepository,
  subscribeTopic,
  getMessageTopic,
  getUserTopic,
} from '@amityco/ts-sdk';
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
  Backdrop,
} from './styles';
import { useCustomComponent } from '~/core/providers/CustomComponentsProvider';

const MessageBody = ({
  isDeleted,
  type,
  isSupportedMessageType,
  isMemberActivityAutoPost,
  isSharedQuestsAutoPost,
  isAnnouncementsAutoPost,
  isArenaRaidAutoPost,
  ...otherProps
}: {
  isDeleted: boolean;
  type: string;
  isSupportedMessageType: boolean;
  isMemberActivityAutoPost?: boolean;
  isSharedQuestsAutoPost?: boolean;
  isAnnouncementsAutoPost?: boolean;
  isArenaRaidAutoPost?: boolean;
  [key: string]: unknown;
}) => {
  if (isMemberActivityAutoPost)
    return (
      <MemberActivityAutoPostBody {...otherProps} data-testid="message-body-member-activity" />
    );
  if (isSharedQuestsAutoPost)
    return <SharedQuestsAutoPostBody {...otherProps} data-testid="message-body-shared-quests" />;
  if (isAnnouncementsAutoPost)
    return <AnnouncementsAutoPostBody {...otherProps} data-testid="message-body-announcements" />;
  if (isArenaRaidAutoPost)
    return <ArenaRaidAutoPostBody {...otherProps} data-testid="message-body-arena-raid" />;
  if (isDeleted) return <DeletedMessageBody {...otherProps} data-testid="message-body-deleted" />;
  if (!isSupportedMessageType)
    return <UnsupportedMessageBody {...otherProps} data-testid="message-body-unsupported" />;
  return <GeneralMessageBody {...otherProps} data-testid="message-body-general" />;
};

interface MessageProps {
  messageId: string;
  avatar: string;
  type: string;
  data: { text: string } | string;
  createdAt: Date;
  isDeleted?: boolean;
  isIncoming: boolean;
  isConsequent: boolean;
  userDisplayName: string;
  containerRef: React.RefObject<HTMLDivElement>;
  messageTags?: string[];
  bannerCode?: string;
  xpTitle?: string;
  metadData?: { [key: string]: any };
  client?: { [key: string]: any };
  reactions?: { [key: string]: number }; // Adjusted to match the expected type
}

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
  metadData,
  client,
  reactions: initialReactions,
}: MessageProps) => {
  // Auto-post related state vars
  const isSupportedMessageType = ['text', 'custom'].includes(type);
  const isAutoPost = messageTags?.includes('autopost');
  const isMemberActivityAutoPost = isAutoPost && messageTags?.includes('memberActivity');
  const isSharedQuestsAutoPost = isAutoPost && messageTags?.includes('sharedQuests');
  const isAnnouncementsAutoPost = isAutoPost && messageTags?.includes('announcements');
  const isArenaRaidAutoPost = isAutoPost && messageTags?.includes('arenaRaid');

  // Reactions based state vars
  const [showReactions, setShowReactions] = useState(false);
  const reactionTrayRef = useRef<HTMLDivElement | null>(null);
  const [reactionTrayPosition, setReactionTrayPosition] = useState({ x: 0, y: 0 });
  const messageRef = useRef<HTMLDivElement | null>(null);
  const [reactions, setReactions] = useState<{ [reactionName: string]: number }>(
    initialReactions || {},
  );
  const [message, setMessage] = useState<Amity.Message | null>(null);

  // Reaction user list state vars
  const [showReactionUsers, setShowReactionUsers] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<Amity.Reactor | null>(null);
  const [reactionUsers, setReactionUsers] = useState<Amity.User[]>([]);

  // Subscription refs
  const messageDataRef = useRef<Amity.Message | null>(null);
  const messageDisposers = useRef<Amity.Unsubscriber[]>([]); // For message subscription
  const reactionDisposers = useRef<Amity.Unsubscriber[]>([]); // For reactions and users
  const isMessageTopicSubscribed = useRef(false);
  const isReactionSubscribed = useRef(false);
  const isUserSubscribed = useRef<Record<string, boolean>>({});

  // Update messageDataRef
  useEffect(() => {
    messageDataRef.current = message;
  }, [message]);

  // Message subscription (persists for component lifetime)
  useEffect(() => {
    if (!messageId) {
      console.warn('No messageId provided, skipping fetch');
      setMessage(null);
      setReactions({});
      return;
    }

    const processMessage = (message: Amity.Message | undefined) => {
      if (message) {
        setMessage(message);
        setReactions(message.reactions || {});

        // Subscribe to message topic with REACTION level
        if (!isMessageTopicSubscribed.current) {
          isMessageTopicSubscribed.current = true;
          const unsubscribeTopic = subscribeTopic(getMessageTopic(message));
          messageDisposers.current.push(unsubscribeTopic);
        }
      } else {
        console.warn('No message data received');
        setReactions({});
        setMessage(null);
      }
    };

    let unsubscribeMessage: Amity.Unsubscriber;

    try {
      unsubscribeMessage = MessageRepository.getMessage(messageId, ({ data, loading, error }) => {
        if (error) {
          console.error('Error in live object response:', error);
          setReactions({});
          setMessage(null);
          return;
        }

        processMessage(data);
      });

      messageDisposers.current.push(unsubscribeMessage);
    } catch (error) {
      console.error('Error in MessageRepository.getMessage:', error);
      setReactions({});
      setMessage(null);
    }

    return () => {
      messageDisposers.current.forEach((unsub) => unsub());
      messageDisposers.current = [];
      isMessageTopicSubscribed.current = false;
    };
  }, [messageId]);

  // Reaction subscriptions cleanup (tied to showReactionUsers)
  useEffect(() => {
    if (!showReactionUsers) {
      reactionDisposers.current.forEach((unsub) => unsub());
      reactionDisposers.current = [];
      isReactionSubscribed.current = false;
      isUserSubscribed.current = {};
    }
  }, [showReactionUsers]);

  const handleReactionClick = useCallback(
    async (reaction: Amity.Reactor, event: React.MouseEvent) => {
      if (!event) {
        console.error('Event is undefined in handleReactionClick');
        return;
      }

      setSelectedReaction(reaction);
      setReactionUsers([]); // Clear previous users while loading

      try {
        const unsubscribeReactions = ReactionRepository.getReactions(
          {
            referenceId: messageId,
            referenceType: 'message',
          },
          (liveCollection) => {
            // Process reactions
            processReactions(liveCollection.data);

            // Avoid duplicate message topic subscription
            if (!liveCollection.loading && liveCollection.data && !isReactionSubscribed.current) {
              isReactionSubscribed.current = true;
              if (messageDataRef.current && !isMessageTopicSubscribed.current) {
                const unsubscribeTopic = subscribeTopic(getMessageTopic(messageDataRef.current));
                messageDisposers.current.push(unsubscribeTopic); // Use messageDisposers
              }
            }
          },
        );

        reactionDisposers.current.push(unsubscribeReactions);
      } catch (error) {
        console.error('Error fetching reactions:', error);
        setReactionUsers([]);
      }

      function processReactions(reactions: Amity.Reactor[]) {
        const filteredReactions = reactions.filter((r) => r.reactionName === reaction.reactionName);
        const userMap: Record<string, Amity.User> = {};

        const userPromises = filteredReactions.map(
          (r) =>
            new Promise<Amity.User>((resolve, reject) => {
              const unsubscribeUser = UserRepository.getUser(r.userId, (response) => {
                if (response.error) {
                  reject(new Error(`Error fetching user ${r.userId}: ${response.error}`));
                  return;
                }

                if (response.data) {
                  userMap[r.userId] = response.data;
                  setReactionUsers(Object.values(userMap));

                  if (!response.loading) {
                    resolve(response.data);
                  }

                  if (!response.loading && !isUserSubscribed.current[r.userId]) {
                    isUserSubscribed.current[r.userId] = true;
                    const unsubscribeUserTopic = subscribeTopic(getUserTopic(response.data));
                    reactionDisposers.current.push(unsubscribeUserTopic);
                  }
                }
              });

              reactionDisposers.current.push(unsubscribeUser);
            }),
        );

        Promise.all(userPromises)
          .then(() => {
            setShowReactionUsers(true);
          })
          .catch((error) => {
            console.error('Error processing reaction users:', error);
            setReactionUsers([]);
          });
      }
    },
    [messageId],
  );

  const handleReact = useCallback(
    async (newReaction: string) => {
      try {
        // Verify message exists
        if (!messageDataRef.current) {
          console.error('No message data available for reaction. Refetching...');
          let unsubscribe: Amity.Unsubscriber;
          const message = await new Promise<Amity.Message | null>((resolve) => {
            unsubscribe = MessageRepository.getMessage(messageId, ({ data }) => {
              resolve(data);
            });
          });
          unsubscribe!();
          if (!message) {
            throw new Error('Message not found');
          }
          setMessage(message);
          messageDataRef.current = message;
        }

        const userReactions: string[] = Array.isArray(messageDataRef.current?.myReactions)
          ? messageDataRef.current.myReactions
          : [];

        const isDuplicateReaction = userReactions.includes(newReaction);

        // Remove existing reactions
        for (const reactionName of userReactions) {
          const isRemoved = await ReactionRepository.removeReaction(
            'message',
            messageId,
            reactionName,
          );
          if (isRemoved) {
            setReactions((prev) => {
              const updated = { ...prev };
              updated[reactionName] = Math.max((updated[reactionName] || 1) - 1, 0);
              if (updated[reactionName] === 0) {
                delete updated[reactionName];
              }
              return updated;
            });
          } else {
            console.warn(`Failed to remove reaction: ${reactionName}`);
          }
        }

        // Add new reaction if not a duplicate
        if (!isDuplicateReaction) {
          let isAdded = await ReactionRepository.addReaction('message', messageId, newReaction);
          if (!isAdded) {
            console.warn(
              `First attempt to add reaction ${newReaction} failed. Retrying after refetch...`,
            );
            // Refetch message to refresh state
            let unsubscribe: Amity.Unsubscriber;
            const message = await new Promise<Amity.Message | null>((resolve) => {
              unsubscribe = MessageRepository.getMessage(messageId, ({ data }) => {
                resolve(data);
              });
            });
            unsubscribe!();
            if (message) {
              setMessage(message);
              messageDataRef.current = message;
              isAdded = await ReactionRepository.addReaction('message', messageId, newReaction);
            }
          }
          if (isAdded) {
            setReactions((prev) => ({
              ...prev,
              [newReaction]: (prev[newReaction] || 0) + 1,
            }));
          } else {
            console.error(`Failed to add reaction: ${newReaction}`);
          }
        }

        setShowReactions(false);
      } catch (error: any) {
        console.error('Error handling reaction:', error, error.response?.data);
        if (error.response?.status === 404) {
          console.error('404 Error: Message not found. Message ID:', messageId);
        }
      }
    },
    [messageId],
  );

  const handleEmptyReactionClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      if (messageRef.current && isIncoming) {
        const rect = messageRef.current.getBoundingClientRect();
        setReactionTrayPosition({ x: rect.left + rect.width / 2, y: rect.bottom - 55 });
        setShowReactions(true);
      }
    },
    [isIncoming],
  );

  const timeDifference = (timestamp: Date, locale: string) => {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;

    const elapsed = Date.now() - timestamp.getTime();
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (elapsed < 5000) return 'just now';
    if (elapsed < msPerMinute) return rtf.format(-Math.floor(elapsed / 1000), 'seconds');
    if (elapsed < msPerHour) return rtf.format(-Math.floor(elapsed / msPerMinute), 'minutes');
    if (elapsed < msPerDay) return rtf.format(-Math.floor(elapsed / msPerHour), 'hours');

    const formattedDate = new Date(timestamp);
    const options = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    } as Intl.DateTimeFormatOptions;
    return formattedDate.toLocaleDateString(locale, options);
  };

  const getAvatarProps = () => (avatar ? { avatar } : { backgroundImage: UserImage });

  return (
    <MessageReservedRow isIncoming={isIncoming}>
      <MessageWrapper isAutoPost={isAutoPost}>
        {!isAutoPost && isIncoming && (
          <AvatarWrapper>{!isConsequent && <Avatar {...getAvatarProps()} />}</AvatarWrapper>
        )}
        <MessageContainer data-testid="message" ref={messageRef}>
          <MessageBody
            type={type}
            isIncoming={isIncoming}
            isDeleted={isDeleted || false}
            isSupportedMessageType={isSupportedMessageType}
            isMemberActivityAutoPost={isMemberActivityAutoPost}
            isSharedQuestsAutoPost={isSharedQuestsAutoPost}
            isAnnouncementsAutoPost={isAnnouncementsAutoPost}
            isArenaRaidAutoPost={isArenaRaidAutoPost}
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
                <MessageDate>{timeDifference(createdAt, 'en')}</MessageDate>
                {/* <Options
                  messageId={messageId}
                  data={data}
                  isIncoming={isIncoming}
                  isSupportedMessageType={isSupportedMessageType}
                  popupContainerRef={containerRef}
                /> */}
              </BottomLine>
            )}
            {isMemberActivityAutoPost && metadData?.carePointsReward > 0 && (
              <MessageClaim metadata={metadData} client={client} messageId={messageId} />
            )}
          </MessageBody>
          <ReactionDisplay>
            {Object.entries(reactions)
              .filter(([_, count]) => count > 0)
              .map(([reactionName, count]) => (
                <ReactionBubble
                  key={reactionName}
                  isfromme={message?.myReactions?.includes(reactionName)}
                  onClick={(event) => {
                    const reactor: Amity.Reactor = {
                      reactionId: message?.messageId ?? '',
                      reactionName,
                      userId: message?.creatorId ?? '',
                    };
                    handleReactionClick(reactor, event);
                  }}
                >
                  {reactionName} {count}
                </ReactionBubble>
              ))}
            {isIncoming && <EmptyReactionBubble onClick={handleEmptyReactionClick} />}
          </ReactionDisplay>
          {showReactionUsers && selectedReaction && (
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
        {!isAutoPost && !isIncoming && (
          <AvatarWrapper>{!isConsequent && <Avatar {...getAvatarProps()} />}</AvatarWrapper>
        )}
      </MessageWrapper>
    </MessageReservedRow>
  );
};

export default (props: MessageProps) => {
  const CustomComponentFn = useCustomComponent<MessageProps>('Message');
  if (CustomComponentFn) return CustomComponentFn(props);
  return <Message {...props} />;
};
