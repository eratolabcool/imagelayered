export function getCanvasSafeImageUrl(url: string) {
  if (!/^https?:\/\//i.test(url)) return url;
  return `/api/storage/proxy-image?url=${encodeURIComponent(url)}`;
}
