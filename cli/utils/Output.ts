export function success(message: string): void {
  console.log(`✓ ${message}`);
}

export function info(message: string): void {
  console.log(`ℹ ${message}`);
}

export function warn(message: string): void {
  console.warn(`⚠ ${message}`);
}

export function error(message: string): void {
  console.error(`✗ ${message}`);
}

export function maskString(str: string, visibleLength = 4): string {
  if (!str || str.length <= visibleLength) return "****";
  const hidden = "*".repeat(str.length - visibleLength);
  return `${str.substring(0, visibleLength)}${hidden}`;
}
