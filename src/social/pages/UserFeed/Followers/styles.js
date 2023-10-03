import styled from 'styled-components';

import EmptyState from '~/core/components/EmptyState';
import Avatar from '~/core/components/Avatar';
import { blueBackgroundImage, greyBackgroundImage } from '~/icons/GlassPanelCircle';

export const UserHeaderContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 10px;
  color: #fff;

  > * {
    width: 100%;
  }
`;

export const ButtonsContainer = styled.div`
  display: flex;
  padding: 15px;
  border-top: 1px solid ${({ theme }) => theme.palette.base.shade4};

  > *:first-child {
    margin-right: 10px;
  }
`;

export const Header = styled.div`
  display: grid;
  grid-template-areas: ${({ isShowFollow }) =>
    isShowFollow ? `'avatar title trophies button'` : `'avatar title level trophies'`};
  grid-template-columns: ${({ isShowFollow }) =>
    isShowFollow ? 'min-content auto 80px 100px' : 'min-content auto 70px 80px'};
  grid-gap: 0 0.5em;

  div > div {
    border-radius: 0;
    border: 1px solid #313131;
  }
`;

export const ListEmptyState = styled(EmptyState)`
  width: 100%;
`;

export const UserHeaderAvatar = styled(Avatar)`
  grid-area: avatar;
`;

export const UserHeaderTitle = styled.div`
  grid-area: title;
  ${({ theme }) => theme.typography.body}
  display: flex;
  min-width: 0;
  align-items: center;

  > span {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    font-family: 700;
    text-transform: capitalize;
    margin-right: 5px;
    cursor: pointer;
  }

  svg {
    width: 15px;
    height: 15px;
  }
`;

export const UserHeaderLevel = styled.div`
  grid-area: level;
  ${({ theme }) => theme.typography.body}
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const UserHeaderTrophies = styled.div`
  grid-area: trophies;
  ${({ theme }) => theme.typography.body}
  display: flex;
  flex-direction: row;
  align-items: center;
  text-transform: uppercase;

  svg {
    width: 12px;
    height: 12px;
    margin-left: 8px;
  }
`;

export const UserFollow = styled.div`
  grid-area: button;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const FollowButton = styled.button`
  background: ${({ disabled }) => (!disabled ? blueBackgroundImage : greyBackgroundImage)};
  width: 84px;
  height: 30px;
  border: 0;
  color: #ffffff;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  ${({ theme }) => theme.typography.captionBold}

  &:hover:not(:disabled) {
    opacity: 0.8;
  }

  &:active:not(:disabled) {
    opacity: 0.6;
  }
`;
