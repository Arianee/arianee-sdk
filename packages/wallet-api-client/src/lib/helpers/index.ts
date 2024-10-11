export const removeTrailingSlash = (url: string) => url.replace(/\/$/, '');

export const generateQueryString = (
  params: Record<string, string | string[] | number[] | undefined | boolean>
) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (!value) return;

    searchParams.append(
      key,
      typeof value === 'string' ? value : JSON.stringify(value)
    );
  });

  return searchParams.toString().length > 0
    ? `?${decodeURIComponent(searchParams.toString())}`
    : '';
};
