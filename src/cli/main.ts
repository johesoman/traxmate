import { isLeft } from "fp-ts/lib/Either";
import help from "./help";
import { parseArgs } from "./parseArgs";

const main = () => {
  // eslint-disable-next-line
  const [_nodePath, _thisFilePath, ...args] = process.argv;

  const parseResult = parseArgs(args);

  if (isLeft(parseResult)) {
    console.log(parseResult.left);
    return;
  }

  const { command, options } = parseResult.right;

  if (command === "help") {
    console.log(help);
  }
};

main();

// import (collect => rename => convert)
// collect
// rename
// covert
