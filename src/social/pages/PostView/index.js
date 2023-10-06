import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { PostTargetType } from '@amityco/js-sdk';

import withSDK from '~/core/hocs/withSDK';
import * as utils from '~/helpers/utils';
import MediaGallery from '~/social/components/MediaGallery';

import UserInfo from '~/social/components/UserInfo';
import FeedHeaderTabs from '~/social/components/FeedHeaderTabs';

import Feed from '~/social/components/Feed';
import Followers from '~/social/pages/UserFeed/Followers';

import { tabs, UserFeedTabs } from './constants';
import { FollowersTabs } from '~/social/pages/UserFeed/Followers/constants';
import useFollow from '~/core/hooks/useFollow';
import { Wrapper } from './styles';
import { StyledTabs } from '~/social/pages/Search/styles';
import { BackButton, Header, Title } from '~/social/pages/CategoryCommunities/styles';
import ArrowLeft from '~/icons/ArrowLeft';
import { PageTypes } from '~/social/constants';
import { useNavigation } from '~/social/providers/NavigationProvider';

const PostView = ({ postId }) => {

  const { onBack, lastPage } = useNavigation();

  return (
    // key prop is necessary here, without it this part will never re-render !!!
    <Wrapper>
      <Header>

        <BackButton onClick={onBack}>
          <ArrowLeft height={14} />
        </BackButton>

        <Title>{'Main Feed'}</Title>

      </Header> 

      <Post
        key={postId}
        postId={postId}
        hidePostTarget={true}
        readonly={false}
      />
      
    </Wrapper>
  );
};

PostView.propTypes = {
  postId: PropTypes.string.isRequired
};

export default withSDK(PostView);
