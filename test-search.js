const query = process.argv[2] || "Shape of you";

const normalize = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, '');

async function run() {
  const lrcUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`;
  const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=30`;

  const [lrcRes, itunesRes] = await Promise.all([
    fetch(lrcUrl).catch(() => null),
    fetch(itunesUrl).catch(() => null)
  ]);

  const itunesData = await itunesRes.json();
  const lrcData = await lrcRes.json();

  console.log(`iTunes returned ${itunesData.results.length} results`);
  console.log(`lrclib returned ${lrcData.length} results`);

  const results = (itunesData.results || []).map((item) => {
    const tNameNorm = normalize(item.trackName);
    const aNameNorm = normalize(item.artistName);

    // Check if this exists in lrclib results with synced lyrics
    const match = lrcData.find((lrcItem) => {
      if (!lrcItem.syncedLyrics) return false;
      const lTrack = normalize(lrcItem.trackName);
      const lArtist = normalize(lrcItem.artistName);
      return (lTrack.includes(tNameNorm) || tNameNorm.includes(lTrack)) && 
             (lArtist.includes(aNameNorm) || aNameNorm.includes(lArtist));
    });

    return {
      track: item.trackName,
      artist: item.artistName,
      hasLyrics: !!match,
      matchReason: match ? `Matched with lrclib: ${match.trackName} - ${match.artistName}` : "No match in lrclib search"
    };
  });

  const withLyrics = results.filter(r => r.hasLyrics);
  const withoutLyrics = results.filter(r => !r.hasLyrics);

  console.log(`\n--- SONGS WITH LYRICS (${withLyrics.length}) ---`);
  withLyrics.slice(0, 5).forEach(r => console.log(`${r.track} - ${r.artist} | ${r.matchReason}`));

  console.log(`\n--- SONGS WITHOUT LYRICS (${withoutLyrics.length}) ---`);
  withoutLyrics.slice(0, 10).forEach(r => console.log(`${r.track} - ${r.artist} | ${r.matchReason}`));
}

run();
