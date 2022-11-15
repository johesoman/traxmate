import klawSync, { Item } from "klaw-sync";
import { copySync, moveSync } from "fs-extra";
import { basename, extname } from "path";
import { right } from "fp-ts/lib/Either";

// helpers

export const makeFileExtensionRegex = (fileTypes: FileExtension[]): RegExp => {
  return new RegExp(`${fileTypes.join("|")}$`);
};

export const includeFileExtensions = (fileTypes: FileExtension[]) => {
  const regex = makeFileExtensionRegex(fileTypes);
  return (path: string) => regex.test(path);
};

export const itemToFile = ({ path }: Item): File => ({
  path,
  name: basename(path),
  extension: extname(path) as FileExtension,
});

// types

export type File = {
  path: string;
  name: string;
  extension: FileExtension;
};

export type FileExtension = string;

export type CopyFileParams = {
  sourceFilePath: string;
  destinationFilePath: string;
};

export type MoveFileParams = CopyFileParams;

// client

export class FileSystemClient {
  public getLeavesOfFileTree(
    directory: string,
    fileExtensions: FileExtension[]
  ): File[] {
    const result = klawSync(directory, {});

    const predicate = includeFileExtensions(fileExtensions);
    const items = result.filter(({ path }: Item) => predicate(path));

    return items.map(itemToFile);
  }

  public copyFile({ sourceFilePath, destinationFilePath }: CopyFileParams) {
    copySync(sourceFilePath, destinationFilePath);
  }

  public moveFile({ sourceFilePath, destinationFilePath }: MoveFileParams) {
    right(moveSync(sourceFilePath, destinationFilePath));
  }
}
