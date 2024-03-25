import styled from 'styled-components';
import UiKitAvatar from '~/core/components/Avatar';

import { Close, EllipsisV, Save, Trash } from '~/icons';

export const EditingContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const EditingInput = styled.input`
  height: 34px;
  padding: 6px;
  margin: 5px;
  outline: none;
  border: 1px solid #e3e4e8;
  border-radius: 4px;
`;

export const SaveIcon = styled(Save)`
  opacity: 0.7;
  padding: 0 10px;
  cursor: pointer;
`;

export const DeleteIcon = styled(Trash)`
  opacity: 0.7;
  padding: 0 10px;
  cursor: pointer;
`;

export const CloseIcon = styled(Close)`
  opacity: 0.7;
  padding: 0 10px;
  cursor: pointer;
`;

export const MessageOptionsIcon = styled(EllipsisV).attrs({ width: 11, height: 11 })`
  color: white;
  opacity: 0.5;
  margin: 0 5px;
  cursor: pointer;
`;

export const Avatar = styled(UiKitAvatar)`
  margin-right: auto;
  width: 92px;
  height: 92px;
`;

export const MessageReservedRow = styled.div`
  display: flex;
  width: 100%;
  ${({ isIncoming }) => !isIncoming && 'justify-content: flex-end;'}
`;

export const MessageWrapper = styled.div`
  display: flex;
  gap: 12px;
  width: ${({ isAutoPost }) => (isAutoPost ? '90%' : '85%')};
`;

export const MessageContainer = styled.div`
  flex: 1;
`;

export const AvatarWrapper = styled.div`
  width: 92px;
  flex-shrink: 0;
`;

export const UserName = styled.div`
  color: black;
  font-size: 14.2px;
  font-weight: 500;
  margin-bottom: 4px;
`;

const CommonMessageBody = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
  padding: 9px;
  word-break: break-word;

  & pre {
    white-space: pre-wrap;
  }
`;

export const GeneralMessageBody = styled(CommonMessageBody)`
  ${({ theme, isIncoming }) =>
    isIncoming
      ? `
      background: white; 
      border-radius: 10px;
    `
      : `
      background: white;
      color: #000;
      border-radius: 10px;
  `}
`;

export const MemberActivityAutoPostBody = styled(CommonMessageBody)`
  background: #121212;
  color: white;
  border-radius: 10px;
  box-shadow: inset 0px 0px 8px 1px rgba(255, 255, 255, 0.55);
  padding: 12px;
`;

export const SharedQuestsAutoPostBody = styled(CommonMessageBody)`
  background: linear-gradient(#00a4ea, #5433ff);
  color: white;
  border-radius: 10px;
`;

export const AnnouncementsAutoPostBody = styled(CommonMessageBody)`
  background: linear-gradient(#ffc700, #e65c00);
  color: white;
  border-radius: 10px;
`;

export const ArenaRaidAutoPostBody = styled(CommonMessageBody)`
  background: linear-gradient(#ff008a, #ff2d2d);
  color: white;
  border-radius: 10px;
`;

export const DeletedMessageBody = styled(CommonMessageBody)`
  text-align: ${({ isIncoming }) => (isIncoming ? 'left' : 'right')};
`;

export const UnsupportedMessageBody = styled(CommonMessageBody)`
  text-align: center;
  background: ${({ theme }) => theme.palette.neutral.shade4};
  border-radius: 10px;
`;

export const MessageDate = styled.div`
  font-size: 11px;
  opacity: 0.65;
`;

export const BottomLine = styled.div`
  margin-top: 3px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
