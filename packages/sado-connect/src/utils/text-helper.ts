export function TruncateMiddle(
  value: string,
  frontStringToKeep: number = 4,
  backStringToKeep: number = 5
): string {
  if (value.length <= frontStringToKeep + backStringToKeep) {
    return value;
  }

  const front = value.slice(0, frontStringToKeep);
  const back = value.slice(value.length - backStringToKeep);
  return `${front}...${back}`;
}
