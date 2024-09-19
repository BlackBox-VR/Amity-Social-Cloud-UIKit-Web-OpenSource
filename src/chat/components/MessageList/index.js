import React, { useEffect, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
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

  const getAvatar = ({ user: { avatarCustomUrl, avatarFile, avatarFileId } }) => {
    if (avatarCustomUrl) return avatarCustomUrl;
    if (avatarFile) return avatarFile;
    if (avatarFileId && typeof avatarFileId === 'string') {
      return FileRepository.getFileUrlById({
        fileId: avatarFileId,
        imageSize: ImageSize.Small,
      });
    }
    
    return null;  // Return null if no valid avatar is found
  };
  

  useEffect(() => 
  {
    if (messages.length > prevMessagesLengthRef.current) 
    {
      containerRef.current?.scrollIntoView(false);
    }
    prevMessagesLengthRef.current = messages.length;
  }, 
  [messages]);

  return (
    <InfiniteScrollContainer>
      <InfiniteScroll
        initialLoad={false}
        hasMore={hasMore}
        loadMore={loadMore}
        useWindow={false}
        loader={<span key={0}>Loading...</span>}
        isReverse
      >
        <MessageListContainer ref={containerRef} data-qa-anchor="message-list">
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
      </InfiniteScroll>
    </InfiniteScrollContainer>
  );
};

export default withSDK(customizableComponent('MessageList', MessageList));
