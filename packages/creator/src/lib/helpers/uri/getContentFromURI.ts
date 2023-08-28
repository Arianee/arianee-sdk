import { InvalidURIError } from '../../errors';

export const getContentFromURI = async <T>(
  uri: string,
  fetchLike: typeof fetch
): Promise<T> => {
  let content: T;
  try {
    const res = await fetchLike(uri);
    if (!res.ok) throw new InvalidURIError('Fetch response not ok');

    content = await res.json();
  } catch {
    throw new InvalidURIError('Could not fetch the URI content');
  }

  return content;
};
