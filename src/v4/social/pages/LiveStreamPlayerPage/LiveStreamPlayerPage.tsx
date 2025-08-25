import ReactDOM from 'react-dom';
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import Plyr from 'plyr';
import { Avatar, Typography } from '~/v4/core/components';
import { useAmityPage } from '~/v4/core/hooks/uikit';
import useStream from '~/v4/social/hooks/useStream';
import usePost from '~/v4/core/hooks/objects/usePost';
import { useResponsive } from '~/v4/core/hooks/useResponsive';
import { ClearButton } from '~/v4/social/elements/ClearButton';
import { liveStreamStatus } from '~/v4/social/constants/livestream';
import { Dialog, Modal, ModalOverlay } from 'react-aria-components';
import { useNavigation } from '~/v4/core/providers/NavigationProvider';
import { useLayoutContext } from '~/v4/social/providers/LayoutProvider';
import {
  getCommunityTopic,
  getLiveStreamTopic,
  getPostTopic,
  LiveStreamPlayer,
  subscribeTopic,
  SubscriptionLevels,
} from '@amityco/ts-sdk';
import { LiveStreamLiveBadge } from '~/v4/social/internal-components/LiveStreamLiveBadge';
import { LiveStreamEndThumbnail } from '~/v4/social/internal-components/LiveStreamEndThumbnail/';
import { LiveStreamIdleThumbnail } from '~/v4/social/internal-components/LiveStreamIdleThumbnail';
import { LiveStreamTerminatedThumbnail } from '~/v4/social/internal-components/LiveStreamTerminatedThumbnail';
import 'plyr/dist/plyr.css';
import styles from './LiveStreamPlayer.module.css';
import { LivestreamChatMessageComposer } from '~/v4/chat/components/LivechatMessageComposer';
import { useCommunity } from '~/v4/chat/hooks/useCommunity';
import { Button } from '~/v4/core/components/AriaButton/Button';
import CloseIcon from '~/v4/icons/Close';
import ChatFeed from '~/v4/chat/internal-components/ChatFeed/ChatFeed';
import { ReactionFloating } from '~/v4/chat/internal-components/ReactionFloating/ReactionFloating';
import { LiveStreamBanThumbnail } from '~/v4/social/internal-components/LiveStreamBanThumbnail';
import { useKeyboardVisibility } from './useKeyboardVisibility';
import { CommunityAvatar } from '~/v4/social/elements/CommunityAvatar';
import useCommunityMembersCollection from '~/v4/social/hooks/collections/useCommunityMembersCollection';
import useSDK from '~/v4/core/hooks/useSDK';
import {
  useStreamCustomWebhook,
  useCurrentDisplayName,
} from '~/v4/core/providers/AmityUIKitProvider';

type PresenceData = {
  userName: string;
  userId: string;
  streamId: string;
  channelId: string;
  sessionId?: string;
  event?: 'join' | 'leave';
};

function sendJson(url: string, data: PresenceData) {
  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: 'application/json' });
  if (navigator.sendBeacon(url, blob)) {
    return;
  }

  try {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: json,
      keepalive: true,
    }).catch((e) => {
      // Silently ignore
    });
  } catch (e) {
    // Silently ignore
  }
}

function useLivePresence(url: string, presenceData: PresenceData) {
  const sessionId = useMemo(() => crypto.randomUUID(), []);
  const hasSentLeftRef = useRef(false);

  useEffect(() => {
    sendJson(url, { ...presenceData, sessionId, event: 'join' });
  }, [
    url,
    sessionId,
    presenceData.userId,
    presenceData.streamId,
    presenceData.userName,
    presenceData.channelId,
  ]);

  useEffect(() => {
    const sendLeftOnUnload = () => {
      if (hasSentLeftRef.current) return;

      hasSentLeftRef.current = true;
      sendJson(url, { ...presenceData, sessionId, event: 'leave' });
    };

    const onPageHide = () => sendLeftOnUnload();
    const onBeforeUnload = () => sendLeftOnUnload();

    window.addEventListener('pagehide', onPageHide, { passive: true });
    window.addEventListener('beforeunload', onBeforeUnload, { passive: true });

    return () => {
      sendLeftOnUnload();
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [
    url,
    sessionId,
    presenceData.userId,
    presenceData.streamId,
    presenceData.userName,
    presenceData.channelId,
  ]);
}

export type LiveStreamPlayerPageProps = {
  post?: Amity.Post;
  goToDetailPage?: () => void;
  targetStreamId?: string;
  targetPostId?: string;
  streamOwnerName?: string;
  allowGuestAccessToChannel?: boolean;
  isModal?: boolean; // Optional prop to determine if the player is in a modal
};

const usePostSubscription = (postId: string) => {
  const { post } = usePost(postId);

  useEffect(() => {
    if (post) {
      const unsubscribe = subscribeTopic(getPostTopic(post));
      return () => unsubscribe();
    }
  }, [post]);

  return { post };
};

const useLiveStreamPlayer = ({ stream }: { post?: Amity.Post; stream?: Amity.Stream | null }) => {
  const [muted, setMuted] = useState(true);
  const [streamId, setStreamId] = useState<string | undefined>();

  const [isLoading, setIsLoading] = useState(false);
  const [isPoorConnection, setIsPoorConnection] = useState(false);
  const [playerInitialized, setPlayerInitialized] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const liveStreamPlayerRef = useRef<HTMLDivElement>(null);
  const plyrRef = useRef<Plyr | null>(null);

  const getLiveStreamPlayer = async (streamId: string) => {
    const player = await LiveStreamPlayer.getPlayer({ streamId });
    player.muted = muted;
    player.autoplay = true;
    player.playsInline = true;
    player.setAttribute('playsinline', ''); // prevent fullscreen on iOS
    player.setAttribute('webkit-playsinline', '');

    if (stream?.status === 'live') player.controls = false;

    player.onvolumechange = () => setMuted(!player.muted);

    player.classList.add(styles.liveStreamPlayer__video);
    player.setAttribute('data-is-live', 'true');

    player.addEventListener('loadedmetadata', () => {
      detectOrientation(player);
    });

    player.addEventListener('loadeddata', () => {
      detectOrientation(player);
    });

    player.addEventListener('loadstart', () => {
      handleLoadStart();
    });

    player.addEventListener('waiting', () => {
      handleWaiting();
    });

    player.addEventListener('playing', () => {
      handlePlaying();
    });

    player.addEventListener('canplay', () => {
      handleCanPlay();
    });

    window.addEventListener('online', reloadPlayer);

    videoRef.current
      ? liveStreamPlayerRef.current?.replaceChild(player, videoRef.current)
      : liveStreamPlayerRef.current?.appendChild(player);

    videoRef.current = player;

    if (stream?.status === 'live' && player) {
      plyrRef.current = new Plyr(player, {
        controls: ['pause', 'play'],
        fullscreen: { enabled: false },
        clickToPlay: true,
      });
    }

    setPlayerInitialized(true);
  };

  const reloadPlayer = useCallback(() => {
    if (videoRef.current) videoRef.current.remove();

    videoRef.current = null;
    setIsLoading(true);
    setIsPoorConnection(false);
    setPlayerInitialized(false);

    if (stream?.streamId) getLiveStreamPlayer(stream.streamId);
  }, [stream?.streamId, videoRef.current]);

  const detectOrientation = (player: HTMLVideoElement) => {
    const orientation = player.videoHeight > player.videoWidth ? 'portrait' : 'landscape';
    player.setAttribute('data-orientation', orientation);
  };

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleWaiting = () => {
    setIsLoading(true);
    setIsPoorConnection(true);
  };

  const handlePlaying = () => {
    clearTimeout(loadingTimerRef.current!);
    setIsLoading(false);
    setIsPoorConnection(false);
  };

  const handleCanPlay = () => {
    clearTimeout(loadingTimerRef.current!);
    setIsLoading(false);
    setIsPoorConnection(false);
  };

  const resetLiveStreamPlayerRef = () => {
    if (streamId) document.getElementById(streamId)?.remove();
  };

  useEffect(() => {
    if (stream?.streamId) setStreamId(stream.streamId);
  }, [stream?.streamId]);

  useEffect(() => {
    if (streamId) {
      getLiveStreamPlayer(streamId);
    } else {
      videoRef?.current?.remove();
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadedmetadata', () =>
          detectOrientation(videoRef.current!),
        );
        videoRef.current.removeEventListener('loadeddata', () =>
          detectOrientation(videoRef.current!),
        );
        videoRef.current.removeEventListener('loadstart', handleLoadStart);
        videoRef.current.removeEventListener('waiting', handleWaiting);
        videoRef.current.removeEventListener('playing', handlePlaying);
        videoRef.current.removeEventListener('canplay', handleCanPlay);
        videoRef.current.removeEventListener('canplaythrough', handleCanPlay);
        videoRef.current.removeEventListener('progress', handleCanPlay);
        window.removeEventListener('online', reloadPlayer);
      }
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      if (plyrRef.current) {
        plyrRef.current.destroy();
      }
    };
  }, [streamId]);

  return {
    isLoading,
    isPoorConnection,
    playerInitialized,
    liveStreamPlayerRef,
    streamId: streamId,
    plyrContainer: plyrRef.current?.elements.container,
    resetLiveStreamPlayerRef,
  };
};

const useLivechat = ({
  stream,
  targetType,
}: {
  stream?: Amity.Stream | null;
  targetType: Amity.PostTargetType;
}) => {
  const [channel, setChannel] = useState<Amity.Channel<'live'> | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoading && stream?.status === 'live' && !channel && targetType !== 'user') {
      setIsLoading(true);
      stream.getLiveChat().then((channel: Amity.Channel<'live'> | undefined) => {
        setChannel(channel);
      });
    }
  }, [stream, channel, isLoading]);

  return { channel, isLoading };
};

export function LiveStreamPlayerPage({
  post,
  goToDetailPage,
  targetStreamId,
  targetPostId,
  streamOwnerName,
  allowGuestAccessToChannel = false,
  isModal = true,
}: LiveStreamPlayerPageProps) {
  const streamWebhookUrl = (useStreamCustomWebhook() || '').trim();
  const pageId = 'livestream_player_page';
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null); // ✅ non-modal wrapper ref

  targetStreamId ??= post?.childrenPosts[0]?.getLivestreamInfo()?.streamId || targetStreamId || '';
  targetPostId ??= post?.postId || targetPostId || '';
  const communityId = post?.targetId || targetPostId || '';

  const stream = useStream(targetStreamId);

  const { currentUserId } = useSDK();
  const { keyboardOffset } = useKeyboardVisibility();
  const [chatContainerHeight, setChatContainerHeight] = useState<number>();
  const [hideChatFeed, setHideChatFeed] = useState(false);
  const { isDesktop } = useResponsive();
  const { post: subscribedPost } = usePostSubscription(targetPostId);
  const { community } = useCommunity({ communityId: communityId });

  const { setStreamPlayer } = useLayoutContext();
  const { themeStyles, accessibilityId } = useAmityPage({ pageId });
  const { goToLiveStreamTerminatedPage, goToLiveStreamBannedPage } = useNavigation();
  const {
    isLoading,
    isPoorConnection,
    liveStreamPlayerRef,
    playerInitialized,
    streamId,
    plyrContainer,
    resetLiveStreamPlayerRef,
  } = useLiveStreamPlayer({ stream });

  const { channel, isLoading: isChannelLoading } = useLivechat({
    stream,
    targetType: post?.targetType || 'community',
  });

  const { members } = useCommunityMembersCollection({
    queryParams: {
      communityId: community?.communityId as string,
    },
  });

  const myMembership = members.find((member) => member.userId === currentUserId);
  const onClose = useCallback(() => setStreamPlayer(null), []);
  const isUserBanned = stream?.isBanned || (myMembership && myMembership.isBanned);

  useLivePresence(streamWebhookUrl, {
    userName: useCurrentDisplayName() || 'unknown',
    userId: currentUserId || 'unknown',
    streamId: stream?.streamId || 'unknown',
    channelId: channel?.channelId || 'unknown',
  });

  useEffect(() => {
    if (keyboardOffset) setHideChatFeed(true);
    else setHideChatFeed(false);
  }, [keyboardOffset]);

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    if (stream?.status === 'live' && stream?.streamId) {
      unsubscribers.push(subscribeTopic(getLiveStreamTopic() + `/${stream.streamId}`));
    }

    if (community?.communityId) {
      unsubscribers.push(
        subscribeTopic(getCommunityTopic(community, SubscriptionLevels.COMMUNITY)),
      );
    }

    return () => {
      unsubscribers.forEach((fn) => fn());
    };
  }, [stream?.status, stream?.streamId, community?.communityId]);

  useEffect(() => {
    if (!playerInitialized) return;

    const isTerminated =
      stream?.moderation?.terminateLabels && stream?.moderation?.terminateLabels?.length > 0;
    const isLiveOrEnded =
      stream?.status === liveStreamStatus.live || stream?.status === liveStreamStatus.ended;

    if (!isDesktop && isLiveOrEnded && isTerminated) {
      onClose();
      goToLiveStreamTerminatedPage?.();
    }
  }, [playerInitialized, stream?.moderation?.terminateLabels, stream?.status, isDesktop]);

  useEffect(() => {
    if (!isDesktop && isUserBanned) goToLiveStreamBannedPage?.();

    if (isDesktop && isUserBanned) resetLiveStreamPlayerRef();
  }, [isDesktop, isUserBanned]);

  useEffect(() => {
    if (!playerInitialized) return;

    if (stream?.isDeleted || subscribedPost?.isDeleted) {
      onClose();
      goToDetailPage?.();
    }
  }, [playerInitialized, stream?.isDeleted, subscribedPost?.isDeleted]);

  useEffect(() => {
    if (!chatContainerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setChatContainerHeight(entry.contentRect.height);
        }
      }
    });

    observer.observe(chatContainerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [chatContainerRef.current]);

  // ✅ Keep chat height exactly equal to the player stage height (desktop, non-modal)
  useEffect(() => {
    if (!isDesktop) return;
    const stage = liveStreamPlayerRef.current;
    const pageEl = pageRef.current;
    if (!stage || !pageEl) return;

    const setVar = () => {
      const h = Math.max(0, stage.clientHeight || 0);
      pageEl.style.setProperty('--stage-height', `${h}px`);
    };

    const ro = new ResizeObserver(setVar);
    ro.observe(stage);
    setVar();

    return () => ro.disconnect();
  }, [isDesktop, playerInitialized, liveStreamPlayerRef]);

  const isLive = stream?.status === liveStreamStatus.live;
  const isEnded = stream?.status === liveStreamStatus.ended && !stream?.moderation?.terminateLabels;

  const renderStreamContent = () => {
    return (
      <>
        <Dialog className={styles.liveStreamPlayer__dialog} data-is-live={isLive}>
          {isUserBanned ? (
            <>
              <ClearButton
                onPress={() => onClose()}
                buttonClassName={styles.liveStreamPlayer__closeButton}
                defaultClassName={styles.liveStreamPlayer__closeButton__icon}
              />
              <LiveStreamBanThumbnail view="full-screen" />
            </>
          ) : (
            <>
              {isLive || isEnded ? (
                <div className={styles.liveStreamPlayer__liveDetail}>
                  <Button
                    variant="text"
                    onPress={onClose}
                    className={styles.liveStreamPlayer__closeButton}
                    data-is-live={isLive}
                  >
                    <CloseIcon
                      className={styles.liveStreamPlayer__closeButton__icon}
                      data-is-live={isLive}
                      data-is-ended={isEnded}
                    />
                  </Button>
                  {!isEnded && (
                    <div className={styles.liveStreamPlayer__liveDetail__detail}>
                      <CommunityAvatar
                        pageId={pageId}
                        community={community}
                        className={styles.liveStreamPlayer__liveDetail__avatar}
                      />

                      <div>
                        <Typography.CaptionBold
                          className={styles.livestreamPlayer__liveDetail__text}
                        >
                          {community?.displayName}
                        </Typography.CaptionBold>
                        <Typography.CaptionSmall
                          className={styles.livestreamPlayer__liveDetail__text}
                        >
                          By {post?.creator?.displayName || streamOwnerName || 'Unknown'}
                        </Typography.CaptionSmall>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <ClearButton
                  onPress={() => onClose()}
                  buttonClassName={styles.liveStreamPlayer__closeButton}
                  defaultClassName={styles.liveStreamPlayer__closeButton__icon}
                />
              )}

              <div
                style={themeStyles}
                ref={liveStreamPlayerRef}
                data-testid={accessibilityId}
                className={styles.liveStreamPlayer}
                data-is-live={isLive}
              >
                {isLive && isDesktop && post?.feedType === 'reviewing' && (
                  <div className={styles.liveStreamPlayer__pendingPost__banner}>
                    <div className={styles.livestreamChat__overlay__top} />
                    <div className={styles.livestreamChat__overlay__bottom}>
                      <div className={styles.livestreamChat__pendingPost__text}>
                        <Typography.Body>
                          This live stream has started, but with limited visibility until the post
                          has been approved.
                        </Typography.Body>
                      </div>
                    </div>
                  </div>
                )}
                {isLoading && (
                  <div className={styles.liveStreamPlayer__loading}>
                    <div className={styles.liveStreamPlayer__slowConnection}>
                      <div className={styles.liveStreamPlayer__loadingSpinner} />
                      {isPoorConnection && (
                        <>
                          <Typography.TitleBold>Reconnecting</Typography.TitleBold>
                          <Typography.Caption>
                            Due to poor connection, this live stream has been <br /> paused. It will
                            resume automatically <br />
                            once the connection is stable.
                          </Typography.Caption>
                        </>
                      )}
                    </div>
                  </div>
                )}
                {isDesktop &&
                  (stream?.status === liveStreamStatus.live ||
                    stream?.status === liveStreamStatus.ended) &&
                  stream?.moderation?.terminateLabels &&
                  stream?.moderation?.terminateLabels?.length > 0 && (
                    <LiveStreamTerminatedThumbnail />
                  )}
                {isLive && <LiveStreamLiveBadge />}
                {stream?.status === liveStreamStatus.idle && (
                  <LiveStreamIdleThumbnail view="full-screen" />
                )}
                {isEnded && <LiveStreamEndThumbnail view="full-screen" />}
                {isLive && isDesktop && stream?.post && (
                  <ReactionFloating post={stream?.post as Amity.Post} />
                )}
              </div>
            </>
          )}
        </Dialog>

        {isLive && channel && post?.targetType !== 'user' && (
          <>
            {isDesktop ? (
              // DESKTOP, NON-MODAL: explicit scroll wrapper around ChatFeed
              <div className={styles.livestreamChat__container}>
                <div className={styles.livestreamChat__container__inner}>
                  <div className={styles.chatFeedScroll}>
                    <ChatFeed channel={channel} />
                  </div>
                  <LivestreamChatMessageComposer
                    pageId={pageId}
                    channelId={channel.channelId}
                    disabled={stream?.status === liveStreamStatus.ended || isPoorConnection}
                    isJoined={!!community?.isJoined}
                    isPendingPost={post?.feedType === 'reviewing'}
                    allowGuest={allowGuestAccessToChannel}
                  />
                </div>
              </div>
            ) : (
              <>
                {post?.targetType !== 'user' &&
                  plyrContainer &&
                  ReactDOM.createPortal(
                    <>
                      {!hideChatFeed && (
                        <>
                          <div className={styles.livestreamChat__overlay__top} />
                          <div className={styles.livestreamChat__overlay__bottom} />
                          <div
                            className={styles.livestreamChat__reactionLane__ref}
                            style={{ bottom: chatContainerHeight }}
                          >
                            {channel.attachedTo?.videoStreamId && (
                              <ReactionFloating post={stream?.post as Amity.Post} />
                            )}
                          </div>
                          <div
                            className={styles.livestreamChat__container__inner}
                            ref={chatContainerRef}
                          >
                            <ChatFeed channel={channel} />
                          </div>
                        </>
                      )}
                    </>,
                    plyrContainer,
                  )}
                <LivestreamChatMessageComposer
                  pageId={pageId}
                  channelId={channel.channelId}
                  disabled={stream?.status === liveStreamStatus.ended || isPoorConnection}
                  isJoined={!!community?.isJoined}
                  isPendingPost={post?.feedType === 'reviewing'}
                  allowGuest={allowGuestAccessToChannel}
                />
              </>
            )}
          </>
        )}
      </>
    );
  };

  if (isModal) {
    return (
      <ModalOverlay
        isOpen={(!!streamId && !isUserBanned) || isDesktop}
        className={styles.liveStreamPlayer__overlay}
        onOpenChange={(open) => !open && onClose()}
        data-is-live={isLive}
        style={{
          transform:
            keyboardOffset > 0 && !isDesktop ? `translateY(-${keyboardOffset * 0.5}px)` : 'none',
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        <Modal
          className={styles.livestreamPlayer__modal}
          data-is-live={isLive}
          data-is-ended={isEnded}
        >
          {renderStreamContent()}
        </Modal>
      </ModalOverlay>
    );
  }

  // NON-MODAL WRAPPER
  return (
    <div
      ref={pageRef} // ✅ where we set --stage-height
      className={styles.livestreamPlayer__page}
      data-is-live={isLive}
      data-is-ended={isEnded}
    >
      {renderStreamContent()}
    </div>
  );
}
