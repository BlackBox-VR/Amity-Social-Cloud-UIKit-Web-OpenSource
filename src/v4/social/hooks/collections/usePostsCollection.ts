import {PostRepository} from '@amityco/ts-sdk';
import useLiveCollection from '~/v4/core/hooks/useLiveCollection';
import {GlobalFeedFilterTypes} from "~/social/constants";

const QUERY_LIMIT = 20;

export default function usePostsCollection({
  targetType,
  targetId,
  feedType,
  dataTypes,
  limit = QUERY_LIMIT,
}: Partial<Parameters<typeof PostRepository.getPosts>[0]>, filterBy?: GlobalFeedFilterTypes,  filterValues?: string[]) {
  let { items, ...rest } = useLiveCollection({
    fetcher: PostRepository.getPosts,
    params: {
      targetType,
      targetId: targetId as string,
      feedType,
      dataTypes,
      limit,
    },
    shouldCall: !!targetId && !!targetType,
  });
  
  if (filterBy && filterValues && filterValues.length > 0)
  {
    items = items.filter((item) => {
      switch (filterBy)
      {
        case GlobalFeedFilterTypes.USER:
          return filterValues.includes(item?.postedUserId);
        case GlobalFeedFilterTypes.GYM:
          return filterValues.includes(item?.metadata?.gym_id);
        case GlobalFeedFilterTypes.TEAM:
          return filterValues.includes(item?.metadata?.team_id);
        case GlobalFeedFilterTypes.METADATA_TYPE:
            return filterValues.includes(item?.metadata?.type);
        default:
          return true; // Default case, no filtering
      }
    });
  }

  return {
    posts: items,
    ...rest,
  };
}
