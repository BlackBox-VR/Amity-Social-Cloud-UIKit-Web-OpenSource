import React, { useState, useEffect } from 'react';
import { UnityMessageBaseURLs, UnityMessageKeys } from '~/social/constants';
import {
  MessageClaimWrapper,
  MessageClaimTitle,
  MessageClaimContent,
  MessageClaimButton,
  MessageClaimButtonImg,
  MessageClaimButtonDisabled,
} from './styles';

// Define interfaces for props
interface Metadata {
  claimedUserIds?: string[];
  completionOrderRank?: number;
  currentBonusMultiplier?: number;
  nextBonusMultiplier?: number;
  baseValue?: number;
  carePointsReward?: number;
}

interface Client {
  currentUserId?: string;
}

interface MessageClaimProps {
  metadata?: Metadata;
  client?: Client;
  messageId?: string;
}

const formatCompactNumber = (number?: number, decimal = 1): string => {
  if (!number || isNaN(number)) return '0';

  if (number < 1000) {
    return number.toString();
  } else if (number >= 1000 && number < 1_000_000) {
    return `${(number / 1000).toFixed(decimal).replace(/\.0$/, '')}K`;
  } else if (number >= 1_000_000 && number < 1_000_000_000) {
    return `${(number / 1_000_000).toFixed(decimal).replace(/\.0$/, '')}M`;
  } else if (number >= 1_000_000_000 && number < 1_000_000_000_000) {
    return `${(number / 1_000_000_000).toFixed(decimal).replace(/\.0$/, '')}B`;
  } else if (number >= 1_000_000_000_000 && number < 1_000_000_000_000_000) {
    return `${(number / 1_000_000_000_000).toFixed(decimal).replace(/\.0$/, '')}T`;
  }
  return '0';
};

const getNumberSuffix = (number?: number): string => {
  if (typeof number !== 'number' || isNaN(number)) return '';

  if (number === 1) return 'st';
  else if (number === 2) return 'nd';
  else if (number === 3) return 'rd';
  return 'th';
};

const MessageClaim = ({ metadata = {}, client = {}, messageId = '' }: MessageClaimProps) => {
  const isClaimed = (metadata?.claimedUserIds || []).includes(client?.currentUserId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleClaim = () => {
    if (!isLoading) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setLoaded(true);
      }, 1500);

      const fullURL = `${UnityMessageBaseURLs.CLAIM_REWARDS}${UnityMessageKeys.CLAIM_CAREPOINTS}=${messageId}`;
      window.location.href = fullURL;
    }
  };

  return (
    <MessageClaimWrapper>
      <div>
        <MessageClaimTitle>Team Reward</MessageClaimTitle>
        <MessageClaimContent>
          {metadata?.completionOrderRank}
          {getNumberSuffix(metadata?.completionOrderRank)} To Complete Bonus:{' '}
          {metadata?.currentBonusMultiplier}x
        </MessageClaimContent>
        <MessageClaimContent>
          Next Person Bonus: {metadata?.nextBonusMultiplier}x
        </MessageClaimContent>
      </div>
      <div style={{ textAlign: 'center' }}>
        <MessageClaimContent>
          {metadata?.baseValue} x {metadata?.currentBonusMultiplier} =
        </MessageClaimContent>
        {!isClaimed && !loaded && (
          <MessageClaimButton onClick={handleClaim} loading={isLoading}>
            <div>{formatCompactNumber(metadata?.carePointsReward)}</div>
            <MessageClaimButtonImg src={'/claim-icon.svg'} />
          </MessageClaimButton>
        )}
        {(isClaimed || loaded) && <MessageClaimButtonDisabled>CLAIMED</MessageClaimButtonDisabled>}
      </div>
    </MessageClaimWrapper>
  );
};

export default MessageClaim;
