import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChannelMembership, ChannelType, ChannelRepository, MemberFilter } from '@amityco/js-sdk';
import { useIntl } from 'react-intl';

import { notification } from '~/core/components/Notification';
import RecentChat from '~/chat/components/RecentChat';
import Chat from '~/chat/components/Chat';
import ChatDetails from '~/chat/components/ChatDetails';

import { ApplicationContainer } from './styles';
import CreateChatModal from '~/chat/components/Chat/CreateChatModal';

import { useSDK } from '~/core/hooks/useSDK';
import useUser from '~/core/hooks/useUser';
import { UserRepository } from '@amityco/js-sdk';
import useChannelsList from '~/chat/hooks/useChannelsList';

const channelRepo = new ChannelRepository();

const ChatApplication = ({
  membershipFilter,
  defaultChannelId,
  onMemberSelect,
  onChannelSelect,
  onAddNewChannel,
  onEditChatMember,
}) => {
  const waitForLiveObject = (liveObj, { timeoutMs = 10000 } = {}) =>
      new Promise((resolve, reject) => {
        // 1) Resolve immediately if hydrated (Amity usually puts the model on .model or .data)
        const model = liveObj?.model ?? liveObj?.data ?? liveObj?.payload;
        if (model) return resolve(model);

        let done = false;
        const finish = (fn) => (value) => {
          if (done) return;
          done = true;
          try {
            liveObj.off?.('dataUpdated', onUpdate);
            liveObj.off?.('dataError', onError);
          } catch {}
          clearTimeout(timer);
          fn(value);
        };

        const onUpdate = finish(resolve);
        const onError  = finish((err) => reject(err instanceof Error ? err : new Error(String(err))));
        const timer    = setTimeout(finish(() => reject(new Error('Timed out waiting for dataUpdated'))), timeoutMs);

        liveObj.once('dataUpdated', onUpdate);
        liveObj.once('dataError', onError);
      });
  
  const { formatMessage } = useIntl();
  const [currentChannelData, setCurrentChannelData] = useState(null);
  const [shouldShowChatDetails, setShouldShowChatDetails] = useState(false);

  const showChatDetails = () => setShouldShowChatDetails(true);
  const hideChatDetails = () => setShouldShowChatDetails(false);

  const [isChatModalOpened, setChatModalOpened] = useState(false);
  const openChatModal = () => setChatModalOpened(true);

  const handleChannelSelect = (newChannelData) => 
  {
    console.log(`Activating chat channel: '${newChannelData?.channelId}'!`);
    if (currentChannelData?.channelId === newChannelData?.channelId) return;

    hideChatDetails();
    onChannelSelect(newChannelData);
    setCurrentChannelData(newChannelData);
  };

  const leaveChat = () => {
    ChannelRepository.leaveChannel(currentChannelData?.channelId)
      .then(() => {
        notification.success({
          content: formatMessage({ id: 'chat.leaveChat.success' }),
        });
      })
      .catch(() => {
        notification.error({
          content: formatMessage({ id: 'chat.leaveChat.error' }),
        });
      });

    setCurrentChannelData(null);
  };

  const { currentUserId, client } = useSDK();
  const [systemMessage, setSystemMessage] = useState('');
  const [channels] = useChannelsList();
  const [channelCreated, setChannelCreated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let inFlight = false;

    const initChat = async () => {
      if (inFlight) return; // prevent overlapping runs
      inFlight = true;
      try {
        console.log('--- Channels List ---');
        console.log(channels);

        const userLive = UserRepository.getUser(currentUserId);
        const userModel = await waitForLiveObject(userLive).catch((e) => {
          console.warn('Failed to load user:', e);
          return null;
        });
        if (cancelled) return;

        if (!userModel?.metadata?.teamId) {
          console.log('Retrieved user, but without proper team metadata. Returning.');
          return;
        }

        const teamId = userModel.metadata.teamId;

        // Fast path if hook already provided the team channel
        if (channels?.length) {
          const teamChannel = channels.find(c => c.channelId === teamId);
          if (teamChannel) {
            console.log('Found matching team channel, entering...', teamChannel.channelId);
            handleChannelSelect({ channelId: teamChannel.channelId, channelType: teamChannel.type ?? ChannelType.Standard });
            return;
          }
        }

        // Try joining (no-op if already a member)
        try {
          await ChannelRepository.joinChannel({ channelId: teamId });
        } catch (e) {
          // Many SDKs throw if already joined; not fatal
          console.debug('joinChannel non-fatal:', e);
        }
        if (cancelled) return;

        // Fetch the channel model (resolve immediately if hydrated)
        const channelLive = ChannelRepository.getChannel(teamId);
        const channelData = await waitForLiveObject(channelLive).catch((e) => {
          console.warn('Failed to fetch channel:', e);
          return null;
        });
        if (cancelled) return;

        if (channelData?.channelId) {
          console.log(`Channel '${channelData.displayName}' exists. Entering.`);
          // Optional: ensure joined (idempotent)
          try {
            await ChannelRepository.joinChannel({ channelId: channelData.channelId });
          } catch {}
          handleChannelSelect({ channelId: channelData.channelId, channelType: channelData.type ?? ChannelType.Standard });
          return;
        }

        // Channel doesn't exist — only leader should create
        if (userModel.userId === userModel.metadata.teamLeaderId) {
          console.log('Leader detected; creating team channel…');
          const liveCreate = ChannelRepository.createChannel({
            channelId: teamId,
            type: ChannelType.Standard,      // keep consistent with UI assumptions
            displayName: userModel.metadata.teamName,
            userIds: [userModel.userId],
          });

          liveCreate.once('dataUpdated', (model) => {
            if (cancelled) return;
            console.log(`Channel created successfully! ${model.channelId}`);
            setSystemMessage('');
            setChannelCreated(prev => !prev); // triggers the effect again, but guarded
            handleChannelSelect({ channelId: model.channelId, channelType: model.type ?? ChannelType.Standard });
          });

          liveCreate.once('dataError', (error) => {
            console.error('Channel creation failed:', error);
            notification.error({ content: formatMessage({ id: 'chat.create.error' }) });
          });
        } else {
          console.log(`User ${userModel.displayName} is not the team leader; delaying creation.`);
          setSystemMessage("The Team Leader is required to log-in to generate this team's chat channel!");
        }
      } catch (err) {
        console.error('initChat error:', err);
      } finally {
        inFlight = false;
      }
    };

    initChat();
    return () => { cancelled = true; };
  }, [channels, channelCreated, currentUserId]); // include currentUserId (was missing)

  return (
    <ApplicationContainer>
      {currentChannelData && (
        <Chat
          channelId={currentChannelData.channelId}
          shouldShowChatDetails={shouldShowChatDetails}
          onChatDetailsClick={showChatDetails}
          chatSystemMessage={systemMessage}
        />
      )}
      {shouldShowChatDetails && currentChannelData && (
        <ChatDetails
          channelId={currentChannelData.channelId}
          leaveChat={leaveChat}
          onEditChatMemberClick={onEditChatMember}
          onMemberSelect={onMemberSelect}
          onClose={hideChatDetails}
        />
      )}
      {isChatModalOpened && <CreateChatModal onClose={() => setChatModalOpened(false)} />}
    </ApplicationContainer>
  );
};

ChatApplication.propTypes = {
  membershipFilter: PropTypes.oneOf(Object.values(ChannelMembership)),
  defaultChannelId: PropTypes.string,
  onMemberSelect: PropTypes.func,
  onChannelSelect: PropTypes.func,
  onAddNewChannel: PropTypes.func,
  onEditChatMember: PropTypes.func,
};

ChatApplication.defaultProps = {
  membershipFilter: ChannelMembership.None,
  defaultChannelId: null,
  onMemberSelect: () => {},
  onChannelSelect: () => {},
  onAddNewChannel: () => {},
  onEditChatMember: () => {},
};

export default ChatApplication;