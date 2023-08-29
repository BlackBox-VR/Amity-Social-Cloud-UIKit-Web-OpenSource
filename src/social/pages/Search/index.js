import React, {forwardRef, useState} from 'react';

import {Wrapper} from './styles';
import PropTypes from "prop-types";
import styled from "styled-components";
import UiKitSocialSearch from '~/social/components/SocialSearch';
import Followers from '~/social/pages/UserFeed/Followers';
import {FollowersTabs} from "~/social/pages/UserFeed/Followers/constants";
import {UserFeedTabs} from "~/social/pages/UserFeed/constants";
import { useSDK } from '~/core/hooks/useSDK';

const SocialSearch = styled(UiKitSocialSearch)`
  background: ${({ theme }) => theme.palette.system.background};
  padding: 0.5rem;
`;

const Search = forwardRef(
    (
        {
            isLandingPage,
            userId
        },
        ref,
    ) => {
        const [followActiveTab, setFollowActiveTab] = useState(FollowersTabs.FOLLOWINGS);
        const [activeTab, setActiveTab] = useState(UserFeedTabs.FOLLOWERS);
        
        return (
            <Wrapper>
                <SocialSearch searchBy={['accounts']}/>
                <Followers
                    userId={userId}
                    activeTab={followActiveTab}
                    setActiveTab={setFollowActiveTab}
                    setUserFeedTab={setActiveTab}
                />
            </Wrapper>
        );
    },
);

Search.propTypes = {
    isLandingPage: PropTypes.string,
    userId: PropTypes.string.isRequired
};

export default Search;