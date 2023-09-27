import styled from 'styled-components';
import { ArrowRight } from '~/icons';

export const PostHeaderContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const PostInfo = styled.div`
  margin-left: 12px;
`;

export const Name = styled.div`
  ${({ theme }) => theme.typography.title}

  width: fit-content;
  background: linear-gradient(180deg, #f87ae6 0%, #df077b 36.98%, #be3ac8 58.39%, #762188 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: Futura;
  font-size: 26px;
  font-style: normal;
  font-weight: 800;
  line-height: normal;
  text-transform: uppercase;
  -webkit-text-stroke: 0.5px #000;
  word-break: break-all;

  &.clickable {
    &:hover {
      cursor: pointer;
    }
  }
`;

export const ArrowSeparator = styled(ArrowRight).attrs({
  height: '8px',
  width: '8px',
})`
  color: ${({ theme }) => theme.palette.base.shade1};
`;

export const PostNamesContainer = styled.div`
  display: flex;
  align-items: center;

  > :not(:first-child) {
    margin-left: 0.25rem;
  }
`;

export const PostXpTeamName = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 28px;
  margin-bottom: 2px;
`;

export const XpTitle = styled.div`
  font-family: Futura;
  font-size: 11px;
  font-style: normal;
  font-weight: 450;
  line-height: normal;
  text-transform: uppercase;
  color: #b1b1b1;

  span {
    color: #f1f1f1;
  }
`;
