import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { Props } from "io-ts";
import { Args, Options, parseArgsWith } from "../lib/cli";
import { decodeSafe, nonEmptyString } from "../lib/iots";

const sourceAndDestinationCodec = t.type({
  source: nonEmptyString,
  destination: nonEmptyString,
});

const configCodec = t.type({
  config: t.union([nonEmptyString, t.undefined]),
});

const collectArgs = sourceAndDestinationCodec;
const collectArgsOrder = ["source", "destination"];
const collectOptions = configCodec;

const commandCodec = t.union([
  t.type({
    command: t.literal("help"),
  }),
  t.type({
    command: t.literal("collect"),
    args: collectArgs,
    options: collectOptions,
  }),
]);

export type Command = t.TypeOf<typeof commandCodec>;

const decodeArgsWith = <T>(
  codec: t.Decoder<unknown, T>,
  expectedArgs: string[]
) => {
  return (receivedArgs: Args): Either<string, T> => {
    if (receivedArgs.length > expectedArgs.length) {
      const unexpectedArgs = receivedArgs.slice(expectedArgs.length);
      return left(
        `Unexpected additional arg(s): [${unexpectedArgs.join(", ")}].`
      );
    }

    const args = Object.fromEntries(
      expectedArgs.map((name, i) => {
        const value = receivedArgs[i];
        return [name, value];
      })
    );

    const decodeResult = decodeSafe(codec, args);

    if (isLeft(decodeResult)) {
      return left(
        `Expected ${expectedArgs.length} args: [${expectedArgs.join(", ")}].`
      );
    }

    return decodeResult;
  };
};

const decodeOptionsWith = <P extends Props>(codec: t.TypeC<P>) => {
  return (options: Options) => {
    const decodeResult = decodeSafe(t.exact(codec), options);

    if (isLeft(decodeResult)) {
      const invalidKeys = decodeResult.left.map(message => {
        const startIndex = message.indexOf("at ") + 3;
        const endIndex = message.indexOf(" but");
        return message.slice(startIndex, endIndex);
      });

      return left(
        `Missing required arguments for option(s): [${invalidKeys.join(", ")}].`
      );
    }

    const expectedKeys = Object.keys(decodeResult.right);
    const receivedKeys = Object.keys(options);
    const extraKeys = receivedKeys.filter(key => !expectedKeys.includes(key));

    if (extraKeys.length > 0) {
      return left(`Unexpected option(s): [${extraKeys.join(", ")}].`);
    }

    return decodeResult;
  };
};

export const parseArgs = parseArgsWith(([command, ...args], options) => {
  const seeHelp = `See option "--help" for usage.`;

  if (options.help) {
    return right({ command: "help" });
  }

  switch (command) {
    case undefined: {
      return left(`No command provided. ${seeHelp}`);
    }

    case "collect": {
      const argsResult = decodeArgsWith(collectArgs, collectArgsOrder)(args);

      if (isLeft(argsResult)) {
        return argsResult;
      }

      const optionsResult = decodeOptionsWith(collectOptions)(options);

      if (isLeft(optionsResult)) {
        return optionsResult;
      }

      return right({
        command,
        args: argsResult.right,
        options: optionsResult.right,
      });
    }

    default:
      return left(`Unexpected command "${command}". ${seeHelp}`);
  }
});
