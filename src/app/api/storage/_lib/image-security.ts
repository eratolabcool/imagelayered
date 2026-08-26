const MAX_REMOTE_IMAGE_BYTES = 25 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

const isPrivateIpv4 = (hostname: string) => {
  const parts = hostname.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }

  const [a, b] = parts;
  return a === 10
    || a === 127
    || a === 0
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168)
    || (a === 100 && b >= 64 && b <= 127)
    || a >= 224;
};

const isPrivateIpv6 = (hostname: string) => {
  const value = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  return value === '::' || value === '::1' || value.startsWith('fc') || value.startsWith('fd') || value.startsWith('fe8') || value.startsWith('fe9') || value.startsWith('fea') || value.startsWith('feb');
};

export const validateRemoteImageUrl = (value: unknown) => {
  if (typeof value !== 'string' || value.length > 2048) {
    throw new Error('Invalid image URL');
  }

  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Invalid image URL');
  }
  if (url.port && !['80', '443'].includes(url.port)) {
    throw new Error('Unsupported image URL port');
  }

  const hostname = url.hostname.toLowerCase();
  if (
    hostname === 'localhost'
    || hostname.endsWith('.localhost')
    || hostname.endsWith('.local')
    || hostname.endsWith('.internal')
    || isPrivateIpv4(hostname)
    || isPrivateIpv6(hostname)
  ) {
    throw new Error('Private network image URLs are not allowed');
  }

  return url;
};

export const isAllowedImageType = (contentType: string) => ALLOWED_IMAGE_TYPES.has(contentType.toLowerCase().split(';')[0].trim());

export const detectImageType = (bytes: Uint8Array) => {
  if (bytes.length >= 8 && bytes.slice(0, 8).every((value, index) => value === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index])) return 'image/png';
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP') return 'image/webp';
  if (bytes.length >= 6 && ['GIF87a', 'GIF89a'].includes(new TextDecoder().decode(bytes.slice(0, 6)))) return 'image/gif';
  if (bytes.length >= 12 && new TextDecoder().decode(bytes.slice(4, 8)) === 'ftyp') {
    const brand = new TextDecoder().decode(bytes.slice(8, 12));
    if (['avif', 'avis'].includes(brand)) return 'image/avif';
  }
  return null;
};

export const readImageResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type')?.toLowerCase().split(';')[0].trim() ?? '';
  if (!isAllowedImageType(contentType)) throw new Error('Remote resource is not a supported image');

  const declaredSize = Number(response.headers.get('content-length') ?? 0);
  if (declaredSize > MAX_REMOTE_IMAGE_BYTES) throw new Error('Remote image exceeds the 25 MB limit');

  if (!response.body) throw new Error('Remote image body is empty');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_REMOTE_IMAGE_BYTES) {
      await reader.cancel();
      throw new Error('Remote image exceeds the 25 MB limit');
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  if (detectImageType(bytes) !== contentType) throw new Error('Remote image content does not match its media type');
  return { bytes, contentType };
};

export const fetchRemoteImage = async (value: unknown) => {
  let url = validateRemoteImageUrl(value);

  for (let redirects = 0; redirects <= 3; redirects += 1) {
    const response = await fetch(url, {
      headers: { Accept: 'image/avif,image/webp,image/png,image/jpeg,image/gif' },
      redirect: 'manual',
      signal: AbortSignal.timeout(15_000),
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location || redirects === 3) throw new Error('Too many image redirects');
      url = validateRemoteImageUrl(new URL(location, url).toString());
      continue;
    }
    if (!response.ok) throw new Error(`Failed to fetch image (${response.status})`);
    return readImageResponse(response);
  }

  throw new Error('Failed to fetch image');
};

