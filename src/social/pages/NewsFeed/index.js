import React from 'react';
import { PostTargetType } from '@amityco/js-sdk';

import { BBVR_GLOBAL_COMMUNITY_ID } from '~/constants';
import Feed from '~/social/components/Feed';
import { PageTypes } from '~/social/constants';
import { useNavigation } from '~/social/providers/NavigationProvider';

import { Wrapper } from './styles';
import { BackButton, Header, Title } from '~/social/pages/CategoryCommunities/styles';
import ArrowLeft from '~/icons/ArrowLeft';

const NewsFeed = () => {
  const { onBack, lastPage, onChangePage } = useNavigation();

  return (
    <Wrapper data-qa-anchor="news-feed">
      {lastPage.type === PageTypes.Search && (
        <Header>
          <BackButton onClick={onBack}>
            <ArrowLeft height={14} />
          </BackButton>
          <Title>Search & Communities</Title>
        </Header>
      )}
      <Feed
        useContentSearch
        targetType={PostTargetType.CommunityFeed}
        targetId={BBVR_GLOBAL_COMMUNITY_ID}
        goToExplore={() => onChangePage(PageTypes.Explore)}
        showPostCreator
      />
    </Wrapper>
  );
};

export default NewsFeed;
