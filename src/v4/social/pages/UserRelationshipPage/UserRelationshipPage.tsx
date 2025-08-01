import React, { useState, FC, useMemo, useCallback, useEffect } from 'react';
import styles from './UserRelationshipPage.module.css';
import { useNavigation } from '~/v4/core/providers/NavigationProvider';
import { BackButton } from '~/v4/social/elements/BackButton';
import { useUser } from '~/v4/core/hooks/objects/useUser';
import { useAmityPage } from '~/v4/core/hooks/uikit';
import { Typography } from '~/v4/core/components';
import { SecondaryTab } from '~/v4/core/components/SecondaryTab';
import { UserFollowingTabContent } from './TabContent/UserFollowingTabContent';
import { UserFollowerTabContent } from './TabContent/UserFollowerTabContent';
import { UserSearchResult } from '~/v4/social/components/UserSearchResult';
import { TopSearchBar } from '~/v4/social/components/TopSearchBar';
import { useUserQueryByDisplayName } from '~/v4/core/hooks/collections/useUsersCollection';
import { UserRepository } from '@amityco/ts-sdk';
import useSearchCommunitiesCollection from '~/v4/social/hooks/collections/useSearchCommunitiesCollection';
import useFollowingsCollection from '~/v4/core/hooks/collections/useFollowingsCollection';
import useFollowersCollection from '~/v4/core/hooks/collections/useFollowersCollection';

enum AmityGlobalSearchType {
  User = 'user',
  Community = 'community',
}

const useGlobalSearchViewModel = () => {
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const [searchType, setSearchType] = useState<AmityGlobalSearchType>(
    AmityGlobalSearchType.Community,
  );

  const enabledUserSearch = useMemo(
    () => searchType === AmityGlobalSearchType.User && searchKeyword.length > 0,
    [searchType, searchKeyword],
  );

  const communityCollection = useSearchCommunitiesCollection({
    queryParams: {
      displayName: searchKeyword,
      limit: 20,
      includeDiscoverablePrivateCommunity: true,
      membership: 'all',
    },
    shouldCall: searchType === AmityGlobalSearchType.Community && searchKeyword.length > 0,
  });

  const userCollection = useUserQueryByDisplayName({
    displayName: searchKeyword,
    limit: 20,
    enabled: enabledUserSearch,
    matchType: UserRepository.AmityUserSearchMatchType.PARTIAL,
  });

  const search = useCallback(
    (keyword: string) => {
      setSearchKeyword(keyword);
    },
    [setSearchKeyword],
  );

  return {
    userCollection,
    communityCollection,
    searchType,
    search,
    searchValue: searchKeyword,
    setSearchType,
  };
};

export const enum UserRelationshipPageTabs {
  FOLLOWING = 'following',
  FOLLOWER = 'followers',
}
type UserRelationshipPageProps = {
  userId: string;
  selectedTab: UserRelationshipPageTabs;
};

export const UserRelationshipPage: FC<UserRelationshipPageProps> = ({ userId, selectedTab }) => {
  const pageId = 'user_releationship_page';
  console.log('UserRelationshipPage', userId, selectedTab);

  const { themeStyles } = useAmityPage({ pageId });
  const { user } = useUser({ userId });
  const { onBack } = useNavigation();
  const [openSearchResult, setOpenSearchResult] = useState<boolean>(false);
  const { userCollection, search, searchValue, setSearchType } = useGlobalSearchViewModel();
  const [currentActiveTab, setCurrentActiveTab] = useState<UserRelationshipPageTabs>(selectedTab);

  const { followings } = useFollowingsCollection({
    userId,
    status: 'accepted',
  });

  const { followers } = useFollowersCollection({
    userId,
    status: 'accepted',
  });

  useEffect(() => {
    setSearchType(AmityGlobalSearchType.User);
  }, [setSearchType]);

  const tabs = [
    {
      label: `${followings.length} Following`,
      value: UserRelationshipPageTabs.FOLLOWING,
      content: () => {
        return <UserFollowingTabContent userId={userId} />;
      },
    },
    {
      label: `${followers.length} Followers`,
      value: UserRelationshipPageTabs.FOLLOWER,
      content: () => {
        return <UserFollowerTabContent userId={userId} />;
      },
    },
  ];

  return (
    <div className={styles.userRelationshipPage} style={themeStyles}>
      <div className={styles.userRelationshipPage__container}>
        {/* <div className={styles.userRelationshipPage__topSection}>
          <div className={styles.userRelationshipPage__topBar}>
            <BackButton pageId={pageId} onPress={() => onBack()} />
            <Typography.TitleBold className={styles.userRelationshipPage__displayName}>
              {user?.displayName}
            </Typography.TitleBold>
          </div>
        </div> */}
        <div className={styles.userRelationshipPage__content}>
          <SecondaryTab
            className={styles.userRelationshipPage__tabBar}
            tabs={tabs}
            activeTab={currentActiveTab}
            onChange={(key) => setCurrentActiveTab(key as UserRelationshipPageTabs)}
            tabListClassName={styles.userRelationshipPage__tabList}
            tabPanelClassName={styles.userRelationshipPage__tabPanel}
            renderAfterTabs={() => (
              <>
                <TopSearchBar
                  pageId={pageId}
                  search={search}
                  onFocus={() => setOpenSearchResult(true)}
                />
                {searchValue.length > 0 && openSearchResult && (
                  <UserSearchResult
                    pageId={pageId}
                    isLoading={userCollection.isLoading}
                    userCollection={userCollection.users}
                    onClosePopover={() => setOpenSearchResult(false)}
                    onLoadMore={() => {
                      if (userCollection.hasMore && userCollection.isLoading === false) {
                        userCollection.loadMore();
                      }
                    }}
                  />
                )}
              </>
            )}
          />
        </div>
      </div>
    </div>
  );
};
