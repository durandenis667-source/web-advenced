import { favorites } from './favorites.js';
import { getPortraitUrl, getLoadingUrl, getSplashUrl } from './api.js';

// kleur per rol
const ROLE_COLORS = {
  Fighter:  'orange',
  Tank:     'blue',
  Mage:     'purple',
  Assassin: 'red',
  Support:  'green',
  Marksman: 'yellow',
};

const roleBadge = (tag) =>
  `<span class="role-badge role-badge--${ROLE_COLORS[tag] ?? 'gray'}">${tag}</span>`;

// stat balk (schaal 0-10)
const statBar = (label, value, color = '') => `
  <div class="stat-row">
    <span class="stat-label">${label}</span>
    <div class="stat-track">
      <div class="stat-fill ${color}" style="width: ${value * 10}%"></div>
    </div>
    <span class="stat-value">${value}</span>
  </div>
`;

// moeilijkheid als sterren
const difficultyStars = (val) => {
  const filled = Math.round(val / 2);
  return '★'.repeat(filled) + '☆'.repeat(5 - filled);
};

const favBtnHtml = (id, isFav, full = false) => `
  <button class="btn btn--sm btn--icon fav-btn ${isFav ? 'fav-btn--active' : ''}"
    data-id="${id}" aria-pressed="${isFav}"
    title="${isFav ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}">
    ${full ? (isFav ? '❤️ In favorieten' : '🤍 Toevoegen') : (isFav ? '❤️' : '🤍')}
  </button>
`;

// een championkaart maken
const createCard = (champion) => {
  const isFav = favorites.has(champion.id);
  const roles = champion.tags.map(roleBadge).join('');

  const article = document.createElement('article');
  article.className = 'champion-card';
  article.dataset.id = champion.id;
  article.dataset.role = champion.tags[0] ?? '';

  article.innerHTML = `
    <div class="card__image-wrapper">
      <img src="${getLoadingUrl(champion.id)}" alt="${champion.name}" class="card__image" loading="lazy" />
      <span class="card__hp-badge">${Math.round(champion.stats.hp)} HP</span>
      <div class="card__overlay">
        <div class="card__roles">${roles}</div>
      </div>
    </div>
    <div class="card__body">
      <h3 class="card__name">${champion.name}</h3>
      <p class="card__title">${champion.title}</p>
      <div class="card__stats">
        ${statBar('⚔️', champion.info.attack, 'fill--attack')}
        ${statBar('🛡️', champion.info.defense, 'fill--defense')}
        ${statBar('✨', champion.info.magic, 'fill--magic')}
      </div>
    </div>
    <div class="card__footer">
      <button class="btn btn--ghost btn--sm card__detail-btn" data-id="${champion.id}">Details</button>
      ${favBtnHtml(champion.id, isFav)}
    </div>
  `;

  return article;
};

export const renderCards = (champions, container) => {
  container.innerHTML = '';
  const fragment = document.createDocumentFragment();
  champions.forEach((c) => fragment.appendChild(createCard(c)));
  container.appendChild(fragment);
};

// tabelweergave
export const renderTable = (champions, tbody) => {
  tbody.innerHTML = '';
  const fragment = document.createDocumentFragment();

  champions.forEach((c, index) => {
    const isFav = favorites.has(c.id);
    const tr = document.createElement('tr');
    tr.dataset.id = c.id;

    tr.innerHTML = `
      <td class="td--id">${index + 1}</td>
      <td class="td--name">
        <img src="${getPortraitUrl(c.id, c.version)}" alt="${c.name}" class="table__avatar" />
        <button class="btn btn--link card__detail-btn" data-id="${c.id}">${c.name}</button>
      </td>
      <td class="td--title">${c.title}</td>
      <td class="td--roles">${c.tags.map(roleBadge).join('')}</td>
      <td class="td--stat">${Math.round(c.stats.hp)}</td>
      <td class="td--stat">${c.info.attack}/10</td>
      <td class="td--stat">${c.info.defense}/10</td>
      <td class="td--stat">${c.info.magic}/10</td>
      <td class="td--stat td--stars" title="${c.info.difficulty}/10">${difficultyStars(c.info.difficulty)}</td>
      <td class="td--center">${favBtnHtml(c.id, isFav)}</td>
    `;

    fragment.appendChild(tr);
  });

  tbody.appendChild(fragment);
};

// modal met splash art
export const renderModal = (champion) => {
  const isFav = favorites.has(champion.id);
  const roles = champion.tags.map(roleBadge).join('');

  return `
    <div class="modal__splash" style="background-image: url('${getSplashUrl(champion.id)}')">
      <div class="modal__splash-overlay">
        <h2 id="modal-title">${champion.name}</h2>
        <p class="modal__champ-title">${champion.title}</p>
        <div class="modal__roles">${roles}</div>
      </div>
    </div>
    <div class="modal__details">
      <div class="modal__stats-col">
        <h3>Stats</h3>
        ${statBar('⚔️ Aanval', champion.info.attack, 'fill--attack')}
        ${statBar('🛡️ Verdediging', champion.info.defense, 'fill--defense')}
        ${statBar('✨ Magie', champion.info.magic, 'fill--magic')}
        <div class="stat-row">
          <span class="stat-label">💀 Moeilijkheid</span>
          <span class="modal__stars">${difficultyStars(champion.info.difficulty)} (${champion.info.difficulty}/10)</span>
        </div>
      </div>
      <div class="modal__info-col">
        <h3>Info</h3>
        <dl class="detail-list">
          <dt>HP</dt><dd>${Math.round(champion.stats.hp)}</dd>
          <dt>Aanvalsschade</dt><dd>${Math.round(champion.stats.attackdamage)}</dd>
          <dt>Aanvalssnelheid</dt><dd>${champion.stats.attackspeed.toFixed(3)}</dd>
          <dt>Bewegingssnelheid</dt><dd>${champion.stats.movespeed}</dd>
          <dt>Pantser</dt><dd>${champion.stats.armor}</dd>
          <dt>Aanvalsbereik</dt><dd>${champion.stats.attackrange}</dd>
          <dt>Resource</dt><dd>${champion.partype}</dd>
        </dl>
        ${favBtnHtml(champion.id, isFav, true)}
      </div>
    </div>
    <div class="modal__lore">
      <p>${champion.blurb}</p>
    </div>
  `;
};

// favorietenpaneel
export const renderFavoritesList = (container, emptyEl, footerEl) => {
  const all = favorites.getAll();
  container.innerHTML = '';

  emptyEl.hidden  = all.length > 0;
  footerEl.hidden = all.length === 0;

  if (!all.length) return;

  const fragment = document.createDocumentFragment();
  all.forEach((c) => {
    const div = document.createElement('div');
    div.className = 'fav-item';
    div.innerHTML = `
      <img src="${getPortraitUrl(c.id, c.version)}" alt="${c.name}" class="fav-item__avatar" />
      <div class="fav-item__info">
        <strong>${c.name}</strong>
        <span>${c.title}</span>
      </div>
      <button class="btn btn--icon fav-remove-btn" data-id="${c.id}" title="Verwijder" aria-label="Verwijder ${c.name}">✕</button>
    `;
    fragment.appendChild(div);
  });

  container.appendChild(fragment);
};

export const updateBadge = (badgeEl, count) => {
  badgeEl.textContent = count;
  badgeEl.hidden = count === 0;
};

export const updateResultsCount = (total, shown, el) => {
  el.textContent = shown === total
    ? `${total} champion${total !== 1 ? 's' : ''}`
    : `${shown} van ${total} champions`;
};

export const showToast = (message, type = 'info') => {
  document.getElementById('toast')?.remove();
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('toast--visible')));
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
};

// alle fav-knoppen voor een champion bijwerken
export const syncFavButtons = (id) => {
  const isFav = favorites.has(id);
  document.querySelectorAll(`.fav-btn[data-id="${id}"]`).forEach((btn) => {
    const full = btn.textContent.trim().length > 2;
    btn.classList.toggle('fav-btn--active', isFav);
    btn.setAttribute('aria-pressed', String(isFav));
    btn.innerHTML = full
      ? (isFav ? '❤️ In favorieten' : '🤍 Toevoegen')
      : (isFav ? '❤️' : '🤍');
  });
};
