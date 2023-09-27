import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import TruncateMarkup from 'react-truncate-markup';

import Skeleton from '~/core/components/Skeleton';
import customizableComponent from '~/core/hocs/customization';
import Avatar from '~/core/components/Avatar';
import BanIcon from '~/icons/Ban';
import { backgroundImage as UserImage } from '~/icons/User';
import {
  Name,
  PostInfo,
  ArrowSeparator,
  PostHeaderContainer,
  PostNamesContainer,
  PostXpTeamName,
  XpTitle,
} from './styles';

const UIPostHeader = ({
  avatarFileUrl,
  postAuthorName,
  postTargetName,
  onClickCommunity,
  onClickUser,
  hidePostTarget,
  trophies,
  xpTitle,
  teamName,
  loading,
  isBanned,
}) => {
  const renderPostNames = () => {
    return (
      <>
        <PostNamesContainer data-qa-anchor="post-header-post-names">
          <TruncateMarkup lines={3}>
            <Name
              data-qa-anchor="post-header-post-name"
              className={cx({ clickable: !!onClickUser })}
              onClick={onClickUser}
            >
              {postAuthorName}
            </Name>
          </TruncateMarkup>

          {isBanned && <BanIcon height={14} width={14} />}

          {postTargetName && !hidePostTarget && (
            <>
              <ArrowSeparator />
              <Name
                data-qa-anchor="post-header-post-target-name"
                className={cx({ clickable: !!onClickCommunity })}
                onClick={onClickCommunity}
              >
                {postTargetName}
              </Name>
            </>
          )}
        </PostNamesContainer>

        <PostXpTeamName>
          {xpTitle && (
            <>
              <XpTitle>
                XP title: <span>{xpTitle}</span>
              </XpTitle>
            </>
          )}
          {teamName && (
            <XpTitle>
              Team: <span>{teamName}</span>
            </XpTitle>
          )}
        </PostXpTeamName>
      </>
    );
  };

  return (
    <PostHeaderContainer data-qa-anchor="post-header">
      <Avatar
        data-qa-anchor="post-header-avatar"
        avatar={avatarFileUrl}
        backgroundImage={UserImage}
        trophies={trophies}
        loading={loading}
        onClick={onClickUser}
      />
      <PostInfo data-qa-anchor="post-header-post-info">
        {loading ? (
          <>
            <div>
              <Skeleton width={96} style={{ fontSize: 8 }} />
            </div>
            <Skeleton width={189} style={{ fontSize: 8 }} />
          </>
        ) : (
          renderPostNames()
        )}
      </PostInfo>
    </PostHeaderContainer>
  );
};

UIPostHeader.propTypes = {
  avatarFileUrl: PropTypes.string,
  postAuthorName: PropTypes.node,
  postTargetName: PropTypes.string,
  hidePostTarget: PropTypes.bool,
  trophies: PropTypes.number,
  xpTitle: PropTypes.string,
  teamName: PropTypes.string,
  loading: PropTypes.bool,
  isBanned: PropTypes.bool,
  onClickCommunity: PropTypes.func,
  onClickUser: PropTypes.func,
};

UIPostHeader.defaultProps = {
  avatarFileUrl: '',
  postAuthorName: '',
  postTargetName: '',
  hidePostTarget: false,
  trophies: 0,
  xpTitle: '',
  teamName: 'No Team Name',
  loading: false,
  isBanned: false,
  onClickCommunity: null,
  onClickUser: null,
};

export default customizableComponent('UIPostHeader', UIPostHeader);
