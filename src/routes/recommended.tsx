import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, Play } from "lucide-react";
import { DeflectCard } from "@/components/ui/deflect-card";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

export const Route = createFileRoute("/recommended")({
  head: () => ({
    links: [{ rel: "canonical", href: "https://keyverse.me/recommended" }],
  }),
  component: Recommended,
});

const FEATURED_SONGS = [
  {
    id: 1743852427,
    trackName: "Love Me Not",
    artistName: "Ravyn Lenae",
    artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/07/8c/6c/078c6c94-d38d-0451-d57b-23e957b569f8/075679660893.jpg/100x100bb.jpg",
    duration: 213,
    difficulty: "Easy",
    difficultyColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    description: "Catchy rhythm, clear vocals. Features custom pre-synced lyrics!",
    tags: ["R&B", "Groovy"]
  },
  {
    id: 1579787410,
    trackName: "STAY",
    artistName: "The Kid LAROI & Justin Bieber",
    artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a8/3a/22/a83a22f7-af18-7ef6-a7de-74816c532a44/886449475421.jpg/100x100bb.jpg",
    duration: 142,
    difficulty: "Medium",
    difficultyColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    description: "Energetic, fast, but highly repetitive. Great for rhythm practice.",
    tags: ["Pop", "Upbeat"]
  },
  {
    id: 1488408568,
    trackName: "Blinding Lights",
    artistName: "The Weeknd",
    artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a6/6e/bf/a66ebf79-5008-8948-b352-a790fc87446b/19UM1IM04638.rgb.jpg/100x100bb.jpg",
    duration: 202,
    difficulty: "Medium",
    difficultyColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    description: "Fast-paced synth-pop. Excellent test for high-speed typing endurance.",
    tags: ["Synth-pop", "Energetic"]
  },
  {
    id: 1508562516,
    trackName: "Heat Waves",
    artistName: "Glass Animals",
    artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/da/8b/77/da8b7731-6f4f-eacf-5e74-8b23389eefa1/20UMGIM03371.rgb.jpg/100x100bb.jpg",
    duration: 239,
    difficulty: "Easy",
    difficultyColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    description: "Laying down a clean indie-pop beat. Very forgiving word spacing.",
    tags: ["Indie Pop", "Steady"]
  }
];

const POPULAR_SONGS = [
  {
    id: 1615585008,
    trackName: "As It Was",
    artistName: "Harry Styles",
    artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/2a/19/fb/2a19fb85-2f70-9e44-f2a9-82abe679b88e/886449990061.jpg/100x100bb.jpg",
    duration: 167,
    difficulty: "Easy",
    difficultyColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    description: "A fast-paced indie pop track with a catchy, constant synth riff.",
    tags: ["Indie Pop", "Synth"]
  },
  {
    id: 1538003843,
    trackName: "Levitating",
    artistName: "Dua Lipa",
    artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/100x100bb.jpg",
    duration: 203,
    difficulty: "Medium",
    difficultyColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    description: "Space-themed nu-disco and pop song. Rhythmic, groovy and upbeat.",
    tags: ["Disco-pop", "Upbeat"]
  },
  {
    id: 1440870375,
    trackName: "Starboy",
    artistName: "The Weeknd feat. Daft Punk",
    artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/100x100bb.jpg",
    duration: 230,
    difficulty: "Easy",
    difficultyColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    description: "Dark, moody R&B track with a steady, driving kick drum beat.",
    tags: ["R&B", "Electro"]
  },
  {
    id: 1468058171,
    trackName: "Cruel Summer",
    artistName: "Taylor Swift",
    artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/100x100bb.jpg",
    duration: 178,
    difficulty: "Medium",
    difficultyColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    description: "Energetic synth-pop track with highly memorable rhythmic lyrics.",
    tags: ["Pop", "Synth-pop"]
  },
  {
    id: 1193701392,
    trackName: "Shape of You",
    artistName: "Ed Sheeran",
    artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/100x100bb.jpg",
    duration: 233,
    difficulty: "Easy",
    difficultyColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    description: "Tropical house inspired pop track. Great sync pacing.",
    tags: ["Pop", "Dance"]
  },
  {
    id: 1411628233,
    trackName: "Believer",
    artistName: "Imagine Dragons",
    artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/11/7a/b8/117ab805-6811-8929-18b9-0fad7baf0c25/17UMGIM98210.rgb.jpg/100x100bb.jpg",
    duration: 204,
    difficulty: "Medium",
    difficultyColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    description: "Energetic pop-rock song with highly physical beat structure.",
    tags: ["Rock", "Upbeat"]
  },
  {
    id: 1193701400,
    trackName: "Perfect",
    artistName: "Ed Sheeran",
    artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/100x100bb.jpg",
    duration: 263,
    difficulty: "Very Easy",
    difficultyColor: "bg-teal-500/10 text-teal-500 border-teal-500/20",
    description: "A slow, romantic ballad. Very steady and simple to type along.",
    tags: ["Ballad", "Slow"]
  },
  {
    id: 1674691586,
    trackName: "Flowers",
    artistName: "Miley Cyrus",
    artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8c/67/ff/8c67ff91-31c3-3fef-1884-ce3ec89f3af4/196589946874.jpg/100x100bb.jpg",
    duration: 201,
    difficulty: "Easy",
    difficultyColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    description: "A mid-tempo disco-pop song. Clear vocals and a steady typing flow.",
    tags: ["Pop", "Disco"]
  },
  {
    id: 1434371887,
    trackName: "Shallow",
    artistName: "Lady Gaga & Bradley Cooper",
    artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b1/9f/ef/b19fef51-79de-a940-e8ab-9e4e07b04d96/18UMGIM53752.rgb.jpg/100x100bb.jpg",
    duration: 216,
    difficulty: "Very Easy",
    difficultyColor: "bg-teal-500/10 text-teal-500 border-teal-500/20",
    description: "Slow tempo acoustic build. Perfect for beginners learning typing sync.",
    tags: ["Acoustic", "Slow"]
  },
  {
    id: 1571330212,
    trackName: "Bad Habits",
    artistName: "Ed Sheeran",
    artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/63/45/cc/6345cc98-aa83-ad6e-e3c9-1a36ff9838a4/190296614316.jpg/100x100bb.jpg",
    duration: 231,
    difficulty: "Medium",
    difficultyColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    description: "Catchy, driving pop rhythm. Keeps you tapping to the constant beat.",
    tags: ["Dance-pop", "Rhythmic"]
  }
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
                  <p className="truncate text-xs text-muted-foreground mt-0.5">
                    {song.artistName}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {/* Tag Badges */}
                  {song.tags.map((tag) => (
                    <span key={tag} className="inline-flex px-2 py-0.5 text-[9px] font-mono text-muted-foreground bg-muted/60 border border-border/20 rounded">
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
                to="/play/$trackId"
                params={{ trackId: String(song.id) }}
                search={{
                  artist: song.artistName,
                  track: song.trackName,
                  art: song.artworkUrl100 || "",
                  duration: song.duration,
                  from: "/recommended"
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
              Hop straight into the game with these popular, highly-rhythmic, and beginner-friendly tracks. Perfect for mastering your timing and typing accuracy!
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

        {/* Popular Hits Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold tracking-wider text-muted-foreground font-mono uppercase flex items-center gap-2">
            Popular Hits
          </h2>
          <SongGrid songs={POPULAR_SONGS} />
        </div>

        <Footer />
      </div>
    </main>
  );
}
