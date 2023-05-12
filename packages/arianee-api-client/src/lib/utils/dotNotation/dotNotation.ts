/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyObject = { [key: string]: any };

export function convertObjectToDotNotation(
  obj: AnyObject,
  parentKey = '',
  result: string[] = []
): string {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        !(obj[key] instanceof Array)
      ) {
        convertObjectToDotNotation(obj[key], newKey, result);
      } else {
        result.push(`${newKey}=${obj[key]}`);
      }
    }
  }
  return result.join('&');
}
