import cx from 'classnames';
import React from 'react';
import styled from 'styled-components';
import UIOptionMenu from '~/core/components/OptionMenu';
import Skeleton from '~/core/components/Skeleton';

export const OptionMenu = styled(UIOptionMenu)`
  margin-left: auto;
  margin-right: 5px;

  button:hover {
    background-color: transparent !important;
  }
`;

export const PostContainer = styled(({ className, ...props }) => (
  <div className={cx('post', className)} {...props} />
))`
  background: ${({ theme }) => theme.palette.system.background};
  border: 1px solid #edeef2;
  border-radius: 30px 30px 0 0;
  padding-bottom: 8px;
`;

export const PostHeadContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 2px 6px;
  background-color: black;
  background-image: url(${({ headerBgImage }) => headerBgImage});
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 30px 30px 0 0;

  * {
    color: #b1b1b1;
  }
`;

export const PostMainContainer = styled.div`
  padding: 12px;
`;

export const ReviewButtonsContainer = styled.div`
  border-top: 1px solid ${({ theme }) => theme.palette.base.shade4};
  margin-top: 6px;
  padding-top: 12px;
  display: flex;

  > * {
    flex: 1 1 0;

    &:not(:first-child) {
      margin-left: 12px;
    }
  }
`;

export const ContentSkeleton = () => {
  return (
    <>
      <div>
        <Skeleton style={{ fontSize: 8, maxWidth: 374 }} />
      </div>
      <div>
        <Skeleton style={{ fontSize: 8, maxWidth: 448 }} />
      </div>
      <div style={{ paddingBottom: 50 }}>
        <Skeleton style={{ fontSize: 8, maxWidth: 279 }} />
      </div>
    </>
  );
};
