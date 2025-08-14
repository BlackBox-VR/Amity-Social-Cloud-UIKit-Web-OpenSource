import React, { useEffect, useRef, useState, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import MessageComponent from '~/chat/components/Message';

import { InfiniteScrollContainer, MessageListContainer } from './styles';
import useSDK from '~/core/hooks/useSDK';
import { useCustomComponent } from '~/core/providers/CustomComponentsProvider';
import useUser from '~/core/hooks/useUser';
import useImage from '~/core/hooks/useImage';
import useMessagesCollection from '~/chat/hooks/collections/useMessagesCollection';

interface MessageItemProps {
  message: Amity.Message;
  isConsequent: boolean;
  isIncoming: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  client?: Amity.Client;
}

const MessageItem = React.memo(
  ({ message, isConsequent, isIncoming, containerRef, client }: MessageItemProps) => {
    const user = useUser(message.creatorId);

    const imageResult = useImage({ fileId: user?.avatarFileId, imageSize: 'small' }) || '';
    const avatarFileUrl = user?.avatarCustomUrl || imageResult;
    const { bannerShortcode = [], xpTitle = {} } = user?.metadata ?? {};

    return (
      <MessageComponent
        key={message.messageId}
        avatar={avatarFileUrl || ''}
        messageId={message.messageId}
        data={(message as Amity.Message<'text'>)?.data || ''}
        type={message.dataType}
        createdAt={new Date(message.createdAt)}
        isDeleted={message.isDeleted}
        userDisplayName={user?.displayName || ''}
        isConsequent={isConsequent}
        isIncoming={isIncoming}
        containerRef={containerRef}
        messageTags={message.tags || []}
        metadData={message.metadata || {}}
        client={client}
        bannerCode={bannerShortcode[0]?.shortcode?.toLowerCase() || ''}
        xpTitle={xpTitle?.title || ''}
        reactions={message.reactions || {}}
        myReactions={message.myReactions || []}
        creatorId={message.creatorId}
      />
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.message.messageId === nextProps.message.messageId &&
      prevProps.isConsequent === nextProps.isConsequent &&
      prevProps.isIncoming === nextProps.isIncoming &&
      prevProps.client === nextProps.client
    );
  },
);

interface MessageListProps {
  subChannelId: string;
}

const MessageList = ({ subChannelId }: MessageListProps) => {
  const { client } = useSDK();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollPositionRef = useRef(0);
  const [isLoading, setIsLoading] = useState(false);
  const { messages, hasMore, loadMore } = useMessagesCollection({
    subChannelId: subChannelId,
    sortBy: 'segmentDesc',
    limit: 30,
  });

  const prevMessagesLengthRef = useRef(messages.length);

  useEffect(() => {
    const container = containerRef.current;
    if (container && messages.length > prevMessagesLengthRef.current) {
      // Maintain the previous scroll position
      container.scrollTop = scrollPositionRef.current;
    }
    prevMessagesLengthRef.current = messages.length;
    setIsLoading(false);
  }, [messages]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const maxScrollTop = scrollHeight - clientHeight;

    // Check if we've scrolled to within 10 pixels of the top
    if (Math.abs(scrollTop) >= maxScrollTop - 10 && hasMore) {
      setIsLoading(true);
      scrollPositionRef.current = scrollTop;
      loadMore();
    }
  }, [hasMore, loadMore, isLoading]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  return (
    <InfiniteScrollContainer ref={containerRef}>
      {containerRef.current ? (
        <InfiniteScroll
          scrollableTarget={containerRef.current}
          scrollThreshold={0.9}
          hasMore={hasMore}
          next={loadMore}
          loader={isLoading ? <span key={0}>Loading...</span> : null}
          inverse={true}
          dataLength={messages?.length || 0}
          style={{ display: 'flex', flexDirection: 'column-reverse' }}
        >
          <MessageListContainer data-testid="message-list">
            {messages.map((message, i) => {
              const nextMessage = messages[i + 1];
              const isConsequent = nextMessage && nextMessage.creatorId === message.creatorId;
              const isIncoming = message.creatorId !== client?.userId;

              if (!message?.data || !message.createdAt) return <></>;

              return (
                <MessageItem
                  key={message.messageId}
                  message={message}
                  isConsequent={isConsequent}
                  isIncoming={isIncoming}
                  containerRef={containerRef}
                  client={client ?? undefined}
                />
              );
            })}
          </MessageListContainer>
        </InfiniteScroll>
      ) : null}
    </InfiniteScrollContainer>
  );
};

export default (props: MessageListProps) => {
  const CustomComponentFn = useCustomComponent<MessageListProps>('MessageList');

  if (CustomComponentFn) return CustomComponentFn(props);

  return <MessageList {...props} />;
};
