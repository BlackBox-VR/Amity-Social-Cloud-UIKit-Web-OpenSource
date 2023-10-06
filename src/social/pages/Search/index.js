import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import UiKitSocialSearch from '~/social/components/SocialSearch';
import Followers from '~/social/pages/UserFeed/Followers';
import { FollowersTabs } from '~/social/pages/UserFeed/Followers/constants';

import { Wrapper, StyledTabs } from './styles';

const SocialSearch = styled(UiKitSocialSearch)`
  padding: 8px 10px;

  .autocomplete-input {
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

  .autocomplete-menu {
    border: 0;

    > div {
      background: #575757;
      color: #fff;
      border-radius: 6px;
    }

    .menu-item:hover {
      background: #434343;
    }
  }
`;

const Search = forwardRef(({ userId }) => {
  const [allTabs, setAllTabs] = useState([]);
  const [followActiveTab, setFollowActiveTab] = useState(FollowersTabs.FOLLOWERS);

  return (
    <Wrapper>
      <StyledTabs tabs={allTabs} activeTab={followActiveTab} onChange={setFollowActiveTab} />
      <SocialSearch searchBy={['accounts']} />
      <Followers
        userId={userId}
        activeTab={followActiveTab}
        allTabs={allTabs}
        setActiveTab={setFollowActiveTab}
        setAllTabs={setAllTabs}
      />
    </Wrapper>
  );
});

Search.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default Search;
