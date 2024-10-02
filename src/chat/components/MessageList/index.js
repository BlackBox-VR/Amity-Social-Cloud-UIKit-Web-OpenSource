import React, { useEffect, useRef, useCallback, useState } from 'react';
import { FileRepository, ImageSize } from '@amityco/js-sdk';

import MessageComponent from '~/chat/components/Message';
import customizableComponent from '~/core/hocs/customization';
import withSDK from '~/core/hocs/withSDK';
import useMessagesList from '~/chat/hooks/useMessagesList';

import { InfiniteScrollContainer, MessageListContainer } from './styles';

const MessageList = ({ client, channelId }) => {
  const containerRef = useRef();
  const [messages, hasMore, loadMore] = useMessagesList(channelId);
  const prevMessagesLengthRef = useRef(messages.length);
  const [isLoading, setIsLoading] = useState(false);

  const getAvatar = ({ user: { avatarCustomUrl, avatarFile, avatarFileId } }) => {
    if (avatarCustomUrl) return avatarCustomUrl;
    if (avatarFile) return avatarFile;
    if (avatarFileId && typeof avatarFileId === 'string') {
      return FileRepository.getFileUrlById({
        fileId: avatarFileId,
        imageSize: ImageSize.Small,
      });
    }
    return null;
  };

  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
    }
    prevMessagesLengthRef.current = messages.length;
    setIsLoading(false);
  }, [messages]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const maxScrollTop = scrollHeight - clientHeight;

    console.log('Current scrollTop:', scrollTop);
    console.log('Max scrollTop:', maxScrollTop);
    console.log('Has more:', hasMore);

    // Check if we've scrolled to within 50 pixels of the top
    if (Math.abs(scrollTop) >= maxScrollTop - 10 && hasMore) {
      console.log('Loading more messages...');
      setIsLoading(true);
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
    <InfiniteScrollContainer>
      <MessageListContainer ref={containerRef} data-qa-anchor="message-list">
        {isLoading && <div>Loading more messages...</div>}
        {messages.map((message, i) => {
          const isAutoPost = message.tags?.includes('autopost');
          const nextMessage = messages[i + 1];
          const isConsequent = nextMessage && nextMessage.userId === message.userId && isAutoPost;
          const isIncoming = message.userId !== client.currentUserId;

          const { bannerShortcode = [], xpTitle = {} } = message.user?.metadata ?? {};

          return (
            <MessageComponent
              key={message.messageId}
              avatar={getAvatar(message)}
              messageId={message.messageId}
              data={message.data}
              type={message.type}
              createdAt={message.createdAt}
              isDeleted={message.isDeleted}
              userDisplayName={message.user.displayName}
              isConsequent={isConsequent}
              isIncoming={isIncoming}
              containerRef={containerRef}
              messageTags={message.tags}
              metadata={message.metadata}
              client={client}
              bannerCode={bannerShortcode[0]?.shortCode?.toLowerCase() || ''}
              xpTitle={xpTitle.title || ''}
            />
          );
        })}
      </MessageListContainer>
    </InfiniteScrollContainer>
  );
};

export default withSDK(customizableComponent('MessageList', MessageList));
