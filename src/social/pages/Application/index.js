import React, { forwardRef } from 'react';
import styled from 'styled-components';

import { PageTypes } from '~/social/constants';

import MainLayout from '~/social/layouts/Main';

import ExplorePage from '~/social/pages/Explore';
import NewsFeedPage from '~/social/pages/NewsFeed';
import CommunityFeedPage from '~/social/pages/CommunityFeed';
import UserFeedPage from '~/social/pages/UserFeed';
import CategoryCommunitiesPage from '~/social/pages/CategoryCommunities';
import CommunityEditPage from '~/social/pages/CommunityEdit';
import ProfileSettings from '~/social/components/ProfileSettings';
import { useNavigation } from '~/social/providers/NavigationProvider';
import UiKitSocialSearch from '~/social/components/SocialSearch';
import PropTypes from 'prop-types';
import Search from '~/social/pages/Search';
import ChatSearch from '~/social/pages/ChatSearch';
import PostView from '~/social/pages/PostView';
import { useSDK } from '~/core/hooks/useSDK';

const ApplicationContainer = styled.div`
  height: 100%;
  width: 100%;
`;

const SocialSearch = styled(UiKitSocialSearch)`
  background: ${({ theme }) => theme.palette.system.background};
  padding: 0.5rem;
`;
var hasLanded = false;

const Community = forwardRef(({ landingPage, postId = "" }, ref) => {

  console.log("COMMUNITY: landingPage: " + landingPage + ", postId: " + postId);

  const { currentUserId } = useSDK();
  const { page, lastPage, onChangePage } = useNavigation(landingPage);

  if (landingPage && !hasLanded && landingPage !== PageTypes.NewsFeed) 
  {
    hasLanded = true;
    onChangePage(landingPage);
  } 
  else 
  {
    hasLanded = true;
  }

  console.log("COMMUNITY: it gets past conditions, to render the page");

  return (
    <ApplicationContainer>
      <MainLayout isDarkTheme={page.type === PageTypes.Search || page.type === PageTypes.ChatSearch}>
        {page.type === PageTypes.Explore && (
          <ExplorePage
            isLandingPage={
              !!landingPage &&
              lastPage.type === PageTypes.NewsFeed &&
              landingPage === PageTypes.Explore
            }
          />
        )}

        {page.type === PageTypes.NewsFeed && (
          <NewsFeedPage isLandingPage={!!landingPage && landingPage !== PageTypes.NewsFeed} />
        )}

        {page.type === PageTypes.CommunityFeed && (
          <CommunityFeedPage communityId={page.communityId} isNewCommunity={page.isNewCommunity} />
        )}

        {page.type === PageTypes.CommunityEdit && (
          <CommunityEditPage communityId={page.communityId} tab={page.tab} />
        )}

        {page.type === PageTypes.Category && (
          <CategoryCommunitiesPage categoryId={page.categoryId} />
        )}

        {page.type === PageTypes.UserFeed && <UserFeedPage userId={page.userId} />}

        {page.type === PageTypes.UserEdit && <ProfileSettings userId={page.userId} />}

        {page.type === PageTypes.Search && <Search userId={currentUserId} />}

        {page.type === PageTypes.ChatSearch && <ChatSearch userId={currentUserId} />}

        {page.type === PageTypes.Post && postId != null && <PostView postId={postId} />}

      </MainLayout>
    </ApplicationContainer>
  );
});

Community.propTypes = {
  landingPage: PropTypes.string,
  postId: PropTypes.string
};

export default Community;
