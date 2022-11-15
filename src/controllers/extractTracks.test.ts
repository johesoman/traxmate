import { join, resolve } from "path";
import { copySync, emptyDirSync, ensureDirSync } from "fs-extra";
import { extractTracks } from "./extractTracks";
import { FileSystemClient } from "../adapters/fileSystem";
import { left, right } from "fp-ts/lib/Either";

describe("controllers/extractTracks", () => {
  const test = resolve(join(__dirname, "/../../test"));
  const fileTree = join(test, "fileTree");
  const root = join(test, "/controllers/extractTracks");
  const source = join(root, "source");
  const destination = join(root, "destination");

  const client = new FileSystemClient();

  beforeEach(() => {
    ensureDirSync(source);
    emptyDirSync(source);
    ensureDirSync(destination);
    emptyDirSync(destination);
  });

  afterEach(() => {
    emptyDirSync(source);
    emptyDirSync(destination);
  });

  it("returns left if source and destination are the same", () => {
    const result = extractTracks({
      sourceDirectoryPath: source,
      destinationDirectoryPath: source,
    });

    expect(result).toEqual(left("SOURCE_AND_DESTINATION_ARE_THE_SAME"));
  });

  it("returns left if source is ''", () => {
    const result = extractTracks({
      sourceDirectoryPath: "",
      destinationDirectoryPath: destination,
    });

    expect(result).toEqual(left("SOURCE_IS_NOT_A_DIRECTORY"));
  });

  it("returns left if destination is ''", () => {
    const result = extractTracks({
      sourceDirectoryPath: source,
      destinationDirectoryPath: "",
    });

    expect(result).toEqual(left("DESTINATION_IS_NOT_A_DIRECTORY"));
  });

  it("returns left if source is not a directory", () => {
    const result = extractTracks({
      sourceDirectoryPath: join(source, "a.wav"),
      destinationDirectoryPath: destination,
    });

    expect(result).toEqual(left("SOURCE_IS_NOT_A_DIRECTORY"));
  });

  it("returns left if destination is not a directory", () => {
    const result = extractTracks({
      sourceDirectoryPath: source,
      destinationDirectoryPath: join(source, "a.wav"),
    });

    expect(result).toEqual(left("DESTINATION_IS_NOT_A_DIRECTORY"));
  });

  it("extracts tracks and ignores other files (for example .txt files)", () => {
    copySync(fileTree, source);

    const sourceTracksBefore = client.getLeavesOfFileTree(source, [".wav"]);
    const destinationTracksBefore = client.getLeavesOfFileTree(destination, [
      ".wav",
    ]);

    expect(sourceTracksBefore).toEqual([
      expect.objectContaining({ name: "a.wav" }),
      expect.objectContaining({ name: "b.wav" }),
      expect.objectContaining({ name: "c.wav" }),
      expect.objectContaining({ name: "d.wav" }),
    ]);
    expect(destinationTracksBefore).toEqual([]);

    const result = extractTracks({
      sourceDirectoryPath: source,
      destinationDirectoryPath: destination,
    });

    expect(result).toEqual(right("OK"));

    const sourceTracksAfter = client.getLeavesOfFileTree(source, [".wav"]);
    const destinationTracksAfter = client.getLeavesOfFileTree(destination, [
      ".wav",
    ]);

    expect(sourceTracksAfter).toEqual([]);
    expect(destinationTracksAfter).toEqual([
      expect.objectContaining({ name: "a.wav" }),
      expect.objectContaining({ name: "b.wav" }),
      expect.objectContaining({ name: "c.wav" }),
      expect.objectContaining({ name: "d.wav" }),
    ]);

    const sourceTxtFilesAfter = client.getLeavesOfFileTree(source, [".txt"]);
    const destinationTxtFilesAfter = client.getLeavesOfFileTree(destination, [
      ".txt",
    ]);

    expect(sourceTxtFilesAfter).toEqual([
      expect.objectContaining({ name: "a.txt" }),
      expect.objectContaining({ name: "b.txt" }),
      expect.objectContaining({ name: "c.txt" }),
      expect.objectContaining({ name: "d.txt" }),
    ]);
    expect(destinationTxtFilesAfter).toEqual([]);
  });
});
