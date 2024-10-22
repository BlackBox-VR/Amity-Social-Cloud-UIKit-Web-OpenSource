// ReactionUsersList.js
import React from 'react';
import styled from 'styled-components';
import UserAvatar from '~/chat/components/UserAvatar';

const ListContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 12px;
  max-height: 80%;
  width: 80%;
  overflow-y: auto;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  font-size: 38px;
  cursor: pointer;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 0;
`;

const UserInfo = styled.div`
  margin-left: 12px;
`;

const UserName = styled.div`
  font-weight: bold;
`;

const ReactionTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 10px;
  text-align: center;
`;

const ReactionUsersList = ({ users, reaction, onClose }) => {
  return (
    <ListContainer>
      <CloseButton onClick={onClose}>&times;</CloseButton>
      <ReactionTitle>Reacted with {reaction}</ReactionTitle>
      {users.map((user) => (
        <UserItem key={user.id}>
          <UserAvatar
            size="small"
            avatarUrl={user.avatarUrl}
            avatarCustomUrl={user.avatarCustomUrl}
            avatarFileId={user.avatarFileId}
          />
          <UserInfo>
            <UserName>{user.displayName}</UserName>
          </UserInfo>
        </UserItem>
      ))}
    </ListContainer>
  );
};

export default ReactionUsersList;
