export function isValidSessionId(str: string): boolean {
  return str.match(/^[\d]{8,8}$/) !== null;
}
