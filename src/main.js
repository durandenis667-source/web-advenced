import { fetchChampions } from './js/api.js';
import { storage } from './js/storage.js';
import { favorites } from './js/favorites.js';
import { applyFilters, sortChampions } from './js/filters.js';
import {
  renderCards, renderTable, renderModal, renderFavoritesList,
  updateBadge, updateResultsCount, showToast, syncFavButtons,
} from './js/ui.js';
import { setupCardReveal } from './js/observers.js';

// app state
const state = {
  allChampions: [],
  filtered: [],
  view: storage.get('view') ?? 'cards',
  theme: storage.get('theme') ?? 'dark',
  filters: {
    search: '',
    role: '',
    difficulty: '',
    sortBy: 'name',
    sortOrder: 'asc',
  },
};

const $ = (id) => document.getElementById(id);

const el = {
  searchForm:        $('search-form'),
  searchInput:       $('search-input'),
  searchError:       $('search-error'),
  btnClearSearch:    $('btn-clear-search'),
  filterRole:        $('filter-role'),
  filterDifficulty:  $('filter-difficulty'),
  sortBy:            $('sort-by'),
  btnSortOrder:      $('btn-sort-order'),
  btnResetFilters:   $('btn-reset-filters'),
  btnRandom:         $('btn-random'),
  resultsCount:      $('results-count'),
  btnViewCards:      $('btn-view-cards'),
  btnViewTable:      $('btn-view-table'),
  loading:           $('loading'),
  errorState:        $('error-state'),
  errorMessage:      $('error-message'),
  emptyState:        $('empty-state'),
  btnRetry:          $('btn-retry'),
  btnResetEmpty:     $('btn-reset-empty'),
  championsGrid:     $('champions-grid'),
  tableWrapper:      $('table-wrapper'),
  tableBody:         $('table-body'),
  btnTheme:          $('btn-theme'),
  btnFavorites:      $('btn-favorites'),
  favoritesBadge:    $('favorites-badge'),
  favoritesPanel:    $('favorites-panel'),
  favoritesList:     $('favorites-list'),
  favoritesEmpty:    $('favorites-empty'),
  favoritesFooter:   $('favorites-footer'),
  btnCloseFavorites: $('btn-close-favorites'),
  btnClearFavorites: $('btn-clear-favorites'),
  overlay:           $('overlay'),
  championModal:     $('champion-modal'),
  modalBody:         $('modal-body'),
  btnCloseModal:     $('btn-close-modal'),
};

const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  state.theme = theme;
  storage.set('theme', theme);
};

const setView = (view) => {
  state.view = view;
  storage.set('view', view);
  const isCards = view === 'cards';
  el.championsGrid.hidden = !isCards;
  el.tableWrapper.hidden  =  isCards;
  el.btnViewCards.classList.toggle('active', isCards);
  el.btnViewTable.classList.toggle('active', !isCards);
  el.btnViewCards.setAttribute('aria-pressed', String(isCards));
  el.btnViewTable.setAttribute('aria-pressed', String(!isCards));
  if (state.filtered.length) renderChampions();
};

const renderChampions = () => {
  const { filtered, view } = state;
  el.emptyState.hidden = filtered.length > 0;

  if (view === 'cards') {
    renderCards(filtered, el.championsGrid);
    setupCardReveal(el.championsGrid);
  } else {
    renderTable(filtered, el.tableBody);
  }

  updateResultsCount(state.allChampions.length, filtered.length, el.resultsCount);
};

const refreshFavoritesUI = () => {
  renderFavoritesList(el.favoritesList, el.favoritesEmpty, el.favoritesFooter);
  updateBadge(el.favoritesBadge, favorites.count());
};

// filters + sortering toepassen
const applyAll = () => {
  let result = applyFilters(state.allChampions, state.filters);
  result = sortChampions(result, state.filters.sortBy, state.filters.sortOrder);
  state.filtered = result;
  renderChampions();
};

// alle champions laden (één API-call, alles in één keer)
const loadChampions = async () => {
  el.loading.hidden = false;
  el.errorState.hidden = true;

  try {
    state.allChampions = await fetchChampions();
    applyAll();
  } catch (err) {
    console.error(err);
    el.errorState.hidden = false;
    el.errorMessage.textContent = `Er is een fout opgetreden: ${err.message}`;
  } finally {
    el.loading.hidden = true;
  }
};

const resetFilters = () => {
  state.filters = { search: '', role: '', difficulty: '', sortBy: 'name', sortOrder: 'asc' };
  el.searchInput.value      = '';
  el.filterRole.value       = '';
  el.filterDifficulty.value = '';
  el.sortBy.value           = 'name';
  el.btnSortOrder.dataset.order = 'asc';
  el.btnSortOrder.textContent   = '↑';
  el.searchError.textContent    = '';
  el.btnClearSearch.hidden      = true;
  applyAll();
};

// modal openen
const openModal = (id) => {
  const champion = state.allChampions.find((c) => c.id === id);
  if (!champion) return;

  el.championModal.hidden = false;
  el.overlay.hidden       = false;
  el.modalBody.innerHTML  = renderModal(champion);
};

const closeModal = () => {
  el.championModal.hidden = true;
  if (!el.favoritesPanel.classList.contains('favorites-panel--open')) {
    el.overlay.hidden = true;
  }
};

const openFavorites = () => {
  el.favoritesPanel.classList.add('favorites-panel--open');
  el.favoritesPanel.setAttribute('aria-hidden', 'false');
  el.overlay.hidden = false;
  refreshFavoritesUI();
};

const closeFavorites = () => {
  el.favoritesPanel.classList.remove('favorites-panel--open');
  el.favoritesPanel.setAttribute('aria-hidden', 'true');
  if (el.championModal.hidden) el.overlay.hidden = true;
};

const toggleFavorite = (id) => {
  const champion =
    state.allChampions.find((c) => c.id === id) ??
    favorites.getAll().find((c) => c.id === id);

  if (!champion) return;

  const nowFav = favorites.toggle(champion);
  syncFavButtons(id);
  showToast(
    nowFav ? `${champion.name} toegevoegd aan favorieten ❤️` : `${champion.name} verwijderd`,
    nowFav ? 'success' : 'info'
  );
  refreshFavoritesUI();
};

// zoekformulier
el.searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = el.searchInput.value.trim();
  if (query.length === 1) {
    el.searchError.textContent = 'Voer minstens 2 tekens in.';
    return;
  }
  el.searchError.textContent = '';
  state.filters.search = query;
  applyAll();
});

el.searchInput.addEventListener('input', () => {
  el.btnClearSearch.hidden = el.searchInput.value.length === 0;
  el.searchError.textContent = '';
  if (el.searchInput.value === '') {
    state.filters.search = '';
    applyAll();
  }
});

el.btnClearSearch.addEventListener('click', () => {
  el.searchInput.value = '';
  el.btnClearSearch.hidden = true;
  state.filters.search = '';
  applyAll();
});

// filters
el.filterRole.addEventListener('change', () => {
  state.filters.role = el.filterRole.value;
  applyAll();
});

el.filterDifficulty.addEventListener('change', () => {
  state.filters.difficulty = el.filterDifficulty.value;
  applyAll();
});

// sortering
el.sortBy.addEventListener('change', () => {
  state.filters.sortBy = el.sortBy.value;
  applyAll();
});

el.btnSortOrder.addEventListener('click', () => {
  const next = state.filters.sortOrder === 'asc' ? 'desc' : 'asc';
  state.filters.sortOrder = next;
  el.btnSortOrder.dataset.order = next;
  el.btnSortOrder.textContent   = next === 'asc' ? '↑' : '↓';
  applyAll();
});

const randomChampion = () => {
  const pool = state.filtered.length ? state.filtered : state.allChampions;
  if (!pool.length) return;
  const c = pool[Math.floor(Math.random() * pool.length)];
  openModal(c.id);
  showToast(`🎲 ${c.name}!`, 'success');
};

el.btnRandom.addEventListener('click', randomChampion);
el.btnResetFilters.addEventListener('click', resetFilters);
el.btnResetEmpty.addEventListener('click', resetFilters);
el.btnRetry.addEventListener('click', loadChampions);

el.btnViewCards.addEventListener('click', () => setView('cards'));
el.btnViewTable.addEventListener('click', () => setView('table'));

el.btnTheme.addEventListener('click', () => {
  applyTheme(state.theme === 'dark' ? 'light' : 'dark');
});

el.btnFavorites.addEventListener('click', openFavorites);
el.btnCloseFavorites.addEventListener('click', closeFavorites);

el.btnClearFavorites.addEventListener('click', () => {
  favorites.clear();
  document.querySelectorAll('.fav-btn').forEach((btn) => {
    btn.classList.remove('fav-btn--active');
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = btn.textContent.trim().length > 2 ? '🤍 Toevoegen' : '🤍';
  });
  refreshFavoritesUI();
  showToast('Alle favorieten verwijderd', 'info');
});

el.overlay.addEventListener('click', () => { closeModal(); closeFavorites(); });
el.btnCloseModal.addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeModal(); closeFavorites(); }
});

// klikken op kaarten en tabel (event delegation)
const handleClick = (e) => {
  const favBtn = e.target.closest('.fav-btn');
  if (favBtn) { toggleFavorite(favBtn.dataset.id); return; }

  const detailBtn = e.target.closest('.card__detail-btn');
  if (detailBtn) { openModal(detailBtn.dataset.id); return; }

  const card = e.target.closest('.champion-card');
  if (card && !e.target.closest('button')) openModal(card.dataset.id);
};

el.championsGrid.addEventListener('click', handleClick);
el.tableWrapper.addEventListener('click', handleClick);

el.modalBody.addEventListener('click', (e) => {
  const favBtn = e.target.closest('.fav-btn');
  if (favBtn) toggleFavorite(favBtn.dataset.id);
});

el.favoritesList.addEventListener('click', (e) => {
  const btn = e.target.closest('.fav-remove-btn');
  if (btn) toggleFavorite(btn.dataset.id);
});

// opstarten
const init = () => {
  applyTheme(state.theme);
  setView(state.view);
  refreshFavoritesUI();
  loadChampions();
};

init();
