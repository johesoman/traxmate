import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import { Either, isRight, left } from "fp-ts/lib/Either";

export const decodeSafe = <A>(
  codec: t.Decoder<unknown, A>,
  value: unknown
): Either<string[], A> => {
  const result = codec.decode(value);
  if (isRight(result)) {
    return result;
  } else {
    const errors = PathReporter.report(result);
    return left(errors);
  }
};

export const tryDecode = <A>(
  codec: t.Decoder<unknown, A>,
  value: unknown
): A | undefined => {
  const result = codec.decode(value);
  if (isRight(result)) {
    return result.right;
  } else {
    return undefined;
  }
};

export const nonEmptyString = new t.Type<string, string>(
  "Non-empty string.",
  t.string.is,
  (x, context) =>
    typeof x === "string" && x.length > 0
      ? t.success(x)
      : t.failure(x, context),
  String
);
