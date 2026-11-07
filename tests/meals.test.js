import test from "node:test";
import assert from "node:assert/strict";
import { MEALS, getMealCandidates, getMealRecommendations } from "../dist/meals.js";

test("the dataset covers all three meals and diet styles", () => {
  for (const type of ["breakfast", "lunch", "dinner"]) {
    assert.ok(MEALS.some((meal) => meal.type === type && meal.diet === "vegan"));
    assert.ok(MEALS.some((meal) => meal.type === type && meal.diet === "any"));
  }
});

test("diet and avoided ingredients filter before personal ranking", () => {
  const options = getMealCandidates({ diet: "vegan", cuisine: "asian", dislikedIngredients: "tofu, mushrooms" }, "breakfast");
  assert.ok(options.length > 0);
  assert.ok(options.every((meal) => meal.diet === "vegan"));
  assert.ok(options.every((meal) => meal.ingredients.every((ingredient) => !/tofu|mushroom/i.test(ingredient))));
});

test("common avoided-food categories filter relevant ingredients", () => {
  const cases = [
    ["dairy", "breakfast", "berry-yogurt-bowl"],
    ["soy", "breakfast", "ginger-congee"],
    ["nuts", "breakfast", "berry-yogurt-bowl"],
    ["peanuts", "breakfast", "berry-yogurt-bowl"],
    ["gluten", "lunch", "sesame-tofu-noodles"],
    ["wheat", "lunch", "black-bean-quesadilla"],
    ["fish", "dinner", "salmon-rice-plate"],
    ["seafood", "lunch", "tuna-olive-salad"],
    ["eggs", "breakfast", "miso-egg-rice"],
  ];
  for (const [avoided, type, excludedId] of cases) {
    const candidates = getMealCandidates({ dislikedIngredients: avoided }, type);
    assert.ok(candidates.length > 0, `${avoided} still has ${type} ideas`);
    assert.ok(!candidates.some((meal) => meal.id === excludedId), `${avoided} excludes ${excludedId}`);
  }
  // An oat milk idea is still eligible when someone avoids dairy.
  assert.ok(getMealCandidates({ dislikedIngredients: "dairy" }, "breakfast")
    .some((meal) => meal.id === "overnight-oats"));
});

test("recommendations are stable for a seed and change on reroll", () => {
  const profile = { diet: "any", cuisine: "mediterranean", zodiac: "Leo", mbti: "ENFP" };
  const first = getMealRecommendations(profile, 11);
  assert.deepEqual(getMealRecommendations(profile, 11), first);
  const next = getMealRecommendations(profile, 12);
  assert.ok(["breakfast", "lunch", "dinner"].some((type) => first[type]?.id !== next[type]?.id));
  assert.ok(first.breakfast.why.includes("mediterranean"));
});

test("zodiac and MBTI can change the idea order after food filters", () => {
  const aries = getMealRecommendations({ zodiac: "Aries" }, 0);
  const taurus = getMealRecommendations({ zodiac: "Taurus" }, 0);
  assert.notEqual(aries.breakfast.id, taurus.breakfast.id);
  const planner = getMealCandidates({ mbti: "INTJ" }, "breakfast")[0];
  const explorer = getMealCandidates({ mbti: "ENFP" }, "breakfast")[0];
  assert.notEqual(planner.id, explorer.id);
});

test("an impossible preference returns no unsafe fallback meal", () => {
  const impossible = MEALS.filter((meal) => meal.type === "breakfast")
    .flatMap((meal) => meal.ingredients).join(", ");
  const result = getMealRecommendations({ dislikedIngredients: impossible }, 0);
  assert.equal(result.breakfast, null);
});
