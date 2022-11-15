import { isLeft } from "fp-ts/lib/Either";
import help from "./help";
import { parseArgs } from "./parseArgs";

const main = () => {
  // eslint-disable-next-line
  const [_nodePath, _thisFilePath, ...unparsedArgs] = process.argv;

  const parseResult = parseArgs(unparsedArgs);

  if (isLeft(parseResult)) {
    console.log(parseResult.left);
    return;
  }

  console.log(parseResult.right);

  const { command, args, options } = parseResult.right;

  if (command === "help") {
    console.log(help);
  }
};

main();

// import (collect => rename => convert)
// collect
// rename
// covert
