import React, { forwardRef } from 'react';
import { PostTargetType } from '@amityco/js-sdk';

import { PageTypes } from '~/social/constants';
import Feed from '~/social/components/Feed';

import { useNavigation } from '~/social/providers/NavigationProvider';

import { Wrapper } from './styles';
import { BackButton, Header, Title } from '~/social/pages/CategoryCommunities/styles';
import ArrowLeft from '~/icons/ArrowLeft';
import PropTypes from 'prop-types';

const NewsFeed = forwardRef(({ isLandingPage }, ref) => {
  const { onBack, lastPage, onChangePage } = useNavigation();

  return (
    <Wrapper data-qa-anchor="news-feed">
      {lastPage.type === PageTypes.Search && (
        <Header>
          <BackButton onClick={onBack}>
            <ArrowLeft height={14} />
          </BackButton>
          <Title>{'Search & Communities'}</Title>
        </Header>
      )}
      <Feed
        targetType={PostTargetType.GlobalFeed}
        goToExplore={() => onChangePage(PageTypes.Explore)}
        showPostCreator
      />
    </Wrapper>
  );
});

NewsFeed.propTypes = {
  isLandingPage: PropTypes.bool,
};

export default NewsFeed;
