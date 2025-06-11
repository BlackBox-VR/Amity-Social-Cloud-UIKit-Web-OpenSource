import React from 'react';

import Highlight from '~/core/components/Highlight';
import Skeleton from '~/core/components/Skeleton';

import {
  Name,
  NameContainer,
  PrivateIcon,
  VerifiedIcon,
} from '~/social/components/community/Name/styles';
import { useCustomComponent } from '~/core/providers/CustomComponentsProvider';

export interface CommunityNameProps {
  'data-testid'?: string;
  isActive?: boolean;
  isOfficial?: boolean;
  isPublic?: boolean;
  isTitle?: boolean;
  isSearchResult?: boolean;
  name?: string;
  searchInput?: string;
  className?: string;
  loading?: boolean;
  truncate?: number;
}

const CommunityName = ({
  'data-testid': dataQaAnchor = '',
  isActive = false,
  isOfficial = false,
  isPublic = false,
  isTitle = false,
  isSearchResult = false,
  name,
  searchInput = '',
  className = '',
  loading = false,
  truncate,
}: CommunityNameProps) => {
  if (isSearchResult) {
    return <Highlight text={name || ''} query={searchInput} />;
  }

  return (
    <NameContainer className={className} isActive={isActive} isTitle={isTitle}>
      {loading ? (
        <Name>
          <Skeleton width={120} style={{ fontSize: 12 }} />
        </Name>
      ) : (
        <Name
          data-testid={`${dataQaAnchor}-community-name`}
          title={name}
          style={{
            WebkitLineClamp: truncate,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {!isPublic && <PrivateIcon data-testid={`${dataQaAnchor}-private-icon`} />}
          {name}
        </Name>
      )}

      {!loading && isOfficial && <VerifiedIcon />}
    </NameContainer>
  );
};

export default (props: CommunityNameProps) => {
  const CustomComponentFn = useCustomComponent<CommunityNameProps>('CommunityName');

  if (CustomComponentFn) return CustomComponentFn(props);

  return <CommunityName {...props} />;
};
