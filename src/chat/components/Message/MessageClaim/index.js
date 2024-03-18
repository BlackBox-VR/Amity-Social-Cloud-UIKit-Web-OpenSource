import React, { useState } from 'react';
import PropTypes from 'prop-types';

import ClaimIcon from '../claim-icon.svg';

import {
  MessageClaimWrapper,
  MessageClaimTitle,
  MessageClaimContent,
  MessageClaimButton,
  MessageClaimButtonImg,
  MessageClaimButtonDisabled,
} from './styles';

const formatCompactNumber = (number, decimal = 1) => {
  if (!number) return 0;

  if (number < 1000) {
    return number;
  } else if (number >= 1000 && number < 1_000_000) {
    return (number / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  } else if (number >= 1_000_000 && number < 1_000_000_000) {
    return (number / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (number >= 1_000_000_000 && number < 1_000_000_000_000) {
    return (number / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  } else if (number >= 1_000_000_000_000 && number < 1_000_000_000_000_000) {
    return (number / 1_000_000_000_000).toFixed(1).replace(/\.0$/, '') + 'T';
  }
};

const MessageClaim = ({
  metadata,
  client,
  messageId,
}) => {
  const isClamed = (metadata?.claimedUserIds || []).indexOf(client?.currentUserId) > -1;
  const [ isLoading, setIsLoading ] = useState(false);
  const [ loaded, setLoaded ] = useState(false);

  const handleClaim = () => {
    if (!isLoading) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setLoaded(true);
      }, 3000);
      // put code here
    }
  };

  return (
    <MessageClaimWrapper>
      <div>
        <MessageClaimTitle>Team Reward</MessageClaimTitle>
        <MessageClaimContent>3rd To Complete Bonus: 5x</MessageClaimContent>
        <MessageClaimContent>Next Person Bonus: 10x</MessageClaimContent>
      </div>
      <div style={{ textAlign: "center" }}>
        <MessageClaimContent>1000 x 5 =</MessageClaimContent>
        {!isClamed && !loaded && <MessageClaimButton onClick={handleClaim} loading={isLoading}>
          <div>{formatCompactNumber(metadata?.carePointsReward)}</div>
          <MessageClaimButtonImg src={ClaimIcon} />
        </MessageClaimButton>}
        {(!!isClamed || loaded) && <MessageClaimButtonDisabled>CLAIMED</MessageClaimButtonDisabled>}
      </div>
    </MessageClaimWrapper>
  );
};

MessageClaim.defaultProps = {
  metadata: {},
  client: {},
  messageId: "",
};

MessageClaim.propTypes = {
  metadata: PropTypes.object,
  client: PropTypes.object,
  messageId: PropTypes.string,
};

export default MessageClaim;
