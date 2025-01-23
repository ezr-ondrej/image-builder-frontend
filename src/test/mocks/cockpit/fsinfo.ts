/* eslint-disable @typescript-eslint/no-unused-vars */

type fileinfo = {
  entries?: Record<string, fileinfo>;
  mtime: number;
};

export const fsinfo = (
  path: string,
  attributes: (keyof fileinfo)[],
  options: object
): Promise<fileinfo> => {
  return new Promise((resolve) => {
    resolve({
      entries: {},
      mtime: 1,
    });
  });
};
