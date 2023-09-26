import styled, { css } from 'styled-components';
import { Shield } from '~/icons';

export const InfoWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;

  ${({ showTime }) =>
    showTime &&
    css`
      & > ${ModeratorBadge} {
        &::after {
          content: '•';
          margin-left: 4px;
        }
      }
    `};
`;

export const ModeratorBadge = styled.div`
  display: flex;
  align-items: center;
  margin-right: 4px;
  color: ${({ theme }) => theme.palette.base.shade1};
  ${({ theme }) => theme.typography.captionBold};
`;

export const ShieldIcon = styled(Shield).attrs({
  height: '14px',
  width: '14px',
})`
  margin-right: 4px;
`;

export const MessageContainer = styled.div`
  color: ${({ theme }) => theme.palette.base.shade1};
  ${({ theme }) => theme.typography.caption}

  &::before {
    content: '• ';
    margin-left: 4px;
  }
`;
