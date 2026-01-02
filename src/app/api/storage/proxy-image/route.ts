import { respData, respErr } from '@/shared/lib/resp';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return respErr('URL is required');
    }

    // Validate URL protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return respErr('Invalid URL protocol');
    }

    console.log('[proxy-image] Fetching external image:', url.substring(0, 80));

    // Fetch the image server-side (not subject to browser CORS)
    const response = await fetch(url, {
      headers: {
        // Mimic browser request to avoid blocking
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error('[proxy-image] Fetch failed:', response.status, response.statusText);
      return respErr(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    // Get content type
    const contentType = response.headers.get('content-type') || 'image/png';

    // Convert to base64 data URI
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUri = `data:${contentType};base64,${base64}`;

    console.log('[proxy-image] Successfully converted to base64 data URI:', {
      contentType,
      size: arrayBuffer.byteLength,
      preview: dataUri.substring(0, 50) + '...',
    });

    return respData({
      url: dataUri,
      contentType,
      size: arrayBuffer.byteLength,
    });
  } catch (e: any) {
    console.error('[proxy-image] Error:', e);
    return respErr(e.message || 'Failed to proxy image');
  }
}

export async function GET(req: Request) {
  // Also support GET method for simpler integration
  try {
    const url = new URL(req.url).searchParams.get('url');

    if (!url) {
      return new Response('URL is required', { status: 400 });
    }

    // Validate URL protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return new Response('Invalid URL protocol', { status: 400 });
    }

    console.log('[proxy-image] GET Fetching external image:', url.substring(0, 80));

    // Fetch the image server-side
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error('[proxy-image] GET Fetch failed:', response.status);
      return new Response(`Failed to fetch image: ${response.status}`, { status: response.status });
    }

    // Get content type and image data
    const contentType = response.headers.get('content-type') || 'image/png';
    const arrayBuffer = await response.arrayBuffer();

    console.log('[proxy-image] GET Successfully proxied image:', {
      contentType,
      size: arrayBuffer.byteLength,
    });

    // Return the image with proper CORS headers
    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (e: any) {
    console.error('[proxy-image] GET Error:', e);
    return new Response(e.message || 'Failed to proxy image', { status: 500 });
  }
}
