export const arrayPartition = <T>(
  arr: T[],
  isValid: (e: T) => boolean
): T[][] => {
  const pass: T[] = [];
  const fail: T[] = [];

  arr.forEach((e) => (isValid(e) ? pass : fail).push(e));

  return [pass, fail];
};
