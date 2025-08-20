import 'server-only';
import { unstable_noStore as noStore } from 'next/cache';

export function getEnvironmentVariable(key) {
  noStore();
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}
