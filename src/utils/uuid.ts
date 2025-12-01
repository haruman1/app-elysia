import { v4 } from 'uuid';

export function generateUUID(): string {
  return v4();
}
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function extractUUIDParts(uuid: string): {
  timeLow: string;
  timeMid: string;
  timeHiAndVersion: string;
  clockSeq: string;
  node: string;
} {
  if (!isValidUUID(uuid)) {
    throw new Error('Invalid UUID format');
  }

  const parts = uuid.split('-');
  return {
    timeLow: parts[0],
    timeMid: parts[1],
    timeHiAndVersion: parts[2],
    clockSeq: parts[3],
    node: parts[4],
  };
}

export function generateUUIDFromParts({
  timeLow,
  timeMid,
  timeHiAndVersion,
  clockSeq,
  node,
}: {
  timeLow: string;
  timeMid: string;
  timeHiAndVersion: string;
  clockSeq: string;
  node: string;
}): string {
  return `${timeLow}-${timeMid}-${timeHiAndVersion}-${clockSeq}-${node}`.toLowerCase();
}
