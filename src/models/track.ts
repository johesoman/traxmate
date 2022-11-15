export type Track = {
  artist: string;
  song: string;
};

const normalizeName = (name: string): string => {
  const words = name.split(/ |_/).filter(str => str !== "");
  return words.join(" ");
};

export const parseTrack = (trackName: string): Track | undefined => {
  const [artist, song] = trackName.split("-");

  if (song === undefined || artist === undefined) {
    return undefined;
  }

  return {
    artist: normalizeName(artist),
    song: normalizeName(song),
  };
};
