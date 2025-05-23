const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const mealsContainer = document.getElementById("meals");
const resultHeading = document.getElementById("result-heading");
const errorContainer = document.getElementById("error-container");
const mealDetails = document.getElementById("meal-details");
const mealDetailsContent = document.querySelector(".meal-details-content");
const backBtn = document.getElementById("back-btn");

const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";
const SEARCH_URL = `${BASE_URL}search.php?s=`;
const LOOKUP_URL = `${BASE_URL}lookup.php?i=`;

searchBtn.addEventListener("click", searchMeals);
mealsContainer.addEventListener("click", handleMealClick);
backBtn.addEventListener("click", () => mealDetails.classList.add("hidden"));
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchMeals();
});

async function searchMeals() {
  const searchTerm = searchInput.value.trim();

  if (!searchTerm) {
    errorContainer.textContent = "Please enter a search term";
    errorContainer.classList.remove("hidden");
    resultHeading.textContent = "";
    mealsContainer.innerHTML = "";
    return;
  }

  try {
    resultHeading.textContent = `Searching for "${searchTerm}"...`;
    mealsContainer.innerHTML = "";
    errorContainer.classList.add("hidden");

    const response = await fetch(`${SEARCH_URL}${searchTerm}`);
    const data = await response.json();

    if (data.meals === null) {
      resultHeading.textContent = "";
      mealsContainer.innerHTML = "";
      errorContainer.textContent = `No recipes found for "${searchTerm}". Try another search term!`;
      errorContainer.classList.remove("hidden");
    } else {
      resultHeading.textContent = `Search results for "${searchTerm}":`;
      displayMeals(data.meals);
      searchInput.value = "";
    }
  } catch (error) {
    console.error(error);
    errorContainer.textContent = "Something went wrong. Please try again later.";
    errorContainer.classList.remove("hidden");
  }
}

function displayMeals(meals) {
  mealsContainer.innerHTML = "";

  meals.forEach((meal) => {
    mealsContainer.innerHTML += `
      <div
        class="meal cursor-pointer bg-white rounded-lg shadow-md overflow-hidden transform transition hover:-translate-y-1 hover:shadow-lg"
        data-meal-id="${meal.idMeal}"
      >
        <img
          src="${meal.strMealThumb}"
          alt="${meal.strMeal}"
          class="w-full h-44 object-cover"
        />
        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">${meal.strMeal}</h3>
          ${
            meal.strCategory
              ? `<div class="inline-block bg-orange-200 text-orange-800 text-xs px-3 py-1 rounded-full">${meal.strCategory}</div>`
              : ""
          }
        </div>
      </div>
    `;
  });
}

async function handleMealClick(e) {
  const mealEl = e.target.closest(".meal");
  if (!mealEl) return;

  const mealId = mealEl.getAttribute("data-meal-id");

  try {
    const response = await fetch(`${LOOKUP_URL}${mealId}`);
    const data = await response.json();

    if (data.meals && data.meals[0]) {
      const meal = data.meals[0];

      const ingredients = [];

      for (let i = 1; i <= 20; i++) {
        if (
          meal[`strIngredient${i}`] &&
          meal[`strIngredient${i}`].trim() !== ""
        ) {
          ingredients.push({
            ingredient: meal[`strIngredient${i}`],
            measure: meal[`strMeasure${i}`],
          });
        }
      }

      mealDetailsContent.innerHTML = `
        <img
          src="${meal.strMealThumb}"
          alt="Image of ${meal.strMeal}"
          class="w-full rounded-lg mb-6"
        />
        <h2 class="text-3xl font-extrabold text-orange-500 mb-2 text-center">${meal.strMeal}</h2>
        <div class="text-center mb-6">
          <span class="bg-orange-200 text-orange-800 text-sm px-4 py-1 rounded-full">${meal.strCategory || "Uncategorized"}</span>
        </div>
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-2">Instructions</h3>
          <p class="leading-relaxed whitespace-pre-line">${meal.strInstructions}</p>
        </div>
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-4">Ingredients</h3>
          <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none">
            ${ingredients
              .map(
                (item) =>
                  `<li class="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded shadow-sm"><i class="fas fa-check-circle text-green-500"></i>${item.measure} ${item.ingredient}</li>`
              )
              .join("")}
          </ul>
        </div>
        ${
          meal.strYoutube
            ? `<a href="${meal.strYoutube}" target="_blank" class="inline-block bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"><i class="fab fa-youtube mr-2"></i>Watch Video</a>`
            : ""
        }
      `;

      mealDetails.classList.remove("hidden");
      mealDetails.scrollIntoView({ behavior: "smooth" });
    }
  } catch (error) {
    console.error(error);
    errorContainer.textContent =
      "Could not load recipe details. Please try again later.";
    errorContainer.classList.remove("hidden");
  }
}
