import * as migration_20261119_232145_initial from './20261119_232145_initial';

export const migrations = [
  {
    up: migration_20261119_232145_initial.up,
    down: migration_20261119_232145_initial.down,
    name: '20261119_232145_initial'
  },
];
