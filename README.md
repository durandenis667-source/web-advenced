# LoL Champion Explorer

Een interactieve single-page applicatie voor het vak Web Advanced.  
Je kan hiermee alle League of Legends champions bekijken, filteren, sorteren en als favoriet opslaan.

---

## Waarom League of Legends?

Ik speel League of Legends al een paar jaar en kende de champions al goed. Dat maakte het makkelijker om te beslissen wat ik wilde tonen en hoe ik de data wilde structureren. De Riot Data Dragon API is gratis, heeft geen API-sleutel nodig en geeft alle 160+ champions in één call terug — ideaal voor dit project. Ik vond het ook leuker om iets te maken waar ik zelf interesse in heb dan een willekeurige dataset te gebruiken.

---

## Wat doet de app?

- Alle 160+ champions laden via de officiële Riot Data Dragon API
- Kaartweergave met champion-afbeeldingen en statbalkjes
- Tabelweergave met 10 kolommen (naam, titel, rol, HP, aanval, verdediging, magie, moeilijkheid...)
- Zoeken op naam
- Filteren op rol (Fighter, Tank, Mage, Assassin, Support, Marksman)
- Filteren op moeilijkheid (Gemakkelijk / Gemiddeld / Moeilijk)
- Sorteren op naam, HP, aanval, verdediging, magie of moeilijkheid
- Favorieten toevoegen en verwijderen (blijft bewaard na sluiten van de browser)
- Dark/light thema (voorkeur wordt onthouden)
- Detailmodal per champion met splash art, stats en lore

---

## Gebruikte API

**Riot Data Dragon** — https://ddragon.leagueoflegends.com  
Gratis, geen API-sleutel nodig. Geeft alle champion-data terug in één call.

---

## Installatie

```bash
npm install
npm run dev
```

Open daarna http://localhost:5174 in je browser.

Voor een productie-build:
```bash
npm run build
```
De bestanden komen terecht in de `dist/` map.

---

## Mappenstructuur

```
lol-explorer/
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
├── dist/               (gegenereerd via npm run build)
└── src/
    ├── main.js         (hoofdlogica, state, events)
    ├── css/
    │   └── style.css
    └── js/
        ├── api.js          (champions ophalen + cache)
        ├── storage.js      (localStorage helpers)
        ├── favorites.js    (favorieten beheren)
        ├── filters.js      (filteren en sorteren)
        ├── ui.js           (rendering: kaarten, tabel, modal)
        └── observers.js    (IntersectionObserver animaties)
```

---

## Technische vereisten

### DOM manipulatie
- **Elementen selecteren** — `src/main.js` regel 26 (`const $ = id => document.getElementById(id)`)
- **Elementen manipuleren** — `src/js/ui.js` regel 42 (innerHTML, classList, hidden)
- **Events koppelen** — `src/main.js` regel 189+ (alle addEventListener calls)

### Modern JavaScript
- **const** — overal gebruikt
- **Template literals** — `src/js/ui.js` regel 42, 75, 102 (HTML opbouwen met backticks)
- **Array iteratie** — `src/js/ui.js` regel 68 (forEach over champions)
- **Array methodes** — `src/js/filters.js` regel 3 (filter), regel 17 (sort); `src/js/ui.js` regel 30 (map voor role badges); `src/js/favorites.js` regel 13 (filter), regel 22 (some); `src/js/api.js` regel 30 (map via Object.values)
- **Arrow functions** — overal
- **Ternary operator** — `src/js/ui.js` regel 34 (favBtnHtml), `src/js/filters.js` regel 10-12
- **Callback functions** — bij alle addEventListener en array methodes
- **Promises** — `src/js/api.js` regel 37 (fetch geeft een Promise terug)
- **Async/Await** — `src/js/api.js` regel 20 (getVersion), regel 28 (fetchChampions)
- **Observer API** — `src/js/observers.js` regel 2 (IntersectionObserver voor kaartanimaties)

### Data & API
- **Fetch** — `src/js/api.js` regel 22 en 37
- **JSON** — `src/js/api.js` regel 38 (response.json()), `src/js/storage.js` regel 5 (JSON.parse/stringify)

### Opslag & validatie
- **Formuliervalidatie** — `src/main.js` regel 192 (zoekterm moet min. 2 tekens zijn)
- **LocalStorage** — `src/js/storage.js` (get/set/remove); bewaard: favorieten, thema, weergave, API-cache

### Styling & layout
- **CSS Grid** — `src/css/style.css` (`.champions-grid`, `grid-template-columns`)
- **Flexbox** — `src/css/style.css` (`.header`, `.filter-controls`, `.card__body`)
- **Verwijderknoppen/iconen** — fav-knoppen in kaarten, tabel en modal; verwijderknop in favorietenpaneel

### Tooling
- **Vite** — `vite.config.js`, `package.json` (scripts: dev/build/preview)
- **Folderstructuur** — aparte html, css en js-bestanden onder `src/`

---

## Gebruikersvoorkeuren (LocalStorage)

| Sleutel | Wat wordt opgeslagen |
|---------|----------------------|
| `lol_theme` | dark of light |
| `lol_view` | cards of table |
| `lol_favorites` | array van favoriete champions |
| `lol_cache_*` | API-responses (24 uur geldig) |

---

## Screenshots

<img width="1898" height="915" alt="details" src="https://github.com/user-attachments/assets/d81336b0-baae-4f32-b2e0-ba9e04c8c608" />
<img width="1919" height="922" alt="zoekbalk" src="https://github.com/user-attachments/assets/1d1bf669-8ee1-4121-8cc9-1eabe3c6a14a" />
<img width="1904" height="922" alt="wit" src="https://github.com/user-attachments/assets/25a60297-02e9-4db2-af7b-56be95c1cc4c" />
<img width="1892" height="908" alt="pagina" src="https://github.com/user-attachments/assets/fec19f8a-22b1-4c0f-8a5b-a5feb9966591" />
<img width="1898" height="915" alt="details" src="https://github.com/user-attachments/assets/614a3021-696d-4a15-8c69-6788a328fd5b" />
<img width="1919" height="921" alt="favortieten" src="https://github.com/user-attachments/assets/0ae963b7-ec47-487b-a2f0-4084b401433b" />


---

## Bronnen

- Riot Data Dragon API: https://ddragon.leagueoflegends.com/api/versions.json
- MDN IntersectionObserver: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
- MDN Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- MDN LocalStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- Vite docs: https://vitejs.dev/
- Claude (Anthropic): hulp bij structuur van modules, uitleg IntersectionObserver, debugging LocalStorage cache, feedback op README
- ChatGPT (OpenAI): uitleg over async/await flow, CSS animaties






## AI-chatlog Screenshots
 
<img width="795" height="940" alt="iachatlog 3" src="https://github.com/user-attachments/assets/c8417268-c45d-4189-8ae8-7ba2a2d13435" />
<img width="601" height="908" alt="chatlog 4" src="https://github.com/user-attachments/assets/471b4f5f-04da-4641-97a7-31c792909775" />
<img width="1452" height="887" alt="iachatlog 1" src="https://github.com/user-attachments/assets/729c20f7-6ec3-416f-9e43-66199581421c" />
<img width="1364" height="919" alt="iachatlog 2" src="https://github.com/user-attachments/assets/c22d112a-f31a-471b-99bc-14b9117ef392" />
