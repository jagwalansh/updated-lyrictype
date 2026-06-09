import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Play } from "lucide-react";
import { DeflectCard } from "@/components/ui/deflect-card";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

export const Route = createFileRoute("/recommended")({
  head: () => ({
    meta: [
      { title: "Recommended Songs | KeyVerse" },
      {
        name: "description",
        content:
          "Browse recommended KeyVerse songs for rhythm typing practice, from beginner-friendly tracks to faster lyric challenges.",
      },
    ],
    links: [{ rel: "canonical", href: "https://keyverse.me/recommended" }],
  }),
  component: Recommended,
});

const FEATURED_SONGS = [
  {
    id: 1743852427,
    trackName: "Love Me Not",
    artistName: "Ravyn Lenae",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/07/8c/6c/078c6c94-d38d-0451-d57b-23e957b569f8/075679660893.jpg/100x100bb.jpg",
    duration: 213,
    difficulty: "Easy",
    difficultyColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    description: "Catchy rhythm, clear vocals. Features custom pre-synced lyrics!",
    tags: ["R&B", "Groovy"],
  },
  {
    id: 1579787410,
    trackName: "STAY",
    artistName: "The Kid LAROI & Justin Bieber",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a8/3a/22/a83a22f7-af18-7ef6-a7de-74816c532a44/886449475421.jpg/100x100bb.jpg",
    duration: 142,
    difficulty: "Medium",
    difficultyColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    description: "Energetic, fast, but highly repetitive. Great for rhythm practice.",
    tags: ["Pop", "Upbeat"],
  },
  {
    id: 1488408568,
    trackName: "Blinding Lights",
    artistName: "The Weeknd",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a6/6e/bf/a66ebf79-5008-8948-b352-a790fc87446b/19UM1IM04638.rgb.jpg/100x100bb.jpg",
    duration: 202,
    difficulty: "Medium",
    difficultyColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    description: "Fast-paced synth-pop. Excellent test for high-speed typing endurance.",
    tags: ["Synth-pop", "Energetic"],
  },
  {
    id: 1508562516,
    trackName: "Heat Waves",
    artistName: "Glass Animals",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/da/8b/77/da8b7731-6f4f-eacf-5e74-8b23389eefa1/20UMGIM03371.rgb.jpg/100x100bb.jpg",
    duration: 239,
    difficulty: "Easy",
    difficultyColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    description: "Laying down a clean indie-pop beat. Very forgiving word spacing.",
    tags: ["Indie Pop", "Steady"],
  },
];

const TRENDING_SONGS = [
  {
    id: 1752214923,
    trackName: "Espresso",
    artistName: "Sabrina Carpenter",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/a1/1c/ca/a11ccab6-7d4c-e041-d028-998bcebeb709/24UMGIM61704.rgb.jpg/100x100bb.jpg",
    duration: 175,
    difficulty: "Medium",
    difficultyColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    description: "Bouncy pop phrasing with quick transitions and a playful rhythm.",
    tags: ["Pop", "Trending"],
  },
  {
    id: 1739659142,
    trackName: "BIRDS OF A FEATHER",
    artistName: "Billie Eilish",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/92/9f/69/929f69f1-9977-3a44-d674-11f70c852d1b/24UMGIM36186.rgb.jpg/100x100bb.jpg",
    duration: 210,
    difficulty: "Easy",
    difficultyColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    description: "Smooth, melodic lines with a steady tempo that is easy to follow.",
    tags: ["Pop", "Chill"],
  },
  {
    id: 1762656732,
    trackName: "Die With A Smile",
    artistName: "Lady Gaga & Bruno Mars",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/11/ae/f2/11aef294-f57c-bab9-c9fc-529162984e62/24UMGIM85348.rgb.jpg/100x100bb.jpg",
    duration: 251,
    difficulty: "Easy",
    difficultyColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    description: "A dramatic duet with clear vocals and a comfortable typing pace.",
    tags: ["Pop", "Ballad"],
  },
  {
    id: 1773452221,
    trackName: "APT.",
    artistName: "ROSÉ & Bruno Mars",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/2d/1a/7d/2d1a7d91-587e-0ceb-d434-327bd66d9e86/075679628312.jpg/100x100bb.jpg",
    duration: 169,
    difficulty: "Medium",
    difficultyColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    description: "Fast, punchy hooks and repeated phrases for energetic practice.",
    tags: ["Pop", "Upbeat"],
  },
  {
    id: 1724488124,
    trackName: "Beautiful Things",
    artistName: "Benson Boone",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/54/f4/92/54f49210-e260-b519-ebbd-f4f40ee710cd/054391342751.jpg/100x100bb.jpg",
    duration: 180,
    difficulty: "Easy",
    difficultyColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    description: "A gradual vocal build with clear verses and a memorable chorus.",
    tags: ["Pop", "Emotional"],
  },
  {
    id: 1749591722,
    trackName: "A Bar Song (Tipsy)",
    artistName: "Shaboozey",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/be/db/81/bedb81c3-ca23-a1b9-f275-59e46ae4fdb1/197342625517_cover.jpg/100x100bb.jpg",
    duration: 171,
    difficulty: "Medium",
    difficultyColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    description: "A catchy country-pop rhythm with conversational, flowing lyrics.",
    tags: ["Country", "Trending"],
  },
  {
    id: 1866732800,
    trackName: "I Just Might",
    artistName: "Bruno Mars",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ed/46/bf/ed46bf4e-7cb9-965a-54f3-03059977fe6c/075679589293.jpg/100x100bb.jpg",
    duration: 213,
    difficulty: "Medium",
    difficultyColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    description: "Bright pop vocals and a steady groove with quick lyrical turns.",
    tags: ["Pop", "Trending"],
  },
  {
    id: 1870984033,
    trackName: "Aperture",
    artistName: "Harry Styles",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/07/41/6a/07416a78-38b9-2d47-7ce8-8a52a44c510f/196874010112.jpg/100x100bb.jpg",
    duration: 312,
    difficulty: "Easy",
    difficultyColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    description: "A relaxed, melodic track with plenty of room to settle into the beat.",
    tags: ["Pop", "Chill"],
  },
  {
    id: 1833328845,
    trackName: "Opalite",
    artistName: "Taylor Swift",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/2d/46/e0/2d46e0bc-8ab9-85dd-4b56-ee6951351034/25UM1IM19577.rgb.jpg/100x100bb.jpg",
    duration: 235,
    difficulty: "Medium",
    difficultyColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    description: "Polished pop storytelling with a rhythmic chorus and clear phrasing.",
    tags: ["Pop", "Trending"],
  },
  {
    id: 1842444457,
    trackName: "Dracula",
    artistName: "Tame Impala",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/36/be/b4/36beb41f-c644-55cb-9fbb-bf0622a66653/196873644783.jpg/100x100bb.jpg",
    duration: 205,
    difficulty: "Medium",
    difficultyColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    description: "Psychedelic pop with a firm pulse and a slightly trickier lyrical flow.",
    tags: ["Psychedelic", "Trending"],
  },
  {
    id: 1817609509,
    trackName: "Man I Need",
    artistName: "Olivia Dean",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/08/e2/21/08e22164-7c0b-1522-818f-e0e74f62dc49/25UMGIM69703.rgb.jpg/100x100bb.jpg",
    duration: 184,
    difficulty: "Easy",
    difficultyColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    description: "Warm vocals and an easygoing groove that keeps the typing pace smooth.",
    tags: ["Soul-pop", "Groovy"],
  },
  {
    id: 1806614783,
    trackName: "Stateside",
    artistName: "PinkPantheress",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/12/db/5a/12db5a38-94c1-42bc-b36b-7204b7aa4eac/5021732768650.jpg/100x100bb.jpg",
    duration: 168,
    difficulty: "Medium",
    difficultyColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    description: "A compact, upbeat track with brisk lines and a light dance rhythm.",
    tags: ["Dance-pop", "Upbeat"],
  },
];

interface Song {
  id: number;
  trackName: string;
  artistName: string;
  artworkUrl100?: string;
  duration: number;
  description: string;
  tags: string[];
}

function SongGrid({ songs }: { songs: Song[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
      {songs.map((song) => (
        <DeflectCard key={song.id} className="w-full rounded-2xl">
          <div className="group relative flex flex-col justify-between p-5 rounded-2xl border border-border/40 bg-card/45 backdrop-blur-sm hover:border-primary/30 transition-colors w-full h-full overflow-hidden text-left">
            {/* Backlighting effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350 pointer-events-none" />

            <div className="flex gap-4 relative z-10">
              {/* Artwork */}
              <div className="relative h-16 w-16 rounded-xl overflow-hidden shrink-0 border border-border/20 shadow-inner">
                {song.artworkUrl100 ? (
                  <img
                    src={song.artworkUrl100}
                    alt={song.trackName}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    ♪
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="min-w-0 flex-1 text-left flex flex-col justify-between">
                <div>
                  <h3 className="truncate font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {song.trackName}
                  </h3>
                  <p className="truncate text-xs text-muted-foreground mt-0.5">{song.artistName}</p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {/* Tag Badges */}
                  {song.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex px-2 py-0.5 text-[9px] font-mono text-muted-foreground bg-muted/60 border border-border/20 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-[11px] text-muted-foreground mt-4 text-left leading-relaxed relative z-10 min-h-[32px] group-hover:text-foreground/90 transition-colors">
              {song.description}
            </p>

            {/* Action row */}
            <div className="flex items-center justify-between border-t border-border/20 mt-4 pt-3 relative z-10">
              <span className="text-[10px] font-mono text-muted-foreground">
                Duration: {Math.floor(song.duration / 60)}m {song.duration % 60}s
              </span>

              <Link
                to={`/play/${song.id}`}
                search={{
                  artist: song.artistName,
                  track: song.trackName,
                  art: song.artworkUrl100 || "",
                  duration: song.duration,
                  from: "/recommended",
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold bg-primary text-primary-foreground hover:opacity-90 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <Play className="h-3 w-3 fill-current shrink-0" />
                PLAY
              </Link>
            </div>
          </div>
        </DeflectCard>
      ))}
    </div>
  );
}

function Recommended() {
  return (
    <main className="flex flex-col justify-start items-center min-h-screen bg-background text-foreground font-sans">
      <Navbar />

      <div className="w-full max-w-4xl mx-auto px-6 py-28 flex flex-col gap-10 flex-1 justify-start">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/20 pb-6">
          <div className="text-left">
            <div className="text-xs font-mono text-primary font-semibold tracking-wider uppercase mb-1">
              Curated Tracklist
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Recommended Songs
            </h1>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xl">
              Tracks that tend to work well for rhythm typing: clear phrasing, recognizable
              sections, and enough repetition to make a replay worthwhile.
            </p>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 self-start md:self-auto px-4 py-2 text-xs font-mono font-semibold border border-border/40 hover:border-primary/50 bg-card/45 backdrop-blur-sm hover:bg-muted/60 text-muted-foreground hover:text-foreground rounded-lg transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Featured Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold tracking-wider text-muted-foreground font-mono uppercase flex items-center gap-2">
            Featured Tracks
          </h2>
          <SongGrid songs={FEATURED_SONGS} />
        </div>

        {/* Trending Songs Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold tracking-wider text-muted-foreground font-mono uppercase flex items-center gap-2">
            Trending Songs
          </h2>
          <SongGrid songs={TRENDING_SONGS} />
        </div>

        <section className="grid gap-8 border-t border-border/20 pt-8 text-left md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Selection notes</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              The list favors songs with reliable timing, distinct vocal entries, and sections that
              make sense on repeat. Easier tracks leave more room between lines; medium tracks
              compress the phrasing and ask for faster recovery.
            </p>
          </div>
          <div className="border-l border-border/30 pl-0 md:pl-6">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Practice order
            </h2>
            <ol className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
              <li>Start with one easy track and learn where the lyric lines begin.</li>
              <li>
                Replay it until missed characters are rare, not just until the score improves.
              </li>
              <li>Move to medium tracks when the rhythm feels predictable.</li>
            </ol>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
