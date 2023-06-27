export const removeTrailingSlash = (url: string) => url.replace(/\/$/, '');

export const generateQueryString = (
  params: Record<string, string | string[] | number[] | undefined>
) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (!value) return;

    searchParams.append(key, JSON.stringify(value));
  });

  return searchParams.toString().length > 0
    ? `?${decodeURIComponent(searchParams.toString())}`
    : '';
};
