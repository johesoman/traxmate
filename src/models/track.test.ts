import { parseTrack } from "./track";

describe("models/track", () => {
  it("parses a track", () => {
    const result = parseTrack("The Artist - My Song");

    expect(result).toMatchObject({
      artist: "The Artist",
      song: "My Song",
    });
  });
});
