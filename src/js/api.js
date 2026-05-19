import { storage } from './storage.js';

const BASE = 'https://ddragon.leagueoflegends.com';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 uur

const getFromCache = (key) => {
  const cached = storage.get(`cache_${key}`);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
  return null;
};

const saveToCache = (key, data) => {
  storage.set(`cache_${key}`, { data, timestamp: Date.now() });
};

// nieuwste versie ophalen zodat we altijd up-to-date zijn
const getVersion = async () => {
  const cached = getFromCache('version');
  if (cached) return cached;

  const res = await fetch(`${BASE}/api/versions.json`);
  const versions = await res.json();
  const latest = versions[0];
  saveToCache('version', latest);
  return latest;
};

// alle champions in één keer ophalen
export const fetchChampions = async () => {
  const cached = getFromCache('champions');
  if (cached) return cached;

  const version = await getVersion();
  const res = await fetch(`${BASE}/cdn/${version}/data/en_US/champion.json`);
  if (!res.ok) throw new Error(`API fout: ${res.status}`);

  const json = await res.json();
  // Object.values() om het champion-object om te zetten naar een array
  const champions = Object.values(json.data).map((c) => ({ ...c, version }));

  console.log(`${champions.length} champions geladen (versie ${version})`);
  saveToCache('champions', champions);
  return champions;
};

// afbeelding URLs
export const getPortraitUrl = (id, version) =>
  `${BASE}/cdn/${version}/img/champion/${id}.png`;

export const getLoadingUrl = (id) =>
  `${BASE}/cdn/img/champion/loading/${id}_0.jpg`;

export const getSplashUrl = (id) =>
  `${BASE}/cdn/img/champion/splash/${id}_0.jpg`;
