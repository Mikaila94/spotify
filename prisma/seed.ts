import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // ---------------------------------------------------------------------------
  // 0) DEV RESET (safe for dev; remove in prod seeds)
  // ---------------------------------------------------------------------------
  await prisma.$transaction([
    prisma.playlistSong.deleteMany(),
    prisma.songArtist.deleteMany(),
    prisma.albumArtist.deleteMany(),
    prisma.playlist.deleteMany(),
    prisma.song.deleteMany(),
    prisma.album.deleteMany(),
    prisma.artist.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // ---------------------------------------------------------------------------
  // 1) Artists
  // ---------------------------------------------------------------------------
  const artistNames = [
    "Aurora Grey",
    "Neon Harbor",
    "Echo Atlas",
    "Kairo Bloom",
  ];
  await prisma.artist.createMany({
    data: artistNames.map((name) => ({ name })),
    skipDuplicates: true,
  });
  const artists = await prisma.artist.findMany({
    where: { name: { in: artistNames } },
  });

  const artistByName = Object.fromEntries(artists.map((a) => [a.name, a]));

  // ---------------------------------------------------------------------------
  // 2) Albums
  // ---------------------------------------------------------------------------
  const albumMidnight = await prisma.album.create({
    data: {
      title: "Midnight Sketches",
      releaseDate: new Date("2023-06-01"),
      coverUrl: "https://example.com/covers/midnight-sketches.jpg",
    },
  });

  const albumCityCircuit = await prisma.album.create({
    data: {
      title: "City Circuit",
      releaseDate: new Date("2024-11-08"),
      coverUrl: "https://example.com/covers/city-circuit.jpg",
    },
  });

  // ---------------------------------------------------------------------------
  // 3) Album ↔ Artist links (multi-artist album supported)
  // ---------------------------------------------------------------------------
  await prisma.albumArtist.createMany({
    data: [
      // Midnight Sketches by Aurora Grey
      {
        albumId: albumMidnight.id,
        artistId: artistByName["Aurora Grey"].id,
        role: "primary",
        order: 1,
      },
      // City Circuit by Neon Harbor (primary) + Echo Atlas (featured)
      {
        albumId: albumCityCircuit.id,
        artistId: artistByName["Neon Harbor"].id,
        role: "primary",
        order: 1,
      },
      {
        albumId: albumCityCircuit.id,
        artistId: artistByName["Echo Atlas"].id,
        role: "featured",
        order: 2,
      },
    ],
    skipDuplicates: true,
  });

  // ---------------------------------------------------------------------------
  // 4) Songs (some on albums, one single with no album)
  // ---------------------------------------------------------------------------
  // 4) Songs (now with required url)
  const s1 = await prisma.song.create({
    data: {
      name: "Hollow Lights",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      durationMs: 372_715,
      trackNumber: 1,
      discNumber: 1,
      album: { connect: { id: albumMidnight.id } },
    },
  });

  const s2 = await prisma.song.create({
    data: {
      name: "Echoes of Silence",
      url: "/audio/3-09 Echoes Of Silence.m4a",
      durationMs: 240_040,
      trackNumber: 2,
      discNumber: 1,
      album: { connect: { id: albumMidnight.id } },
    },
  });

  const s3 = await prisma.song.create({
    data: {
      name: "Chromatic Run",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      durationMs: 344_085,
      trackNumber: 3,
      discNumber: 1,
      album: { connect: { id: albumCityCircuit.id } },
    },
  });

  const s4 = await prisma.song.create({
    data: {
      name: "Transit Lines",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      durationMs: 302_524,
      trackNumber: 5,
      discNumber: 1,
      album: { connect: { id: albumCityCircuit.id } },
    },
  });

  const s5 = await prisma.song.create({
    data: {
      name: "Cold Start",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      durationMs: 353_959,
      // single, no album on purpose
    },
  });


  // ---------------------------------------------------------------------------
  // 5) Users (hash the password)
  // ---------------------------------------------------------------------------
  const passwordHash = await bcrypt.hash("dev123", bcrypt.genSaltSync());
  const user = await prisma.user.create({
    data: {
      email: "mikail@example.com",
      passwordHash,
      firstName: "Mikail",
      lastName: "Arslan"
    },
  });

  // ---------------------------------------------------------------------------
  // 6) Playlists
  // ---------------------------------------------------------------------------
  const focusMode = await prisma.playlist.create({
    data: {
      name: "Focus Mode",
      description: "Deep work, no lyrics up front.",
      isPublic: false,
      user: { connect: { id: user.id } },
    },
  });

  const weekendVibes = await prisma.playlist.create({
    data: {
      name: "Weekend Vibes",
      description: "Uplifting electronic & alt.",
      isPublic: true,
      user: { connect: { id: user.id } },
    },
  });

  // ---------------------------------------------------------------------------
  // 7) Playlist ↔ Song links (ordered)
  // ---------------------------------------------------------------------------
  await prisma.playlistSong.createMany({
    data: [
      // Focus Mode order
      { playlistId: focusMode.id, songId: s1.id, position: 1 },
      { playlistId: focusMode.id, songId: s3.id, position: 2 },
      { playlistId: focusMode.id, songId: s5.id, position: 3 },

      // Weekend Vibes order
      { playlistId: weekendVibes.id, songId: s4.id, position: 1 },
      { playlistId: weekendVibes.id, songId: s2.id, position: 2 },
      { playlistId: weekendVibes.id, songId: s3.id, position: 3 },
    ],
    skipDuplicates: true,
  });

  // ---------------------------------------------------------------------------
  // 8) Song ↔ Artist links (roles + display order)
  // ---------------------------------------------------------------------------
  await prisma.songArtist.createMany({
    data: [
      // Aurora Grey’s album tracks
      {
        songId: s1.id,
        artistId: artistByName["Aurora Grey"].id,
        role: "primary",
        order: 1,
      },
      {
        songId: s2.id,
        artistId: artistByName["Aurora Grey"].id,
        role: "primary",
        order: 1,
      },

      // City Circuit tracks: Neon Harbor primary, Echo Atlas featured
      {
        songId: s3.id,
        artistId: artistByName["Neon Harbor"].id,
        role: "primary",
        order: 1,
      },
      {
        songId: s3.id,
        artistId: artistByName["Echo Atlas"].id,
        role: "featured",
        order: 2,
      },
      {
        songId: s4.id,
        artistId: artistByName["Neon Harbor"].id,
        role: "primary",
        order: 1,
      },
      {
        songId: s4.id,
        artistId: artistByName["Echo Atlas"].id,
        role: "featured",
        order: 2,
      },

      // Single by Kairo Bloom
      {
        songId: s5.id,
        artistId: artistByName["Kairo Bloom"].id,
        role: "primary",
        order: 1,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
