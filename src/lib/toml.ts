import toml from "toml";
import { readFileSync } from "fs";
import { left, right } from "fp-ts/lib/Either";

export const parseFile = (filePath: string) => {
  try {
    const file = readFileSync(filePath, { encoding: "utf-8" });
    return right(toml.parse(file));
  } catch ({ line, column, message }) {
    return left(
      `"Parsing error on line ${line}, column ${column}: ${message}.`
    );
  }
};
