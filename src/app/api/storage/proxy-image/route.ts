import { respData, respErr } from '@/shared/lib/resp';
import { fetchRemoteImage } from '../_lib/image-security';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const { bytes, contentType } = await fetchRemoteImage(url);
    const base64 = Buffer.from(bytes).toString('base64');
    const dataUri = `data:${contentType};base64,${base64}`;

    return respData({
      url: dataUri,
      contentType,
      size: bytes.byteLength,
    });
  } catch (e: unknown) {
    console.error('[proxy-image] Error:', e);
    return respErr(e instanceof Error ? e.message : 'Failed to proxy image');
  }
}

export async function GET(req: Request) {
  // Also support GET method for simpler integration
  try {
    const url = new URL(req.url).searchParams.get('url');

    const { bytes, contentType } = await fetchRemoteImage(url);

    // Return the image with proper CORS headers
    return new Response(bytes, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'private, max-age=300',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (e: unknown) {
    console.error('[proxy-image] GET Error:', e);
    return new Response(e instanceof Error ? e.message : 'Failed to proxy image', { status: 400 });
  }
}
