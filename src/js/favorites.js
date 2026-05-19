import { storage } from './storage.js';

const KEY = 'favorites';

export const favorites = {
  getAll: () => storage.get(KEY) ?? [],

  add: (champion) => {
    const all = favorites.getAll();
    if (!favorites.has(champion.id)) {
      storage.set(KEY, [...all, champion]);
    }
  },

  remove: (id) => {
    const filtered = favorites.getAll().filter((c) => c.id !== id);
    storage.set(KEY, filtered);
  },

  // geeft true terug als champion nu favoriet is
  toggle: (champion) => {
    const wasFav = favorites.has(champion.id);
    wasFav ? favorites.remove(champion.id) : favorites.add(champion);
    return !wasFav;
  },

  has: (id) => favorites.getAll().some((c) => c.id === id),

  clear: () => storage.set(KEY, []),

  count: () => favorites.getAll().length,
};
