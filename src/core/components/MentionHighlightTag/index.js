import React from 'react';
import isEmpty from 'lodash/isEmpty';
import styled from 'styled-components';

import { WEB_COMMUNITY_URL } from '~/constants';
import { useSDK } from '~/core/hooks/useSDK';
import useUser from '~/core/hooks/useUser';

const Highlighted = styled.span`
  cursor: pointer;
  color: ${({ theme }) => theme.palette.primary.main};
`;

const MentionHighlightTag = ({ children, mentionees, highlightIndex }) => {
  if (!isEmpty(mentionees)) {
    const { userId: mentioneeId } = mentionees[highlightIndex];
    const { user } = useUser(mentioneeId);
    const { currentUserId } = useSDK();

    const onClickUser = () => {
      window.open(
        `${WEB_COMMUNITY_URL}/member/${user.displayName}?version=webview&userId=${currentUserId}`,
        '_self',
      );
    };

    return (
      <Highlighted data-qa-anchor="mention-hilight-tag" onClick={() => onClickUser(mentioneeId)}>
        {children}
      </Highlighted>
    );
  }

  return children;
};

export default MentionHighlightTag;
