const SUMMERS_YOUNG_SHADIENT = {
  duration: 303,
  syncedLyrics: `[00:24.38] I don't know where we're going I'm just caught in the moment
[00:30.32] Not gonna like it like that Even though I know it'll never last
[00:36.40] Sun every shot coming Stumbled our way to something
[00:42.42] You'll never see where this goes If we never try, we'll never know
[00:48.18] We'll last as long as a summer kiss Drinking your touch, got your other lips
[00:54.08] I'm thinkin' oh my god I just can't turn this off
[00:59.90] Don't need your heart, all your promises Don't care to know what forever is
[01:06.08] I think we just begun Last week in summer's show
[01:57.14] Life's sweet and summer's
[02:0.00] Stars lighting up the highway Driving into the morning
[02:6.00] Running your hand through my hair 'Cause only you can get me there
[02:11.55] Maybe we'll have tomorrow Maybe your time is borrowed
[02:18.35] But all that I need is right here Before it all disappears
[02:23.80] We'll last as long as a summer kiss Drink in your touch, got you on my lips
[02:29.70] I'm thinking oh my God I just can't turn this off
[02:36.40] Don't need your heart or your promises Don't care to know what forever is
[02:42.00] I think we've just begun Life's sweet and summer's young`,
};

export const CUSTOM_LYRICS: Record<
  string,
  { plainLyrics?: string; syncedLyrics?: string; duration?: number }
> = {
  "pls&ty - summer's young (shadient remix) [feat. dia frampton & shadient]": SUMMERS_YOUNG_SHADIENT,
  "pls&ty - summer's young (shadient remix)": SUMMERS_YOUNG_SHADIENT,
  "pls&ty - summer's young (feat. dia frampton & shadient) (shadient remix)": SUMMERS_YOUNG_SHADIENT,
  "pls&ty - summer's young (shadient remix) feat. dia frampton & shadient": SUMMERS_YOUNG_SHADIENT,
  "pls&ty - summer's young (feat. dia frampton & shadient) [shadient remix]": SUMMERS_YOUNG_SHADIENT,
  "pls&ty - summer's young - shadient remix": SUMMERS_YOUNG_SHADIENT,
  "ravyn lenae - love me not": {
    duration: 214,
    syncedLyrics: `[00:16.76] See, right now, I need you, I'll meet you somewhere now
[00:21.06] You up now? I see you, I get you, take care now
[00:25.31] Slow down, be cool, I miss you, come here now
[00:29.74] It's yours now, keep it, I'll hold on until now
[00:33.72] I need you right now, once I leave you I'm strung out
[00:37.77] If I get you, I'm slowly breakin' down
[00:41.51] And, oh, it's hard to see you, but I wish you were right here
[00:46.25] Oh, it's hard to leave you when I get you everywhere
[00:50.48] All this time I'm thinkin' we could never be a pair
[00:54.53] Oh, no, I don't need you, but I miss you, come here
[00:58.79] And, oh, it's hard to see you, but I wish you were right here
[01:03.25] Oh, it's hard to leave you when I get you everywhere
[01:07.46] All this time I'm thinkin' I'm strong enough to sink in
[01:11.61] Oh, no, I don't need you, but I miss you, come here
[01:15.58] But he love me not, he loves me
[01:17.97] He holds me tight, then lets me go
[01:20.09] He love me not, he loves me
[01:22.01] He holds me tight, then lets me go
[01:24.70] Soon as you leave me, we always lose connection
[01:29.02] It's gettin' messy, I favor your affection
[01:33.69] Don't loosen your grip, got a hold on me
[01:37.06] Now, forever, let's get back together
[01:42.12] Lord, take it so far away
[01:46.43] I pray that, God, we don't break
[01:50.45] I want you to take me up and down
[01:54.90] And 'round and 'round again
[01:57.81] And, oh, it's hard to see you, but I wish you were right here
[02:02.04] Oh, it's hard to leave you when I get you everywhere
[02:06.20] All this time I'm thinkin' we could never be a pair
[02:10.64] Oh, no, I don't need you, but I miss you, come here
[02:14.63] And, oh, it's hard to see you, but I wish you were right here
[02:19.07] Oh, it's hard to leave you when I get you everywhere
[02:23.01] All this time I'm thinkin' I'm strong enough to sink in
[02:27.53] Oh, no, I don't need you, but I miss you, come here
[02:31.62] But he love me not, he loves me
[02:33.63] He holds me tight, then lets me go
[02:35.92] He love me not, he loves me
[02:37.95] He holds me tight, then lets me go
[02:40.19] He love me not, he loves me
[02:42.10] He holds me tight, then lets me go
[02:44.38] He love me not, he loves me
[02:46.38] He holds me tight, then lets me go
[02:48.95] You gotta say that you're sorry at the end of the night
[02:53.84] Wake up in the mornin', everything's alright
[02:57.59] At the end of the story, you're holdin' me tight
[03:02.04] I don't need to worry, am I out of my mind?
[03:05.11] And, oh, it's hard to see you, but I wish you were right here
[03:09.59] Oh, it's hard to leave you when I get you everywhere
[03:13.65] All this time I'm thinkin' I'm strong enough to sink in
[03:18.12] Oh, no, I don't need you, but I miss you, come here`,
  },
};

function normalizeCustomLyricsLookup(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[.,/#!$%^*;:{}=_`~'"-]/g, " ")
    .replace(/[()[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasCustomLyrics(artist: string, track: string): boolean {
  const artistNorm = normalizeCustomLyricsLookup(artist);
  const trackNorm = normalizeCustomLyricsLookup(track);

  return Object.keys(CUSTOM_LYRICS).some((key) => {
    const delimiterIndex = key.indexOf(" - ");
    const customArtist = delimiterIndex >= 0 ? key.slice(0, delimiterIndex) : "";
    const customTrack = delimiterIndex >= 0 ? key.slice(delimiterIndex + 3) : key;
    const customArtistNorm = normalizeCustomLyricsLookup(customArtist);
    const customTrackNorm = normalizeCustomLyricsLookup(customTrack);

    const artistMatches =
      artistNorm === customArtistNorm ||
      artistNorm.includes(customArtistNorm) ||
      customArtistNorm.includes(artistNorm);
    const trackMatches =
      trackNorm === customTrackNorm ||
      trackNorm.includes(customTrackNorm) ||
      customTrackNorm.includes(trackNorm);

    return artistMatches && trackMatches;
  });
}
