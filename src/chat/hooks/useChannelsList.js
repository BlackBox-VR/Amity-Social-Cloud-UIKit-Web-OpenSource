import { ChannelRepository, ChannelFilter } from '@amityco/js-sdk';
import orderBy from 'lodash/orderBy';
import { useMemo } from "react";
import useLiveCollection from '~/core/hooks/useLiveCollection';

function useChannelsList(teamName = null) {
  const queryParams = teamName ? { displayName: teamName, filter: ChannelFilter.Member } : { filter: ChannelFilter.Member };
  console.log(queryParams);
  const [channels, hasMore, loadMore] = useLiveCollection(
    // Note: we can not use SDK sortBy LastActivity option - because by default it uses
    // ASC direction from BE. By default LastCreated is used. It still gives wrong result but it
    // better.
    () => ChannelRepository.queryChannels(queryParams),
    [],
  );

  const orderedChannels = useMemo(() => orderBy(channels, 'lastActivity', 'desc'), [channels])
  
  console.log(orderedChannels);

  return [orderedChannels, hasMore, loadMore];
}

export default useChannelsList;
