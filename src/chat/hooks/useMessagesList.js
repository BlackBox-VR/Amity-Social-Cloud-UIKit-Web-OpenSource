import { useState, useEffect, useRef } from 'react';
import { MessageRepository, ReactionRepository } from '@amityco/js-sdk';
import orderBy from 'lodash/orderBy';

function useMessagesList(channelId) 
{
  const [messages, setMessages] = useState([]);
  const [messagesWithReactions, setMessagesWithReactions] = useState([]);
  const initialLoadDone = useRef(false);
  const messageCollectionRef = useRef(null);

  useEffect(() => 
  {
    const messageCollection = MessageRepository.queryMessages({ channelId });
    messageCollectionRef.current = messageCollection;

    const handleDataUpdated = () => 
    {
      setMessages(orderBy(messageCollection.models, 'createdAt', 'desc'));

      // Load next 20 messages if it's the initial load and there are more pages
      if (initialLoadDone.current == false && messageCollection.prevPage && messageCollection.prevPage() != undefined) 
      {
        initialLoadDone.current = true;
        messageCollection.prevPage();
      }
    };

    messageCollection.on('dataUpdated', handleDataUpdated);

    return () => 
    {
      messageCollection.removeAllListeners('dataUpdated');
    };

  }, 
  [channelId]);

  useEffect(() => 
  {
    const fetchReactions = async () => {
      try {
        const updatedMessages = await Promise.all(
          messages.map(async (message) => 
          {
            const reactions = await ReactionRepository.queryReactions({ referenceId: message.messageId, referenceType: 'message' });
            return { ...message, reactions };
          })
        );
        setMessagesWithReactions(orderBy(updatedMessages, 'createdAt', 'desc'));
      } catch (error) {
        console.error('Failed to fetch reactions:', error);
      }
    };

    if (messages.length)
    { 
        fetchReactions();
    }
  }, [messages]);

  const hasMore = messageCollectionRef.current ? messageCollectionRef.current.prevPage : false;

  const loadMore = () => 
  {
    if (messageCollectionRef.current && messageCollectionRef.current.prevPage && messageCollectionRef.current.prevPage() != undefined) 
    {
      messageCollectionRef.current.prevPage();
    }
  };

  return [messagesWithReactions, hasMore, loadMore];
}

export default useMessagesList;