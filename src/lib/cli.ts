import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import _isEmpty from "lodash/isEmpty";

const isOption = (s: string) => s.startsWith("--");
const normalizeOption = (s: string) => s.slice(2);

const parseOption = (option: string): [string, string | boolean] => {
  const normalizedOption = normalizeOption(option);
  const [name, value] = normalizedOption.split("=");

  if (!value) {
    return [name, true];
  }

  return [name, value];
};

const preParseArgsAndOptions = (receivedArgs: string[]) => {
  const args: string[] = [];
  const options: Record<string, string | boolean> = {};

  for (const item of receivedArgs) {
    if (isOption(item)) {
      const [name, value] = parseOption(item);

      if (options[name] !== undefined) {
        return left(`Expected only one instance of option "--${name}".`);
      }

      options[name] = value;
    } else {
      args.push(item);
    }
  }

  return right({
    args,
    options,
  });
};

export type Args = string[];

export type Options = Record<string, string | boolean>;

export type ParseResult<T> = Either<string, T>;

export type Parse<T> = (
  args: string[],
  options: Record<string, string | boolean>
) => ParseResult<T>;

export const parseArgsWith = <T>(parse: Parse<T>) => {
  return (receivedArgs: string[]): ParseResult<T> => {
    const parseResult = preParseArgsAndOptions(receivedArgs);

    if (isLeft(parseResult)) {
      return parseResult;
    }

    const { args, options } = parseResult.right;

    return parse(args, options);
  };
};
