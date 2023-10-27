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

  console.log("Hit the application page.");

  const { formatMessage } = useIntl();
  const [currentChannelData, setCurrentChannelData] = useState(null);
  const [shouldShowChatDetails, setShouldShowChatDetails] = useState(false);

  const showChatDetails = () => setShouldShowChatDetails(true);
  const hideChatDetails = () => setShouldShowChatDetails(false);

  const [isChatModalOpened, setChatModalOpened] = useState(false);
  const openChatModal = () => setChatModalOpened(true);

  const handleChannelSelect = (newChannelData) => 
  {
    console.log(`(Activating chat channel: '${newChannelData?.channelId}'!)`);
    if (currentChannelData?.channelId === newChannelData?.channelId) return;
    if (currentChannelData?.channelId == newChannelData?.channelId) return;

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
  const [userModel, setUserModel] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [systemMessage, setSystemMessage] = useState("");
  const [channels, hasMore, loadMore] = useChannelsList();
  var temporaryModel = null;


  useEffect(() => 
  {
    const initChat = async () => { // Turned into an async function
      try 
      {
        console.log("Hit useEffect.");
  
        if (channels != null && channels.length > 0 && selectedChannel == null) 
        {
          console.log("channels array existed, and had entries! Entering first one... ", channels[0].channelId);
          //console.log(`(Activating chat channel: '${channels[0].channelId}'!)`);
          handleChannelSelect({ channelId: channels[0].channelId, channelType: ChannelType.Standard });
        } 
        else 
        {
          let liveUser = UserRepository.getUser(currentUserId);
  
          const userModel = await new Promise(resolve => {
            liveUser.once('dataUpdated', model => resolve(model));
          });

          setUserModel(userModel);

          if (userModel && userModel.metadata.teamId) 
          {            
            const channelData = await new Promise((resolve, reject) => {
              let searchingChannel = ChannelRepository.getChannel(userModel.metadata.teamId);
              searchingChannel.once('dataUpdated', data => resolve(data));
              searchingChannel.once('dataError', error => reject(error));
            });
  
            if (channelData && channelData.channelId) 
            {
              console.log("Channel '" + channelData.displayName + "' exists. Entering.");

              // ChannelRepository.joinChannel({
              //   channelId: data.channelId
              // });

              // Team chat channel was found, so enter it 
              setSelectedChannel(channelData.channelId);
            } 
            else // channel not found
            {
              console.log("Error receiving channel: " + error);

              // Check if you're the leader of the team,
              if (temporaryModel.userId === temporaryModel.metadata.teamLeaderId)
              {
                // if you're the leader, create the channel
                const liveChannel = ChannelRepository.createChannel({
                  channelId: customChannel,
                  type: ChannelType.Live,
                  displayName : temporaryModel.metadata.teamName,
                  userIds: [ temporaryModel.userId ],
                })

                liveChannel.once('dataUpdated', model => 
                {
                  console.log(`Channel created successfully! ${model.channelId}`);
                  setSelectedChannel(customChannel);
                  setSystemMessage("");
                });
                
                liveChannel.once('dataError', error => 
                { 
                  console.log("Channel didn't get created: " + error); 
                });
              }
              
              // if you're not the team leader, display message "Please wait for leader to log-in and establish a team chat channel."
              else 
              {
                console.log("The user '"+temporaryModel.displayName+"' ("+temporaryModel.userId+") is not the team leader. Channel creation delayed. Returning.");

                // Display message that leader needs to log-in first to create chat channel
                setSystemMessage("The Team Leader is required to log-in to generate this team's chat channel!");
                return;
              }
            }
          } 
          else 
          {
            console.log("Retrieved user, but without proper team metadata. Returning.");
          }
        }
      } 
      catch (error) 
      {
        console.error("An error occurred: ", error);
      }
    };
  
    initChat();
  }, 
  [channels, selectedChannel]);

  
  return (
    <ApplicationContainer>
      {currentChannelData && (
        <Chat
          channelId={currentChannelData.channelId}
          shouldShowChatDetails={shouldShowChatDetails}
          onChatDetailsClick={showChatDetails}
          chatSystemMessage = {systemMessage}
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
