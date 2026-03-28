import { NextResponse } from 'next/server';

// In-memory cache for client_id
let cachedClientId = null;
let lastCacheTime = 0;

/**
 * Scrape a working public client_id dynamically directly from the SoundCloud web app scripts.
 */
async function fetchSoundcloudClientId() {
  const now = Date.now();
  if (cachedClientId && now - lastCacheTime < 1000 * 60 * 60 * 12) {
    // Return cached token if < 12 hours old
    return cachedClientId;
  }

  try {
    const htmlRes = await fetch('https://soundcloud.com', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
      },
    });
    const html = await htmlRes.text();

    // Find the latest asset script URL
    const scriptMatch = html.match(/https:\/\/a-v2\.sndcdn\.com\/assets\/[^"]+\.js/g);
    if (!scriptMatch || scriptMatch.length === 0) {
      throw new Error('No JS scripts found');
    }

    const scriptUrl = scriptMatch[scriptMatch.length - 1];
    const scriptRes = await fetch(scriptUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
      },
    });
    const scriptContent = await scriptRes.text();

    const idMatch = scriptContent.match(/client_id:"([a-zA-Z0-9]+)"/);
    if (idMatch && idMatch[1]) {
      cachedClientId = idMatch[1];
      lastCacheTime = now;
      return cachedClientId;
    }

    throw new Error('client_id not found in script');
  } catch (error) {
    console.error('Failed to scrape Soundcloud ID', error);
    // Fallback known public IDs just in case
    return 'WU4bVxk5Df0g5JC8ULzW77Ry7OM10Lyj';
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
    }

    const clientId = await fetchSoundcloudClientId();
    
    // Search tracks via API V2
    const searchRes = await fetch(
      `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(
        query
      )}&client_id=${clientId}&limit=10`,
      {
        headers: {
          'Origin': 'https://soundcloud.com',
          'Referer': 'https://soundcloud.com/',
        },
      }
    );
    const searchData = await searchRes.json();

    if (!searchData.collection || searchData.collection.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const results = [];

    // Map through tracks and resolve the progressive MP3 stream endpoint
    for (const track of searchData.collection) {
      if (!track.media || !track.media.transcodings) continue;

      // Prioritize progressive (MP3) over HLS (M3U8) for simple HTML5 <audio> compatibility
      const trans =
        track.media.transcodings.find((t) => t.format.protocol === 'progressive') ||
        track.media.transcodings[0];

      if (!trans || !trans.url) continue;

      try {
        // Resolve the actual media URL from the transcoder
        const streamUrlRes = await fetch(`${trans.url}?client_id=${clientId}`, {
          headers: {
            'Origin': 'https://soundcloud.com',
            'Referer': 'https://soundcloud.com/',
          },
        });
        const streamData = await streamUrlRes.json();
        
        if (streamData && streamData.url) {
          results.push({
            id: track.id,
            title: track.title,
            artist: track.user ? track.user.username : 'Unknown',
            artwork: track.artwork_url || (track.user && track.user.avatar_url),
            url: streamData.url, // This is the direct MP3 URL
          });
        }
      } catch (e) {
        console.error('Failed to resolve track stream', track.id, e);
      }

      // Limit processed results slightly to keep API fast
      if (results.length >= 5) break;
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Soundcloud API proxy error:', error);
    return NextResponse.json({ error: 'Internal Server Error', results: [] }, { status: 500 });
  }
}
