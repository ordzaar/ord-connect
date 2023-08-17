export function TruncateMiddle(
  value: string,
  frontStringToKeep = 4,
  backStringToKeep = 5,
): string {
  if (value.length <= frontStringToKeep + backStringToKeep) {
    return value;
  }

  const front = value.slice(0, frontStringToKeep);
  const back = value.slice(value.length - backStringToKeep);
  return `${front}...${back}`;
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
