import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { PostTargetType } from '@amityco/js-sdk';

import withSDK from '~/core/hocs/withSDK';
import * as utils from '~/helpers/utils';

import { Wrapper } from './styles';
import { StyledTabs } from '~/social/pages/Search/styles';
import { BackButton, Header, Title } from '~/social/pages/CategoryCommunities/styles';
import ArrowLeft from '~/icons/ArrowLeft';
import { PageTypes } from '~/social/constants';
import { useNavigation } from '~/social/providers/NavigationProvider';

const PostView = ({ postId }) => {

  console.log("POST VIEW it gets here with postId: " + postId);

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
