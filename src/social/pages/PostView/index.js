import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import Post from '~/social/components/post/Post';
import { Wrapper } from './styles';
import { BackButton, Header, Title } from '~/social/pages/CategoryCommunities/styles';
import { useNavigation } from '~/social/providers/NavigationProvider';
import ArrowLeft from '~/icons/ArrowLeft';
import { PageTypes } from '~/social/constants';

const PostView = forwardRef(({ postId }, ref) => {

  const { onBack, lastPage } = useNavigation();
  
  return (
    // key prop is necessary here, without it this part will never re-render !!!
    <Wrapper>
      <Header>        
        <BackButton onClick={onBack}>
          <ArrowLeft height={14} />
        </BackButton>

        {lastPage.type === PageTypes.NewsFeed && <Title onClick={onBack}>{'Main Feed'}</Title>}
        {lastPage.type === PageTypes.Search && <Title onClick={onBack}>{'Search & Communities'}</Title>}
        {lastPage.type === PageTypes.Explore && <Title onClick={onBack}>{'Explore'}</Title>}
        {lastPage.type === PageTypes.CommunityFeed && <Title onClick={onBack}>{'Community Feed'}</Title>}

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
