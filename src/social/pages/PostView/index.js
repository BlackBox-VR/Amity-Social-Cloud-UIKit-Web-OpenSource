import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Post from '~/social/components/post/Post';
import { Wrapper } from './styles';
import { BackButton, Header, Title } from '~/social/pages/CategoryCommunities/styles';
import ArrowLeft from '~/icons/ArrowLeft';

const PostView = forwardRef(({ postId }, ref) => {

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
});

PostView.propTypes = {
  postId: PropTypes.string.isRequired
};

export default PostView;
