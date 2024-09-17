import { useState, useEffect } from 'react';
import { MessageRepository, ReactionRepository } from '@amityco/js-sdk';
import orderBy from 'lodash/orderBy';
import useLiveCollection from '~/core/hooks/useLiveCollection';

function useMessagesList(channelId) {
  const [messages, hasMore, loadMore] = useLiveCollection(
    () => MessageRepository.queryMessages({ channelId }),
    [channelId],
  );
  const [messagesWithReactions, setMessagesWithReactions] = useState(() => orderBy(messages, 'createdAt', 'desc'));

  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const updatedMessages = await Promise.all(
          messages.map(async (message) => {
            const reactions = await ReactionRepository.queryReactions({ referenceId: message.messageId, referenceType: 'message' });
            return { ...message, reactions };
          })
        );
        setMessagesWithReactions(orderBy(updatedMessages, 'createdAt', 'desc'));
      } catch (error) {
        console.error('Failed to fetch reactions:', error);
      }
    };

    if (messages.length) fetchReactions();
  }, [messages]);

  return [messagesWithReactions, hasMore, loadMore];
}

export default useMessagesList;
