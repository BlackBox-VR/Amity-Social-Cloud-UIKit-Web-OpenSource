import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Lock } from '~/icons';

export const FeedScrollContainer = styled(InfiniteScroll)`
  > :not(:first-child) {
    margin-top: 20px;
  }

  & .post:not(:first-child) {
    margin-top: 20px;
  }

  & .load-more {
    margin-top: 20px;
    margin-bottom: 20px;
  }
`;

export const PrivateFeedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  > * {
    margin-top: 10px;
  }

  color: ${({ theme }) => theme.palette.base.shade3};
  padding: 5rem 0.5rem;
  background: ${({ theme }) => theme.palette.system.background};
  color: ${({ theme }) => theme.palette.base.shade3};
  ${({ theme }) => theme.typography.body};
`;

export const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const LockIcon = styled(Lock).attrs({ width: 40, height: 40 })`
  fill: ${({ theme }) => theme.palette.base.shade2};
`;

export const PrivateFeedTitle = styled.div`
  font-weight: 600;
  font-size: 17px;
  color: ${({ theme }) => theme.palette.base.main};
`;

export const PrivateFeedBody = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.palette.base.shade1};
`;

export const FeedError = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 16px;
  text-align: center;
  color: ${({ theme }) => theme.palette.base.main};
  ${({ theme }) => theme.typography.body};

  button {
    cursor: pointer;
    border: 1px solid ${({ theme }) => theme.palette.primary.main};
    background: transparent;
    color: ${({ theme }) => theme.palette.primary.main};
    border-radius: 4px;
    padding: 8px 16px;
  }
`;
