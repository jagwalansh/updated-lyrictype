const query = process.argv[2] || "Shape of you";

async function run() {
  const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=20`;
  const itunesRes = await fetch(itunesUrl);
  const itunesData = await itunesRes.json();

  console.log(
    `Fetched ${itunesData.results.length} songs from iTunes. Checking lyrics for all in parallel...`,
  );

  const startTime = Date.now();

  const promises = itunesData.results.map(async (item) => {
    const lrcUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(item.artistName)}&track_name=${encodeURIComponent(item.trackName)}`;
    try {
      const res = await fetch(lrcUrl, {
        headers: {
          "User-Agent": "LyricalSyncGame v1.0.0 (https://github.com/jagwalansh/lyrical-sync-game)",
        },
      });
      if (res.status === 404) return { ...item, hasLyrics: false };
      if (!res.ok) return { ...item, hasLyrics: false, error: res.status };

      const data = await res.json();
      return { ...item, hasLyrics: !!data.syncedLyrics };
    } catch (e) {
      return { ...item, hasLyrics: false, error: e.message };
    }
  });

  const results = await Promise.all(promises);
  const endTime = Date.now();

  const withLyrics = results.filter((r) => r.hasLyrics);
  const withoutLyrics = results.filter((r) => !r.hasLyrics);

  console.log(`\nTime taken: ${endTime - startTime}ms`);
  console.log(`\n--- SONGS WITH LYRICS (${withLyrics.length}) ---`);
  withLyrics.forEach((r) => console.log(`${r.trackName} - ${r.artistName}`));

  console.log(`\n--- SONGS WITHOUT LYRICS (${withoutLyrics.length}) ---`);
  withoutLyrics.forEach((r) =>
    console.log(`${r.trackName} - ${r.artistName} (Error: ${r.error || "none"})`),
  );
}

run();
