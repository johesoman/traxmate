import { left, right } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { parseArgsWith } from "../lib/cli";
import { nonEmptyString, tryDecode } from "../lib/iots";

const configCodec = t.type({
  config: nonEmptyString,
});

const srcDstCodec = t.type({
  source: nonEmptyString,
  destination: nonEmptyString,
});

const commandWithOptionsCodec = t.union([
  t.type({
    command: t.literal("help"),
  }),
  t.type({
    command: t.literal("extract"),
    options: t.union([configCodec, srcDstCodec]),
  }),
]);

export type CommandWithOptions = t.TypeOf<typeof commandWithOptionsCodec>;

export const parseArgs = parseArgsWith((command, options) => {
  const decodeResult = tryDecode(commandWithOptionsCodec, {
    command,
    options,
  });

  if (decodeResult === undefined) {
    const seeHelp = `See option "--help" for usage.`;

    switch (command) {
      case undefined:
        return left(`No command provided. ${seeHelp}`);

      case "extract":
        return left(
          `The command "extract" expects options "--source" and "--destination", or "--config".`
        );

      default:
        return left(`Unexpected command "${command}". ${seeHelp}`);
    }
  }

  return right(decodeResult);
});
