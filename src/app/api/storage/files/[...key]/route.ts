import { getCloudflareStorageBucket } from '@/extensions/storage/cloudflare-r2';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key: segments } = await params;
    const key = segments.map(decodeURIComponent).join('/');
    const object = await getCloudflareStorageBucket().get(key);
    if (!object) return new Response('Not found', { status: 404 });

    return new Response(object.body, {
      headers: {
        'Content-Type':
          object.httpMetadata?.contentType || 'application/octet-stream',
        'Content-Disposition':
          object.httpMetadata?.contentDisposition || 'inline',
        ETag: object.httpEtag,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[storage/files] Read failed:', error);
    return new Response('Unable to read file', { status: 500 });
  }
}
