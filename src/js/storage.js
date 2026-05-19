const PREFIX = 'lol_';

export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage schrijven mislukt:', e);
    }
  },
  remove: (key) => localStorage.removeItem(PREFIX + key),
};
