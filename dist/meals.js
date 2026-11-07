// Meal ideas are suggestions for convenience, not nutrition or medical advice.
// Zodiac and MBTI add a playful ordering nudge; food preferences control eligibility.
export const MEALS = [
  {
    id: 'berry-yogurt-bowl', type: 'breakfast', name: 'Berry yogurt bowl',
    description: 'Creamy yogurt, berries, and a little crunch in five minutes.',
    cuisine: 'mediterranean', diet: 'vegetarian',
    ingredients: ['Greek yogurt', 'berries', 'granola', 'honey'],
    tags: ['fresh', 'quick', 'balanced'],
  },
  {
    id: 'miso-egg-rice', type: 'breakfast', name: 'Miso egg rice bowl',
    description: 'Warm rice with a soft egg, spinach, and a savory miso drizzle.',
    cuisine: 'asian', diet: 'vegetarian',
    ingredients: ['rice', 'egg', 'spinach', 'miso', 'soy sauce'],
    tags: ['cozy', 'savory', 'balanced'],
  },
  {
    id: 'overnight-oats', type: 'breakfast', name: 'Cinnamon overnight oats',
    description: 'Prep oats tonight; wake up to a comforting breakfast.',
    cuisine: 'american', diet: 'vegan',
    ingredients: ['oats', 'oat milk', 'banana', 'cinnamon', 'chia seeds'],
    tags: ['cozy', 'quick', 'balanced'],
  },
  {
    id: 'avocado-tomato-toast', type: 'breakfast', name: 'Avocado tomato toast',
    description: 'A bright, simple toast with lemon and flaky salt.',
    cuisine: 'american', diet: 'vegan',
    ingredients: ['bread', 'avocado', 'tomato', 'lemon'],
    tags: ['fresh', 'quick', 'bold'],
  },
  {
    id: 'tofu-breakfast-tacos', type: 'breakfast', name: 'Tofu breakfast tacos',
    description: 'Spiced tofu, salsa, and crisp lettuce tucked into warm tortillas.',
    cuisine: 'mexican', diet: 'vegan',
    ingredients: ['tofu', 'tortillas', 'salsa', 'lettuce', 'cumin'],
    tags: ['bold', 'savory', 'flexible'],
  },
  {
    id: 'salmon-bagel', type: 'breakfast', name: 'Salmon cucumber bagel',
    description: 'A satisfying bagel with cucumber and a lemony spread.',
    cuisine: 'american', diet: 'any',
    ingredients: ['bagel', 'smoked salmon', 'cream cheese', 'cucumber', 'lemon'],
    tags: ['fresh', 'savory', 'quick'],
  },
  {
    id: 'hummus-breakfast-pita', type: 'breakfast', name: 'Hummus breakfast pita',
    description: 'Warm pita with hummus, cucumber, and juicy tomatoes.',
    cuisine: 'mediterranean', diet: 'vegan',
    ingredients: ['pita', 'hummus', 'cucumber', 'tomato', 'olive oil'],
    tags: ['fresh', 'quick', 'flexible'],
  },
  {
    id: 'ginger-congee', type: 'breakfast', name: 'Ginger mushroom congee',
    description: 'Soft rice porridge with ginger and mushrooms for a gentle start.',
    cuisine: 'asian', diet: 'vegan',
    ingredients: ['rice', 'ginger', 'mushrooms', 'scallions', 'soy sauce'],
    tags: ['cozy', 'savory', 'balanced'],
  },

  {
    id: 'lemon-chickpea-bowl', type: 'lunch', name: 'Lemon chickpea bowl',
    description: 'Chickpeas, crunchy vegetables, and lemon over fluffy grains.',
    cuisine: 'mediterranean', diet: 'vegan',
    ingredients: ['chickpeas', 'couscous', 'cucumber', 'tomato', 'lemon'],
    tags: ['fresh', 'balanced', 'flexible'],
  },
  {
    id: 'sesame-tofu-noodles', type: 'lunch', name: 'Sesame tofu noodles',
    description: 'Quick noodles tossed with tofu, greens, and sesame sauce.',
    cuisine: 'asian', diet: 'vegan',
    ingredients: ['tofu', 'noodles', 'bok choy', 'sesame', 'soy sauce'],
    tags: ['bold', 'savory', 'quick'],
  },
  {
    id: 'chicken-avocado-wrap', type: 'lunch', name: 'Chicken avocado wrap',
    description: 'A portable lunch with crisp greens and creamy avocado.',
    cuisine: 'american', diet: 'any',
    ingredients: ['chicken', 'tortilla', 'avocado', 'lettuce', 'tomato'],
    tags: ['fresh', 'quick', 'balanced'],
  },
  {
    id: 'black-bean-quesadilla', type: 'lunch', name: 'Black bean quesadilla',
    description: 'Melty cheese and black beans with a spoonful of salsa.',
    cuisine: 'mexican', diet: 'vegetarian',
    ingredients: ['black beans', 'cheese', 'tortilla', 'salsa', 'bell pepper'],
    tags: ['cozy', 'bold', 'quick'],
  },
  {
    id: 'tuna-olive-salad', type: 'lunch', name: 'Tuna olive salad',
    description: 'A crisp, lemony bowl with tuna, greens, and olives.',
    cuisine: 'mediterranean', diet: 'any',
    ingredients: ['tuna', 'lettuce', 'olives', 'tomato', 'lemon'],
    tags: ['fresh', 'savory', 'quick'],
  },
  {
    id: 'sweet-potato-tacos', type: 'lunch', name: 'Sweet potato tacos',
    description: 'Roasted sweet potato and black beans with a squeeze of lime.',
    cuisine: 'mexican', diet: 'vegan',
    ingredients: ['sweet potato', 'black beans', 'tortillas', 'lime', 'cabbage'],
    tags: ['bold', 'flexible', 'balanced'],
  },
  {
    id: 'ginger-chicken-soup', type: 'lunch', name: 'Ginger chicken soup',
    description: 'A light, warming soup with chicken, rice, and greens.',
    cuisine: 'asian', diet: 'any',
    ingredients: ['chicken', 'rice', 'ginger', 'spinach', 'scallions'],
    tags: ['cozy', 'balanced', 'savory'],
  },
  {
    id: 'quinoa-avocado-salad', type: 'lunch', name: 'Quinoa avocado salad',
    description: 'A colorful bowl of quinoa, avocado, and crunchy vegetables.',
    cuisine: 'american', diet: 'vegan',
    ingredients: ['quinoa', 'avocado', 'cucumber', 'corn', 'lemon'],
    tags: ['fresh', 'balanced', 'flexible'],
  },

  {
    id: 'tomato-basil-pasta', type: 'dinner', name: 'Tomato basil pasta',
    description: 'A comforting classic with a bright tomato sauce and basil.',
    cuisine: 'mediterranean', diet: 'vegan',
    ingredients: ['pasta', 'tomato', 'basil', 'garlic', 'olive oil'],
    tags: ['cozy', 'balanced', 'flexible'],
  },
  {
    id: 'ginger-tofu-stirfry', type: 'dinner', name: 'Ginger tofu stir-fry',
    description: 'Crisp vegetables and tofu over rice with ginger sauce.',
    cuisine: 'asian', diet: 'vegan',
    ingredients: ['tofu', 'rice', 'ginger', 'broccoli', 'soy sauce'],
    tags: ['bold', 'savory', 'balanced'],
  },
  {
    id: 'salmon-rice-plate', type: 'dinner', name: 'Salmon rice plate',
    description: 'Simple roasted salmon with rice and crisp cucumber.',
    cuisine: 'asian', diet: 'any',
    ingredients: ['salmon', 'rice', 'cucumber', 'scallions', 'soy sauce'],
    tags: ['fresh', 'savory', 'balanced'],
  },
  {
    id: 'sheet-pan-chicken', type: 'dinner', name: 'Sheet-pan chicken',
    description: 'Chicken and colorful vegetables roasted on one pan.',
    cuisine: 'american', diet: 'any',
    ingredients: ['chicken', 'potato', 'carrot', 'broccoli', 'lemon'],
    tags: ['cozy', 'balanced', 'quick'],
  },
  {
    id: 'bean-corn-chili', type: 'dinner', name: 'Bean and corn chili',
    description: 'A hearty, mildly spiced bowl that makes great leftovers.',
    cuisine: 'mexican', diet: 'vegan',
    ingredients: ['kidney beans', 'corn', 'tomato', 'bell pepper', 'chili powder'],
    tags: ['cozy', 'bold', 'flexible'],
  },
  {
    id: 'lentil-stuffed-peppers', type: 'dinner', name: 'Lentil stuffed peppers',
    description: 'Bell peppers filled with lentils, grains, and herbs.',
    cuisine: 'mediterranean', diet: 'vegan',
    ingredients: ['bell pepper', 'lentils', 'rice', 'parsley', 'tomato'],
    tags: ['balanced', 'savory', 'flexible'],
  },
  {
    id: 'turkey-taco-bowl', type: 'dinner', name: 'Turkey taco bowl',
    description: 'Warm taco-seasoned turkey over rice with salsa and lettuce.',
    cuisine: 'mexican', diet: 'any',
    ingredients: ['turkey', 'rice', 'salsa', 'lettuce', 'avocado'],
    tags: ['bold', 'savory', 'balanced'],
  },
  {
    id: 'lemon-herb-fish', type: 'dinner', name: 'Lemon herb fish',
    description: 'Roasted white fish with lemon, potatoes, and green beans.',
    cuisine: 'mediterranean', diet: 'any',
    ingredients: ['white fish', 'potato', 'green beans', 'lemon', 'parsley'],
    tags: ['fresh', 'balanced', 'savory'],
  },
];

const ZODIAC_TAG = {
  Aries: 'bold', Leo: 'bold', Sagittarius: 'bold',
  Taurus: 'cozy', Virgo: 'cozy', Capricorn: 'cozy',
  Gemini: 'fresh', Libra: 'fresh', Aquarius: 'fresh',
  Cancer: 'balanced', Scorpio: 'balanced', Pisces: 'balanced',
};

// Broad food words are convenience filters for this small idea list. Packaged
// ingredients and restaurant meals vary, so these are not allergy-safety checks.
const AVOID_CATEGORIES = {
  dairy: ['greek yogurt', 'cream cheese', 'cheese'],
  soy: ['tofu', 'miso', 'soy sauce'],
  nuts: ['granola'],
  peanuts: ['granola'],
  gluten: ['granola', 'oats', 'bread', 'bagel', 'pita', 'couscous', 'noodles',
    'pasta', 'tortilla', 'tortillas', 'soy sauce', 'miso'],
  wheat: ['granola', 'bread', 'bagel', 'pita', 'couscous', 'noodles', 'pasta',
    'tortilla', 'tortillas', 'soy sauce'],
  fish: ['smoked salmon', 'salmon', 'tuna', 'white fish'],
  seafood: ['smoked salmon', 'salmon', 'tuna', 'white fish'],
  eggs: ['egg'],
};

const CATEGORY_ALIASES = {
  milk: 'dairy', 'milk products': 'dairy', lactose: 'dairy',
  nut: 'nuts', 'tree nuts': 'nuts', peanut: 'peanuts',
  egg: 'eggs',
};

function categoryFor(value) {
  const term = value.replace(/^no\s+/, '').replace(/-free$/, '').trim();
  const key = CATEGORY_ALIASES[term] || term;
  return AVOID_CATEGORIES[key] || null;
}

function preferences(profile) {
  const rawDislikes = profile?.dislikedIngredients ?? profile?.dislikes ?? '';
  const dislikes = (Array.isArray(rawDislikes) ? rawDislikes : String(rawDislikes).split(/[,/]/))
    .map((item) => String(item).trim().toLowerCase())
    .filter(Boolean);
  return {
    diet: profile?.diet || 'any',
    cuisine: profile?.cuisine || 'any',
    dislikes,
    zodiac: String(profile?.zodiac || ''),
    zodiacTag: ZODIAC_TAG[profile?.zodiac] || null,
    mbti: String(profile?.mbti || '').toUpperCase(),
    mbtiTag: String(profile?.mbti || '').toUpperCase().endsWith('P') ? 'flexible' :
      String(profile?.mbti || '').toUpperCase().endsWith('J') ? 'balanced' : null,
  };
}

function isAllowed(meal, pref) {
  if (pref.diet === 'vegan' && meal.diet !== 'vegan') return false;
  if (pref.diet === 'vegetarian' && meal.diet === 'any') return false;
  return !pref.dislikes.some((dislike) => meal.ingredients.some((ingredient) => {
    const name = ingredient.toLowerCase();
    const category = categoryFor(dislike);
    if (category?.includes(name)) return true;
    return name.includes(dislike) || dislike.includes(name);
  }));
}

function score(meal, pref) {
  return (pref.cuisine !== 'any' && pref.cuisine === meal.cuisine ? 4 : 0)
    + (pref.zodiacTag && meal.tags.includes(pref.zodiacTag) ? 1 : 0)
    + (pref.mbtiTag && meal.tags.includes(pref.mbtiTag) ? 0.5 : 0);
}

export function getMealCandidates(profile, mealType) {
  const pref = preferences(profile);
  return MEALS.filter((meal) => meal.type === mealType && isAllowed(meal, pref))
    .sort((a, b) => score(b, pref) - score(a, pref) || a.id.localeCompare(b.id));
}

function reasonFor(meal, pref) {
  const reasons = [];
  if (pref.cuisine !== 'any' && meal.cuisine === pref.cuisine) {
    reasons.push(`Matches your ${pref.cuisine} cuisine pick`);
  }
  if (pref.diet === 'vegan' || pref.diet === 'vegetarian') {
    reasons.push(`fits your ${pref.diet} preference`);
  }
  if (pref.zodiacTag && meal.tags.includes(pref.zodiacTag)) {
    reasons.push(`a playful nod to ${pref.zodiac}`);
  }
  if (pref.mbtiTag && meal.tags.includes(pref.mbtiTag)) {
    reasons.push(`a little ${pref.mbti} inspiration`);
  }
  if (!reasons.length) reasons.push('A simple idea for today');
  return reasons.join(' · ');
}

export function getMealRecommendations(profile, seed = 0) {
  const pref = preferences(profile);
  const offset = Number.isFinite(Number(seed)) ? Math.trunc(Number(seed)) : 0;
  const result = {};
  for (const type of ['breakfast', 'lunch', 'dinner']) {
    const candidates = getMealCandidates(profile, type);
    if (!candidates.length) {
      result[type] = null;
      continue;
    }
    // Stay with the chosen cuisine while matching ideas are available, then
    // rotate among the top few for variety.
    const matchingCuisine = pref.cuisine === 'any' ? [] :
      candidates.filter((candidate) => candidate.cuisine === pref.cuisine);
    const eligible = matchingCuisine.length ? matchingCuisine : candidates;
    const pool = eligible.slice(0, Math.min(3, eligible.length));
    const index = ((offset % pool.length) + pool.length) % pool.length;
    const meal = pool[index];
    result[type] = { ...meal, why: reasonFor(meal, pref) };
  }
  return result;
}
