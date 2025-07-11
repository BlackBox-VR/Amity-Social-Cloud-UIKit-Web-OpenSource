import React, { useEffect, useState } from 'react';
import { SocialHomePage } from '~/v4/social/pages/SocialHomePage';
import { PostComposerPage } from '~/v4/social/pages/PostComposerPage';
import { PostDetailPage } from '~/v4/social/pages/PostDetailPage';
import { PageTypes, useNavigation } from '~/v4/core/providers/NavigationProvider';
import { SocialGlobalSearchPage } from '~/v4/social/pages/SocialGlobalSearchPage';
import { ViewStoryPage } from '~/v4/social/pages/StoryPage';
import { SelectPostTargetPage } from '~/v4/social/pages/SelectPostTargetPage';
import { MyCommunitiesSearchPage } from '~/v4/social/pages/MyCommunitiesSearchPage/MyCommunitiesSearchPage';
import styles from './Application.module.css';
import {
  AmityDraftStoryPage,
  CommunityAddCategoryPage,
  CommunityMembershipPage,
  CommunityPostPermissionPage,
  CommunityStorySettingPage,
  NotificationTrayPage,
} from '..';
import { StoryTargetSelectionPage } from '~/v4/social/pages/StoryTargetSelectionPage';
import CommunityFeed from '~/social/pages/CommunityFeed';
import { UserProfilePage } from '~/v4/social/pages/UserProfilePage';
import { EditUserProfilePage } from '~/v4/social/pages/EditUserProfilePage';
import CommunityEditPage from '~/social/pages/CommunityEdit';
import { CommunityProfilePage } from '~/v4/social/pages/CommunityProfilePage';
import { CommunityTabProvider } from '~/v4/core/providers/CommunityTabProvider';
import { AllCategoriesPage } from '~/v4/social/pages/AllCategoriesPage';
import { CommunitiesByCategoryPage } from '~/v4/social/pages/CommunitiesByCategoryPage';
import { MainLayout } from '~/v4/social/layouts/Main';
import { CommunitySideBar } from '~/v4/social/components/CommunitySideBar';
import { useResponsive } from '~/v4/core/hooks/useResponsive';
import { UserRelationshipPage } from '~/v4/social/pages/UserRelationshipPage';
import { UserPendingFollowRequestPage } from '~/v4/social/pages/UserPendingFollowRequestPage/UserPendingFollowRequestPage';
import { BlockedUserPage } from '~/v4/social/pages/BlockedUserPage/BlockedUserPage';
import { CommunitySetupPage } from '~/v4/social/pages/CommunitySetupPage';
import { CommunitySetupProvider } from '~/v4/social/providers/CommunitySetupProvider';
import { CommunityAddMemberPage } from '~/v4/social/pages/CommunityAddMemberPage/CommunityAddMemberPage';
import { CommunitySettingPage } from '~/v4/social/pages/CommunitySettingPage';
import { PendingPostsPage } from '~/v4/social/pages/PendingPostsPage';
import { PollTargetSelectionPage } from '~/v4/social/pages/PollTargetSelectionPage';
import { PollPostComposerPage } from '~/v4/social/pages/PollPostComposerPage';
import { LivestreamTerminatedPage } from '~/v4/social/pages/LivestreamTerminatedPage';
import { LiveStreamPlayerPage } from '~/v4/social/pages/LiveStreamPlayerPage';
import { useLayoutContext } from '~/v4/social/providers/LayoutProvider';

interface ApplicationProps {
  landingPage?: string;
  postId?: string;
}

const Application = ({ landingPage, postId }: ApplicationProps) => {
  const { isDesktop } = useResponsive();
  const [open, setOpen] = useState(false);
  const { page, goToSocialHomePage, setDefaultPage } = useNavigation();
  const { liveStreamPlayer } = useLayoutContext();
  const toggleOpen = () => setOpen((open) => !open);

  // Set initial page based on landingPage prop
  useEffect(() => {
    if (landingPage) {
      let initialPage: any;

      switch (landingPage) {
        case 'newsfeed': // AmityPageTypes.NewsFeed
          initialPage = { type: PageTypes.SocialHomePage, context: { communityId: undefined } };
          break;
        case 'search': // AmityPageTypes.Search
          initialPage = { type: PageTypes.SocialGlobalSearchPage, context: { tab: undefined } };
          break;
        case 'chatsearch': // AmityPageTypes.ChatSearch
          initialPage = { type: PageTypes.SocialGlobalSearchPage, context: { tab: 'chat' } };
          break;
        case 'post': // AmityPageTypes.Post
          if (postId) {
            initialPage = {
              type: PageTypes.PostDetailPage,
              context: {
                postId: postId,
                hideTarget: false,
                category: undefined,
                commentId: undefined,
                parentId: undefined,
              },
            };
          } else {
            initialPage = { type: PageTypes.SocialHomePage, context: { communityId: undefined } };
          }
          break;
        default:
          initialPage = { type: PageTypes.SocialHomePage, context: { communityId: undefined } };
      }

      setDefaultPage(initialPage);
    }
  }, [landingPage, postId, setDefaultPage]);

  useEffect(() => {
    if (
      isDesktop &&
      (page.type === PageTypes.SocialGlobalSearchPage ||
        page.type === PageTypes.PostComposerPage ||
        page.type === PageTypes.SelectPostTargetPage)
    ) {
      goToSocialHomePage();
    }
  }, [isDesktop]);

  return (
    <div className={styles.applicationContainer} style={{ height: '100vh', width: '100%' }}>
      {landingPage === 'newsfeed' ? (
        // For feed page, render without sidebar
        <MainLayout aside={null}>
          {page.type === PageTypes.SocialHomePage && <SocialHomePage />}
          {page.type === PageTypes.SocialGlobalSearchPage && !isDesktop && (
            <SocialGlobalSearchPage />
          )}
          {page.type === PageTypes.PostDetailPage && (
            <PostDetailPage
              id={page.context?.postId}
              hideTarget={page.context?.hideTarget}
              category={page.context?.category}
              commentId={page.context?.commentId}
              parentId={page.context?.parentId}
            />
          )}
          {page.type === PageTypes.StoryTargetSelectionPage && <StoryTargetSelectionPage />}
          {page.type === PageTypes.CommunityProfilePage && (
            <CommunityTabProvider>
              <CommunityProfilePage
                communityId={page.context.communityId}
                page={page.context.page}
              />
            </CommunityTabProvider>
          )}
          {page.type === PageTypes.ViewStoryPage && (
            <ViewStoryPage type={page.context.storyType} targetId={page.context?.targetId} />
          )}
          {page.type === PageTypes.DraftPage && (
            <AmityDraftStoryPage
              targetId={page.context?.targetId}
              targetType={page.context?.targetType}
              mediaType={page.context?.mediaType}
            />
          )}
          {page.type === PageTypes.PostComposerPage && (
            <PostComposerPage
              mode={page.context?.mode}
              targetId={page.context?.targetId}
              targetType={page.context?.targetType}
              community={page.context?.community}
              post={page.context?.post}
            />
          )}
          {page.type === PageTypes.SelectPostTargetPage && <SelectPostTargetPage />}
          {page.type === PageTypes.MyCommunitiesSearchPage && <MyCommunitiesSearchPage />}
          {page.type === PageTypes.AllCategoriesPage && <AllCategoriesPage />}
          {page.type === PageTypes.CommunitiesByCategoryPage && (
            <CommunitiesByCategoryPage categoryId={page.context.categoryId} />
          )}
          {page.type === PageTypes.UserProfilePage && (
            <UserProfilePage userId={page.context.userId} />
          )}
          {page.type === PageTypes.CommunitySetupPage && (
            <CommunitySetupPage mode={page.context?.mode} community={page.context?.community} />
          )}
          {page.type === PageTypes.CommunityAddCategoryPage && (
            <CommunityAddCategoryPage category={page.context.categories} />
          )}
          {page.type === PageTypes.CommunityAddMemberPage && (
            <CommunityAddMemberPage
              member={page.context?.members}
              communityId={page.context?.communityId}
              onAddedAction={page.context?.onAddedAction}
            />
          )}
          {page.type === PageTypes.CommunitySettingPage && (
            <CommunitySettingPage community={page.context.community} />
          )}
          {page.type === PageTypes.CommunityPostPermissionPage && (
            <CommunityPostPermissionPage community={page.context.community} />
          )}
          {page.type === PageTypes.CommunityStorySettingPage && (
            <CommunityStorySettingPage community={page.context.community} />
          )}
          {page.type === PageTypes.PendingPostsPage && (
            <PendingPostsPage communityId={page.context.communityId} />
          )}
          {page.type === PageTypes.CommunityMembershipPage && (
            <CommunityMembershipPage community={page.context.community} />
          )}
          {page.type === PageTypes.EditUserProfilePage && (
            <EditUserProfilePage userId={page.context.userId} />
          )}
          {page.type === PageTypes.UserRelationshipPage && (
            <UserRelationshipPage
              userId={page.context.userId}
              selectedTab={page.context.selectedTab}
            />
          )}
          {page.type === PageTypes.UserPendingFollowRequestPage && <UserPendingFollowRequestPage />}
          {page.type === PageTypes.BlockedUsersPage && <BlockedUserPage />}
          {page.type === PageTypes.LiveStreamTerminatedPage && <LivestreamTerminatedPage />}
          {page.type === PageTypes.NotificationTrayPage && <NotificationTrayPage />}

          {/* modal as page */}
          {liveStreamPlayer && <LiveStreamPlayerPage {...liveStreamPlayer} />}

          {/* V3 */}
          {page.type === PageTypes.CommunityFeed && (
            <CommunityFeed
              communityId={page.context.communityId}
              isNewCommunity={page.context.isNewCommunity}
              isOpen={open}
              toggleOpen={toggleOpen}
            />
          )}
          {page.type === PageTypes.CommunityEdit && (
            <CommunityEditPage communityId={page.context.communityId} tab={page.context.tab} />
          )}
          {page.type === PageTypes.PollTargetSelectionPage && <PollTargetSelectionPage />}
          {page.type === PageTypes.PollPostComposerPage && (
            <PollPostComposerPage
              targetId={page.context.targetId}
              targetType={page.context.targetType}
            />
          )}
          {/*End of V3 */}
        </MainLayout>
      ) : (
        // For all other pages, render with sidebar
        <MainLayout aside={<CommunitySideBar />}>
          {page.type === PageTypes.SocialHomePage && <SocialHomePage />}
          {page.type === PageTypes.SocialGlobalSearchPage && !isDesktop && (
            <SocialGlobalSearchPage />
          )}
          {page.type === PageTypes.PostDetailPage && (
            <PostDetailPage
              id={page.context?.postId}
              hideTarget={page.context?.hideTarget}
              category={page.context?.category}
              commentId={page.context?.commentId}
              parentId={page.context?.parentId}
            />
          )}
          {page.type === PageTypes.StoryTargetSelectionPage && <StoryTargetSelectionPage />}
          {page.type === PageTypes.CommunityProfilePage && (
            <CommunityTabProvider>
              <CommunityProfilePage
                communityId={page.context.communityId}
                page={page.context.page}
              />
            </CommunityTabProvider>
          )}
          {page.type === PageTypes.ViewStoryPage && (
            <ViewStoryPage type={page.context.storyType} targetId={page.context?.targetId} />
          )}
          {page.type === PageTypes.DraftPage && (
            <AmityDraftStoryPage
              targetId={page.context?.targetId}
              targetType={page.context?.targetType}
              mediaType={page.context?.mediaType}
            />
          )}
          {page.type === PageTypes.PostComposerPage && (
            <PostComposerPage
              mode={page.context?.mode}
              targetId={page.context?.targetId}
              targetType={page.context?.targetType}
              community={page.context?.community}
              post={page.context?.post}
            />
          )}
          {page.type === PageTypes.SelectPostTargetPage && <SelectPostTargetPage />}
          {page.type === PageTypes.MyCommunitiesSearchPage && <MyCommunitiesSearchPage />}
          {page.type === PageTypes.AllCategoriesPage && <AllCategoriesPage />}
          {page.type === PageTypes.CommunitiesByCategoryPage && (
            <CommunitiesByCategoryPage categoryId={page.context.categoryId} />
          )}
          {page.type === PageTypes.UserProfilePage && (
            <UserProfilePage userId={page.context.userId} />
          )}
          {page.type === PageTypes.CommunitySetupPage && (
            <CommunitySetupPage mode={page.context?.mode} community={page.context?.community} />
          )}
          {page.type === PageTypes.CommunityAddCategoryPage && (
            <CommunityAddCategoryPage category={page.context.categories} />
          )}
          {page.type === PageTypes.CommunityAddMemberPage && (
            <CommunityAddMemberPage
              member={page.context?.members}
              communityId={page.context?.communityId}
              onAddedAction={page.context?.onAddedAction}
            />
          )}
          {page.type === PageTypes.CommunitySettingPage && (
            <CommunitySettingPage community={page.context.community} />
          )}
          {page.type === PageTypes.CommunityPostPermissionPage && (
            <CommunityPostPermissionPage community={page.context.community} />
          )}
          {page.type === PageTypes.CommunityStorySettingPage && (
            <CommunityStorySettingPage community={page.context.community} />
          )}
          {page.type === PageTypes.PendingPostsPage && (
            <PendingPostsPage communityId={page.context.communityId} />
          )}
          {page.type === PageTypes.CommunityMembershipPage && (
            <CommunityMembershipPage community={page.context.community} />
          )}
          {page.type === PageTypes.EditUserProfilePage && (
            <EditUserProfilePage userId={page.context.userId} />
          )}
          {page.type === PageTypes.UserRelationshipPage && (
            <UserRelationshipPage
              userId={page.context.userId}
              selectedTab={page.context.selectedTab}
            />
          )}
          {page.type === PageTypes.UserPendingFollowRequestPage && <UserPendingFollowRequestPage />}
          {page.type === PageTypes.BlockedUsersPage && <BlockedUserPage />}
          {page.type === PageTypes.LiveStreamTerminatedPage && <LivestreamTerminatedPage />}
          {page.type === PageTypes.NotificationTrayPage && <NotificationTrayPage />}

          {/* modal as page */}
          {liveStreamPlayer && <LiveStreamPlayerPage {...liveStreamPlayer} />}

          {/* V3 */}
          {page.type === PageTypes.CommunityFeed && (
            <CommunityFeed
              communityId={page.context.communityId}
              isNewCommunity={page.context.isNewCommunity}
              isOpen={open}
              toggleOpen={toggleOpen}
            />
          )}
          {page.type === PageTypes.CommunityEdit && (
            <CommunityEditPage communityId={page.context.communityId} tab={page.context.tab} />
          )}
          {page.type === PageTypes.PollTargetSelectionPage && <PollTargetSelectionPage />}
          {page.type === PageTypes.PollPostComposerPage && (
            <PollPostComposerPage
              targetId={page.context.targetId}
              targetType={page.context.targetType}
            />
          )}
          {/*End of V3 */}
        </MainLayout>
      )}
    </div>
  );
};

export default Application;

// Wrapper component to maintain backward compatibility
interface AmityUiKitSocialProps {
  /**
   * The initial page to display when the component loads.
   * Supported values: AmityPageTypes.NewsFeed, AmityPageTypes.Search, AmityPageTypes.ChatSearch, AmityPageTypes.Post
   */
  landingPage?: string;
  /**
   * Post ID to display when landingPage is set to AmityPageTypes.Post
   */
  postId?: string;
}

/**
 * AmityUiKitSocial component with support for custom landing pages.
 *
 * @param landingPage - The initial page to display (use AmityPageTypes enum)
 * @param postId - Post ID to display when landingPage is AmityPageTypes.Post
 *
 * @example
 * ```tsx
 * import { AmityUiKitSocial, AmityPageTypes } from '@amityco/ui-kit-open-source';
 *
 * // Show news feed
 * <AmityUiKitSocial landingPage={AmityPageTypes.NewsFeed} />
 *
 * // Show search page
 * <AmityUiKitSocial landingPage={AmityPageTypes.Search} />
 *
 * // Show specific post
 * <AmityUiKitSocial landingPage={AmityPageTypes.Post} postId="post123" />
 * ```
 */
export const AmityUiKitSocial = ({ landingPage, postId }: AmityUiKitSocialProps) => {
  return <Application landingPage={landingPage} postId={postId} />;
};
