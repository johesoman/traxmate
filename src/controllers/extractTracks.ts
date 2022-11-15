import { FileExtension, FileSystemClient } from "../adapters/fileSystem";
import { join } from "path";
import logger from "../lib/logger";
import { left, right } from "fp-ts/lib/Either";
import { isDirectory } from "../lib/fileSystem";

export type ExtractTracksParams = {
  sourceDirectoryPath: string;
  destinationDirectoryPath: string;
};

const fileExtensions: FileExtension[] = [".wav", ".flac", ".aiff", ".mp3"];

export const extractTracks = ({
  sourceDirectoryPath: source,
  destinationDirectoryPath: destination,
}: ExtractTracksParams) => {
  if (source === destination) {
    return left("SOURCE_AND_DESTINATION_ARE_THE_SAME");
  }

  if (!isDirectory(source)) {
    return left("SOURCE_IS_NOT_A_DIRECTORY");
  }

  if (!isDirectory(destination)) {
    return left("DESTINATION_IS_NOT_A_DIRECTORY");
  }

  const client = new FileSystemClient();

  const files = client.getLeavesOfFileTree(source, fileExtensions);

  for (const { path, name } of files) {
    logger.info(`Moving file ${name}...`);

    client.moveFile({
      sourceFilePath: path,
      destinationFilePath: join(destination, name),
    });
  }

  return right("OK");
};
