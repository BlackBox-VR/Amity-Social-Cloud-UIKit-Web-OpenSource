import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { ChannelRepository, UserRepository } from '@amityco/js-sdk';

import UserAvatar from '~/chat/components/UserAvatar';
import customizableComponent from '~/core/hocs/customization';
import useLiveObject from '~/core/hooks/useLiveObject';
import { backgroundImage as userBackgroundImage } from '~/icons/User';
import useChatInfo from '~/chat/hooks/useChatInfo';

import {
  ChatHeaderContainer,
  DetailsIcon,
  Channel,
  ChannelInfo,
  ChannelName,
  MemberCount,
} from './styles';

const ChatHeader = ({ channelId, secondUserId, onChatDetailsClick, shouldShowChatDetails }) => {
  const [ secondUser, setSecondUser ] = useState(null);
  const channel = useLiveObject(() => ChannelRepository.getChannel(channelId), [channelId]);
  const { chatName, chatAvatar } = useChatInfo({ channel });

  useEffect(() => {
    let liveUser = UserRepository.getUser(secondUserId);
    liveUser.once('dataUpdated', (model) => {
      setSecondUser(model);
    });
  }, [secondUserId]);

  return (
    <ChatHeaderContainer data-qa-anchor="chat-header">
      <Channel>
        <UserAvatar
          avatarUrl={secondUser?.avatarCustomUrl}
          defaultImage={userBackgroundImage}
        />
        <ChannelInfo data-qa-anchor="chat-header-channel-info">
          <ChannelName data-qa-anchor="chat-header-channel-info-channel-name">
            {secondUser?.displayName || ""}
          </ChannelName>
          {/* <MemberCount data-qa-anchor="chat-header-channel-info-member-count">
            <FormattedMessage id="chat.members.count" values={{ count: channel.memberCount }} />
          </MemberCount> */}
        </ChannelInfo>
      </Channel>
      {!shouldShowChatDetails && false && <DetailsIcon onClick={onChatDetailsClick} />}
    </ChatHeaderContainer>
  );
};

export default customizableComponent('ChatHeader', ChatHeader);
