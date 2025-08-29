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

const channelRepo = new ChannelRepository();

const ChatApplication = ({
                           membershipFilter,
                           defaultChannelId,
                           onMemberSelect,
                           onChannelSelect,
                           onAddNewChannel,
                           onEditChatMember,
                         }) => {
  const { formatMessage } = useIntl();
  const [currentChannelData, setCurrentChannelData] = useState(null);
  const [shouldShowChatDetails, setShouldShowChatDetails] = useState(false);
  const [isChatModalOpened, setChatModalOpened] = useState(false);
  const [systemMessage, setSystemMessage] = useState('');
  const [channelCreated, setChannelCreated] = useState(false);

  const showChatDetails = () => setShouldShowChatDetails(true);
  const hideChatDetails = () => setShouldShowChatDetails(false);
  const openChatModal = () => setChatModalOpened(true);

  const { currentUserId } = useSDK();

  const handleChannelSelect = (newChannelData) => {
    if (currentChannelData?.channelId === newChannelData?.channelId) return;

    console.log(`Activating chat channel: '${newChannelData?.channelId}'`);
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

  useEffect(() => {
    let userLiveObj;
    let channelLiveObj;
    let createdLiveChannel;

    const once = (liveObj, event) =>
        new Promise((resolve, reject) => {
          const onUpdate = (data) => {
            cleanup();
            resolve(data);
          };
          const onError = (err) => {
            cleanup();
            reject(err);
          };
          const cleanup = () => {
            liveObj.off('dataUpdated', onUpdate);
            liveObj.off('dataError', onError);
          };
          liveObj.once('dataUpdated', onUpdate);
          liveObj.once('dataError', onError);
        });

    const initChat = async () => {
      try {
        // 1) Load current user once
        userLiveObj = UserRepository.getUser(currentUserId);
        const userModel = await once(userLiveObj, 'dataUpdated').catch(() => null);

        if (!userModel || !userModel.metadata?.teamId) {
          console.log('Retrieved user, but without proper team metadata. Returning.');
          return;
        }

        const teamId = userModel.metadata.teamId;
        const teamName = userModel.metadata.teamName;
        const isLeader = userModel.userId === userModel.metadata.teamLeaderId;

        // 2) Try to load exactly the one channel by id (no broad queries)
        console.log(`Looking up team channel '${teamId}'`);
        channelLiveObj = ChannelRepository.getChannel(teamId);

        const channelData = await once(channelLiveObj, 'dataUpdated').catch(() => null);

        if (channelData?.channelId) {
          console.log(`Found team channel '${channelData.channelId}', joining (if needed) and entering.`);
          try {
            await ChannelRepository.joinChannel({ channelId: channelData.channelId });
          } catch (e) {
            // If already a member, joinChannel may fail; that’s fine.
            console.log('joinChannel skipped or failed (likely already joined). Proceeding.');
          }
          handleChannelSelect({ channelId: channelData.channelId, channelType: channelData.type ?? ChannelType.Standard });
          setSystemMessage('');
          return;
        }

        // 3) Channel not found — create only if leader
        if (!isLeader) {
          console.log(`No channel exists for team '${teamId}', and user is not the team leader. Showing message.`);
          setSystemMessage('The Team Leader must log in to create this team\'s chat channel.');
          return;
        }

        console.log(`Creating team channel '${teamId}' as leader...`);
        createdLiveChannel = ChannelRepository.createChannel({
          channelId: teamId,
          type: ChannelType.Live,
          displayName: teamName || `Team ${teamId}`,
          userIds: [userModel.userId],
        });

        const created = await once(createdLiveChannel, 'dataUpdated');
        console.log(`Channel created successfully! ${created.channelId}`);

        // Join (should be auto-added as creator, but ensure)
        try {
          await ChannelRepository.joinChannel({ channelId: created.channelId });
        } catch (e) {
          console.log('joinChannel after create skipped or failed (likely already member).');
        }

        setSystemMessage('');
        setChannelCreated((prev) => !prev);
        handleChannelSelect({ channelId: created.channelId, channelType: created.type ?? ChannelType.Live });
      } catch (error) {
        console.error('An error occurred: ', error);
      }
    };

    initChat();

    return () => {
      // best-effort listener cleanup if any remain
      try {
        userLiveObj?.removeAllListeners?.();
        channelLiveObj?.removeAllListeners?.();
        createdLiveChannel?.removeAllListeners?.();
      } catch { /* noop */ }
    };
  }, [currentUserId]); // no channels dependency — we no longer query the list

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