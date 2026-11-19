import * as migration_20261119_215845_initial from './20261119_215845_initial';

export const migrations = [
  {
    up: migration_20261119_215845_initial.up,
    down: migration_20261119_215845_initial.down,
    name: '20261119_215845_initial'
  },
];
