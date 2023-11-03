import styled from 'styled-components';
import { FileAttachment, ImageAttachment, SendMessage } from '~/icons';

export const SendMessageIcon = styled(SendMessage).attrs({ width: 28, height: 28 })`
  cursor: pointer;
  margin-left: 12px;
  margin-right: 8px;
  color: #0f86fe;
`;

export const ImageMessageIcon = styled(ImageAttachment).attrs({ width: 18, height: 18 })`
  cursor: pointer;
  margin-right: 20px;
  color: ${({ theme }) => theme.palette.neutral.main};
`;

export const FileMessageIcon = styled(FileAttachment).attrs({ width: 18, height: 18 })`
  margin-right: 12px;
  cursor: pointer;
  color: ${({ theme }) => theme.palette.neutral.main};
`;

export const MessageComposeBarContainer = styled.div`
  padding: 13px;
  background: #2c2f31;
  border-top: 1px solid #2c2f31;
  display: flex;
  align-items: center;
`;

export const MessageComposeBarInput = styled.input`
  height: 36px;
  padding: 8px 10px 8px 10px;
  outline: none;
  border: 1px solid #2c2f31;
  border-radius: 16px;
  flex-grow: 1;
`;
