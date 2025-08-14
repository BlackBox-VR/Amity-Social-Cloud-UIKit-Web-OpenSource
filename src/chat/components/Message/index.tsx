import React, { useState, useRef, useCallback, useEffect } from 'react';
import { backgroundImage as UserImage } from '~/icons/User';
import { ReactionRepository, UserRepository, subscribeTopic, getUserTopic } from '@amityco/ts-sdk';
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
  myReactions?: string[];
  creatorId: string;
}

const failedReactions = new Map<string, boolean>(); // Global cache for messages where addReaction failed (key: messageId)

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
  reactions: initialReactions = {},
  myReactions: initialMyReactions = [],
  creatorId,
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
  const [reactions, setReactions] = useState<{ [reactionName: string]: number }>(initialReactions);
  const [localMyReactions, setLocalMyReactions] = useState<string[]>(initialMyReactions);

  // Sync local state with props for live updates
  useEffect(() => {
    setReactions(initialReactions);
  }, [initialReactions]);

  useEffect(() => {
    setLocalMyReactions(initialMyReactions);
  }, [initialMyReactions]);

  // Reaction user list state vars
  const [showReactionUsers, setShowReactionUsers] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<Amity.Reactor | null>(null);
  const [reactionUsers, setReactionUsers] = useState<Amity.User[]>([]);

  // Subscription refs
  const reactionDisposers = useRef<Amity.Unsubscriber[]>([]); // For reactions and users
  const isReactionSubscribed = useRef(false);
  const isUserSubscribed = useRef<Record<string, boolean>>({});

  // Force re-render on cache change (listen via state)
  const [failed, setFailed] = useState(failedReactions.get(messageId) || false);

  // Update local state if cache changes (e.g., from other instances)
  useEffect(() => {
    setFailed(failedReactions.get(messageId) || false);
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
        const userReactions: string[] = localMyReactions;
        const isDuplicateReaction = userReactions.includes(newReaction);

        // Remove existing reactions
        for (const reactionName of userReactions) {
          const isRemoved = await ReactionRepository.removeReaction(
            'message',
            messageId,
            reactionName,
          );
          if (isRemoved) {
            setLocalMyReactions((prev) => prev.filter((r) => r !== reactionName));
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
          const isAdded = await ReactionRepository.addReaction('message', messageId, newReaction);

          if (isAdded) {
            setLocalMyReactions((prev) => [...prev, newReaction]);
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
        console.log('Error code:', error.code, 'Error message:', error.message);
        if (
          error.code === 400400 || // ItemNotFound
          error.code === 400000 || // BadRequestError (validation)
          error.code === 400301 || // PermissionDenied
          error.code === 400300 || // ForbiddenError
          error.response?.status === 404 // Fallback for HTTP-like errors
        ) {
          // Mark as failed for this message
          failedReactions.set(messageId, true);
          setFailed(true); // Trigger re-render to hide button
          setShowReactions(false); // Close the tray immediately
        }
      }
    },
    [messageId, localMyReactions],
  );

  const handleEmptyReactionClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      if (failed) return; // Prevent opening if already failed
      if (messageRef.current && isIncoming) {
        const rect = messageRef.current.getBoundingClientRect();
        setReactionTrayPosition({ x: rect.left + rect.width / 2, y: rect.bottom - 55 });
        setShowReactions(true);
      }
    },
    [isIncoming, failed],
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
                  isfromme={localMyReactions.includes(reactionName)}
                  onClick={(event) => {
                    const reactor: Amity.Reactor = {
                      reactionId: messageId ?? '',
                      reactionName,
                      userId: creatorId ?? '',
                    };
                    handleReactionClick(reactor, event);
                  }}
                >
                  {reactionName} {count}
                </ReactionBubble>
              ))}
            {isIncoming && !failed && <EmptyReactionBubble onClick={handleEmptyReactionClick} />}
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
