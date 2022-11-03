export function classes(...classNames: Array<string | undefined>) {
  let res = "";

  for (const className of classNames) {
    if (className) {
      res += res ? ` ${className}` : className;
    }
  }

  return res;
}
