import React from 'react';
import styled from 'styled-components';
import Skeleton from '~/core/components/Skeleton';

import { SIZES } from '~/core/hocs/withSize';

export const AvatarContainer = styled.div`
  position: relative;
`;

export const AvatarImage = styled(({ backgroundImage, children, loading, size, ...props }) => (
  <div {...props}>
    {loading ? (
      <Skeleton circle width="100%" height="100%" style={{ display: 'block' }} />
    ) : (
      children
    )}
  </div>
))`
  position: relative;
  flex-shrink: 0;
  overflow: hidden;

  ${({ backgroundImage, theme }) => `
    height: 52px;
    width: 52px;
    background: ${backgroundImage || theme.palette.base.shade3}};
    border: 3px solid #ECECEC;
  `};

  border-radius: 50%;

  &.visible img {
    opacity: 1;
  }

  &.clickable {
    &:hover {
      cursor: pointer;
    }
  }
`;

export const AvatarOverlay = styled.div`
  position: absolute;
  z-index: 2;
  opacity: 0.5;
  background-color: #000000;

  ${({ size }) => `
    height: ${SIZES[size]}px;
    width: ${SIZES[size]}px;
  `}
`;

export const Img = styled.img.attrs({ loading: 'lazy' })`
  height: 100%;
  width: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s;
`;

export const FileInput = styled.input.attrs({ type: 'file' })`
  &&& {
    display: none;
  }
`;

export const Trophies = styled.div`
  position: absolute;
  bottom: -3px;
  left: 0;
  right: 0;
  margin: auto;
  background: #000;
  width: 40px;
  height: 12.5px;
  border-radius: 6.5px;
  color: #fff !important;
  font-size: 7.5px;
  font-weight: 700;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    margin-left: 2px;
  }
`;
