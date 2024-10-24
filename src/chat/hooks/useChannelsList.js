import { ChannelRepository, ChannelFilter } from '@amityco/js-sdk';
import orderBy from 'lodash/orderBy';
import { useMemo } from "react";
import useLiveCollection from '~/core/hooks/useLiveCollection';

function useChannelsList() {
  const [channels, hasMore, loadMore] = useLiveCollection(
    // Note: we can not use SDK sortBy LastActivity option - because by default it uses
    // ASC direction from BE. By default LastCreated is used. It still gives wrong result but it
    // better.
    () => ChannelRepository.queryChannels({ filter: ChannelFilter.Member }),
    [],
  );

  const orderedChannels = useMemo(() => orderBy(channels, 'lastActivity', 'desc'), [channels])

  return [orderedChannels, hasMore, loadMore];
}

export default useChannelsList;
