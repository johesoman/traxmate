import { resolve, join } from "path";
import {
  FileSystemClient,
  FileExtension,
  includeFileExtensions,
} from "./client";
import {
  emptyDirSync,
  copySync,
  ensureDirSync,
  pathExistsSync,
} from "fs-extra";

describe("adapters/fileSystem/fileSystem/client.helpers", () => {
  describe("includeFileExtensions", () => {
    const fileExtensions: FileExtension[] = [".wav", ".flac", ".aiff", ".mp3"];
    const predicate = includeFileExtensions(fileExtensions);

    test.each(["a.wav", "x1/b.flac", "y1/y2/c.aiff", "z1/z2/z3/d.mp3"])(
      "includes the file: %s",
      (path: string) => {
        expect(predicate(path)).toEqual(true);
      }
    );

    test.each(["a.txt", "x1/b.bin", "y1/y2/c.sh", "z1/z2/z3/d.o"])(
      "it does not include the file: %s",
      (path: string) => {
        expect(predicate(path)).toEqual(false);
      }
    );
  });
});

describe("adapters/fileSystem/client.client", () => {
  const test = resolve(join(__dirname, "/../../../test"));
  const fileTree = join(test, "fileTree");
  const root = join(test, "/adapters/fileSystem");

  const client = new FileSystemClient();

  const getLeavesOfFileTree = (directory: string) =>
    client.getLeavesOfFileTree(directory, [".wav", ".flac", ".aiff", ".mp3"]);

  describe("getLeavesOfFileTree", () => {
    it("gets the leaves of the file tree", () => {
      const result = getLeavesOfFileTree(fileTree);

      expect(result).toEqual([
        expect.objectContaining({
          path: join(fileTree, "a.wav"),
          name: "a.wav",
          extension: ".wav",
        }),
        expect.objectContaining({
          path: join(fileTree, "/x1/b.wav"),
          name: "b.wav",
          extension: ".wav",
        }),
        expect.objectContaining({
          path: join(fileTree, "y1/y2/c.wav"),
          name: "c.wav",
          extension: ".wav",
        }),
        expect.objectContaining({
          path: join(fileTree, "z1/z2/z3/d.wav"),
          name: "d.wav",
          extension: ".wav",
        }),
      ]);
    });
  });

  describe("copyFile", () => {
    it("copies a file", () => {
      const source = fileTree;
      const destination = join(root, "copyFile/destination");

      ensureDirSync(destination);
      emptyDirSync(destination);

      const sourceFilePath = join(source, "a.wav");
      const destinationFilePath = join(destination, "a.wav");

      expect(pathExistsSync(destinationFilePath)).toEqual(false);

      client.copyFile({ sourceFilePath, destinationFilePath });

      expect(pathExistsSync(destinationFilePath)).toEqual(true);
    });
  });

  describe("moveFile", () => {
    const source = join(root, "/moveFile/source");
    const destination = join(root, "/moveFile/destination");

    beforeEach(() => {
      ensureDirSync(source);
      copySync(fileTree, source, { overwrite: true });
      ensureDirSync(destination);
      emptyDirSync(destination);
    });

    afterEach(() => {
      emptyDirSync(source);
      emptyDirSync(destination);
    });

    it("moves a file", () => {
      const sourceFilePath = join(source, "a.wav");
      const destinationFilePath = join(destination, "a.wav");

      expect(pathExistsSync(sourceFilePath)).toEqual(true);
      expect(pathExistsSync(destinationFilePath)).toEqual(false);

      client.moveFile({ sourceFilePath, destinationFilePath });

      expect(pathExistsSync(sourceFilePath)).toEqual(false);
      expect(pathExistsSync(destinationFilePath)).toEqual(true);
    });
  });
});
