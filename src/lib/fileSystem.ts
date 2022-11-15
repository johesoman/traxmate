import fs from "fs";

export const isDirectory = (path: string) => {
  try {
    const lstat = fs.lstatSync(path);
    return lstat.isDirectory();
  } catch (_) {
    return false;
  }
};
