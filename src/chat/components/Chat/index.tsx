import React, { useEffect } from 'react';
import { MessageRepository, SubChannelRepository } from '@amityco/ts-sdk';

import MessageList from '~/chat/components/MessageList';
import MessageComposeBar from '~/chat/components/MessageComposeBar';

import ChatHeader from '~/chat/components/ChatHeader';

import { ChannelContainer } from './styles';
import { useCustomComponent } from '~/core/providers/CustomComponentsProvider';
import { useChannelPermission } from '~/chat/hooks/useChannelPermission';
import useChannel from '~/chat/hooks/useChannel';

interface ChatProps {
  channelId: string;
  subChannelId: string;
  onChatDetailsClick: () => void;
  shouldShowChatDetails: boolean;
  shouldShowChatHeader?: boolean;
}

const Chat = ({
  channelId,
  subChannelId,
  onChatDetailsClick,
  shouldShowChatDetails,
  shouldShowChatHeader,
}: ChatProps) => {
  useEffect(() => {
    return () => {
      SubChannelRepository.stopMessageReceiptSync(subChannelId);
    };
  }, [subChannelId]);

  const { isModerator } = useChannelPermission(channelId);
  const channel = useChannel(channelId);
  console.log('Channel:', channel);

  const sendMessage = async (text: string) => {
    return MessageRepository.createMessage({
      subChannelId: subChannelId,
      data: { text },
      dataType: 'text',
    });
  };

  const renderMessageComposeBar = () => {
    if (channel?.type !== 'broadcast' || (channel?.type === 'broadcast' && isModerator)) {
      return <MessageComposeBar onSubmit={sendMessage} />;
    }
    return null;
  };

  return (
    <ChannelContainer>
      {shouldShowChatHeader ? (
        <ChatHeader
          channelId={channelId}
          shouldShowChatDetails={shouldShowChatDetails}
          onChatDetailsClick={onChatDetailsClick}
        />
      ) : null}
      <MessageList subChannelId={subChannelId} />
      {renderMessageComposeBar()}
    </ChannelContainer>
  );
};

export default (props: ChatProps) => {
  const CustomComponentFn = useCustomComponent<ChatProps>('Chat');

  if (CustomComponentFn) return CustomComponentFn(props);

  return <Chat {...props} />;
};
