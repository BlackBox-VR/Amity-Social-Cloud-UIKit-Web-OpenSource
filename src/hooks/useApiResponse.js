import useSWR from 'swr';

import { X_API_KEY } from '~/constants';

async function getRequest(url) {
  const res = await fetch(url, {
    method: 'GET',
    headers: new Headers({
      'Content-Type': 'application/json',
      'x-api-key': X_API_KEY,
    }),
  });

  if (!res.ok) {
    throw new Error('GET API was failed');
  }

  return res.json();
}

export const useGETRequest = (path) => {
  const { data, error, isLoading, mutate } = useSWR(path, getRequest, {
    onErrorRetry: (error) => {
      if (error.status === 404 || error.status === 500) return;
    },
  });

  return { data, error, isLoading, mutate };
};
