import React, { forwardRef, useState } from 'react';

import { Wrapper, StyledTabs } from './styles';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import UiKitSocialSearch from '~/social/components/SocialSearch';
import Followers from '~/social/pages/UserFeed/Followers';
import { FollowersTabs } from '~/social/pages/UserFeed/Followers/constants';
import { UserFeedTabs } from '~/social/pages/UserFeed/constants';

const SocialSearch = styled(UiKitSocialSearch)`
  padding: 8px 10px;

  div > div {
    background: #141516;
    border: 0;
    border-radius: 10px;
    color: #fff;

    svg {
      fill: #fff;
    }

    input {
      color: #fff;
      height: 40px;
    }
  }
`;

const Search = forwardRef(({ userId }) => {
  const [allTabs, setAllTabs] = useState(
    Object.values(FollowersTabs).map((value) => ({
      value,
      label: value,
    })),
  );
  const [followActiveTab, setFollowActiveTab] = useState(FollowersTabs.FOLLOWINGS);
  const [setActiveTab] = useState(UserFeedTabs.FOLLOWERS);

  return (
    <Wrapper>
      <StyledTabs tabs={allTabs} activeTab={followActiveTab} onChange={setFollowActiveTab} />
      <SocialSearch searchBy={['accounts']} />
      <Followers
        userId={userId}
        activeTab={followActiveTab}
        setActiveTab={setFollowActiveTab}
        setUserFeedTab={setActiveTab}
        setAllTabs={setAllTabs}
      />
    </Wrapper>
  );
});

Search.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default Search;
