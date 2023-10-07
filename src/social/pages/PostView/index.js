import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import Post from '~/social/components/post/Post';
import { Wrapper } from './styles';

const PostView = forwardRef(({ postId }, ref) => {

  return (
    // key prop is necessary here, without it this part will never re-render !!!
    <Wrapper>
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
