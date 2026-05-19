// champions filteren op naam, rol en moeilijkheid
export const applyFilters = (champions, { search, role, difficulty }) => {
  return champions.filter((c) => {
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());

    // tags is een array dus we gebruiken includes()
    const matchesRole = !role || c.tags.includes(role);

    let matchesDifficulty = true;
    if (difficulty === 'easy')   matchesDifficulty = c.info.difficulty <= 3;
    if (difficulty === 'medium') matchesDifficulty = c.info.difficulty >= 4 && c.info.difficulty <= 7;
    if (difficulty === 'hard')   matchesDifficulty = c.info.difficulty >= 8;

    return matchesSearch && matchesRole && matchesDifficulty;
  });
};

// sorteren op naam of stats (geeft nieuwe array terug)
export const sortChampions = (champions, sortBy = 'name', sortOrder = 'asc') => {
  const dir = sortOrder === 'asc' ? 1 : -1;

  return [...champions].sort((a, b) => {
    switch (sortBy) {
      case 'name':       return dir * a.name.localeCompare(b.name);
      case 'hp':         return dir * (a.stats.hp - b.stats.hp);
      case 'attack':     return dir * (a.info.attack - b.info.attack);
      case 'defense':    return dir * (a.info.defense - b.info.defense);
      case 'magic':      return dir * (a.info.magic - b.info.magic);
      case 'difficulty': return dir * (a.info.difficulty - b.info.difficulty);
      default:           return dir * a.name.localeCompare(b.name);
    }
  });
};
