import styled from 'styled-components';

import UiKitAvatar from '~/core/components/Avatar';
import { BANNER_SPRITES_URL } from '~/constants';

export const MessageHeaderWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
`;

export const MessageHeaderAvatar = styled(UiKitAvatar)`
  margin-right: 5px;
  border: 2px solid #fff;
  width: 92px;
  height: 92px;
`;

export const MessageHeaderContent = styled.div`
  flex: 1;
  padding: 4px 10px;
  background-image: url(${({ background }) => background});
  background-color: black;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 10px;
  height: 92px;
`;
export const MessageHeaderUserName = styled.div`
  background: linear-gradient(180deg, #f87ae6 0%, #df077b 36.98%, #be3ac8 58.39%, #762188 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: Futura;
  font-size: 14px;
  font-style: normal;
  font-weight: 800;
  line-height: 18px;
  text-transform: uppercase;
`;
export const XpTitle = styled.div`
  color: #f1f1f1;
  font-family: Futura;
  font-size: 12px;
  font-style: normal;
  font-weight: 450;
  text-transform: uppercase;

  & span {
    font-size: 12px;
    line-height: 16px;
    color: #009ede;
  }
`;
