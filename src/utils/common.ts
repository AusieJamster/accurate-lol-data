export const truncateVersion = (versionString: string) => {
  const regex: RegExp = /^(\d+\.\d+)/;
  const matches: RegExpMatchArray | null = versionString.match(regex);

  if (matches && matches.length > 1) {
    return matches[1];
  }

  throw new Error('Invalid version string');
};
