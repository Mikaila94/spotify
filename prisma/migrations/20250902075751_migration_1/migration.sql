-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Artist" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Album" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3),
    "coverUrl" TEXT,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Song" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "durationMs" INTEGER,
    "trackNumber" INTEGER,
    "discNumber" INTEGER,
    "albumId" INTEGER,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Playlist" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlaylistSong" (
    "playlistId" INTEGER NOT NULL,
    "songId" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "position" INTEGER,

    CONSTRAINT "PlaylistSong_pkey" PRIMARY KEY ("playlistId","songId")
);

-- CreateTable
CREATE TABLE "public"."SongArtist" (
    "songId" INTEGER NOT NULL,
    "artistId" INTEGER NOT NULL,
    "role" TEXT,
    "order" INTEGER,

    CONSTRAINT "SongArtist_pkey" PRIMARY KEY ("songId","artistId")
);

-- CreateTable
CREATE TABLE "public"."AlbumArtist" (
    "albumId" INTEGER NOT NULL,
    "artistId" INTEGER NOT NULL,
    "role" TEXT,
    "order" INTEGER,

    CONSTRAINT "AlbumArtist_pkey" PRIMARY KEY ("albumId","artistId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_name_key" ON "public"."Artist"("name");

-- CreateIndex
CREATE INDEX "Artist_name_idx" ON "public"."Artist"("name");

-- CreateIndex
CREATE INDEX "Album_releaseDate_idx" ON "public"."Album"("releaseDate");

-- CreateIndex
CREATE INDEX "Song_albumId_idx" ON "public"."Song"("albumId");

-- CreateIndex
CREATE INDEX "Song_name_idx" ON "public"."Song"("name");

-- CreateIndex
CREATE INDEX "Playlist_userId_idx" ON "public"."Playlist"("userId");

-- CreateIndex
CREATE INDEX "Playlist_isPublic_idx" ON "public"."Playlist"("isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_userId_name_key" ON "public"."Playlist"("userId", "name");

-- CreateIndex
CREATE INDEX "PlaylistSong_songId_idx" ON "public"."PlaylistSong"("songId");

-- CreateIndex
CREATE INDEX "SongArtist_artistId_idx" ON "public"."SongArtist"("artistId");

-- CreateIndex
CREATE INDEX "AlbumArtist_artistId_idx" ON "public"."AlbumArtist"("artistId");

-- AddForeignKey
ALTER TABLE "public"."Song" ADD CONSTRAINT "Song_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "public"."Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Playlist" ADD CONSTRAINT "Playlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlaylistSong" ADD CONSTRAINT "PlaylistSong_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "public"."Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlaylistSong" ADD CONSTRAINT "PlaylistSong_songId_fkey" FOREIGN KEY ("songId") REFERENCES "public"."Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SongArtist" ADD CONSTRAINT "SongArtist_songId_fkey" FOREIGN KEY ("songId") REFERENCES "public"."Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SongArtist" ADD CONSTRAINT "SongArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "public"."Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AlbumArtist" ADD CONSTRAINT "AlbumArtist_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "public"."Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AlbumArtist" ADD CONSTRAINT "AlbumArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "public"."Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
