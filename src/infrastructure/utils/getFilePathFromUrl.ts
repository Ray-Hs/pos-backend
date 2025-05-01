export function getFilePathFromB2Url(url: string): string | null {
  const regex = /\/file\/[^/]+\/(.+)$/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
