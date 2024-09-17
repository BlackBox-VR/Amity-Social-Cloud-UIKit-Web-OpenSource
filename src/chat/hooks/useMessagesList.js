import { useState, useEffect } from 'react';
import { MessageRepository } from '@amityco/js-sdk';
import orderBy from 'lodash/orderBy';

import useLiveCollection from '~/core/hooks/useLiveCollection';

function useMessagesList(channelId) {
  const [messages, hasMore, loadMore] = useLiveCollection(
    () => MessageRepository.queryMessages({ channelId }),
    [channelId],
  );

  const [messagesWithReactions, setMessagesWithReactions] = useState([]);

  useEffect(() => {
    const fetchReactions = async () => {
      const updatedMessages = await Promise.all(
        messages.map(async (message) => {
          try {
            const reactions = await MessageRepository.getReactions({ messageId: message.messageId });
            return { ...message, reactions };
          } catch (error) {
            console.error(`Failed to fetch reactions for message ${message.messageId}:`, error);
            return { ...message, reactions: [] };
          }
        })
      );
      setMessagesWithReactions(orderBy(updatedMessages, 'createdAt', 'desc'));
    };

    fetchReactions();
  }, [messages]);

  return [messagesWithReactions, hasMore, loadMore];
}

export default useMessagesList;
