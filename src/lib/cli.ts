import { Either, isLeft, left, right } from "fp-ts/lib/Either";

const isOption = (s: string) => s.startsWith("--");
const normalizeOption = (s: string) => s.slice(2);

const preParseOptions = (args: string[]) => {
  const parsedNames = new Set();
  const options: Record<string, string | boolean> = {};

  for (let i = 0; i < args.length; ) {
    const option = args[0];

    if (!isOption(option)) {
      return left(
        `Unexpected argument "${option}". Expected option name with prefix "--"`
      );
    }

    const normalizedOption = normalizeOption(option);

    if (parsedNames.has(normalizedOption)) {
      return left(`Expected only one instance of option "${option}".`);
    }

    const next = args[i + 1];

    if (isOption(next) || next === undefined) {
      options[normalizedOption] = true;
    } else {
      options[normalizedOption] = next;
    }

    parsedNames.add(normalizedOption);
  }

  return right(parsedNames.size === 0 ? undefined : options);
};

export type ParseResult<T> = Either<string, T>;

export type Parse<T> = (
  command: string | undefined,
  options: Record<string, string | boolean> | undefined
) => ParseResult<T>;

export const parseArgsWith = <T>(parse: Parse<T>) => {
  return (args: string[]): ParseResult<T> => {
    const [first, ...rest] = args;

    const command = first === "--help" ? "help" : first;

    const parseResult = preParseOptions(rest);

    if (isLeft(parseResult)) {
      return parseResult;
    }

    const options = parseResult.right;

    return parse(command, options);
  };
};
