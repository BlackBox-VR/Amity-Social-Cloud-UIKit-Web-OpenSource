import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ClaimIcon from '../claim-icon.svg';
import { UnityMessageBaseURLs, UnityMessageKeys } from '~/social/constants';
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

const getNumberSuffix = (number) => {
  if (typeof number !== 'number' || isNaN(number)) return "";

  if (number == 1) return "st";
  else if (number == 2) return "nd";
  else if (number == 3) return "rd";
  else return "th";
};

const MessageClaim = ({ metadata, client, messageId }) => {
  const isClamed = (metadata?.claimedUserIds || []).indexOf(client?.currentUserId) > -1;
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const handleClaim = () => {
    if (!isLoading) {
      setIsLoading(true);

      setTimeout(() => {
        setIsLoading(false);
        setLoaded(true);
        setShouldRedirect(true);
      }, 1500);
    }
  };

  useEffect(() => {
    return () => {
      if (shouldRedirect) {
        var fullURL = `${UnityMessageBaseURLs.CLAIM_REWARDS}${UnityMessageKeys.CLAIM_CAREPOINTS}=${messageId}`;
        location.href = fullURL;
      }
    };
  }, [shouldRedirect, messageId]);

  return (
    <MessageClaimWrapper>
      <div>
        <MessageClaimTitle>Team Reward</MessageClaimTitle>
        <MessageClaimContent>{metadata?.completionOrderRank}{getNumberSuffix(metadata?.completionOrderRank)} To Complete Bonus: {metadata?.currentBonusMultiplier}x</MessageClaimContent>
        <MessageClaimContent>Next Person Bonus: {metadata?.nextBonusMultiplier}x</MessageClaimContent>
      </div>
      <div style={{ textAlign: "center" }}>
        <MessageClaimContent>{metadata?.baseValue} x {metadata?.currentBonusMultiplier} =</MessageClaimContent>
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
