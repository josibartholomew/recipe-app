const form = document.getElementById('recipe-form');
const recipeList = document.getElementById('recipe-list');
let editingIndex = null;

// ----------------------
// RECIPE MANAGER
// ----------------------

function loadRecipes() {
  const recipes = JSON.parse(localStorage.getItem('recipes')) || [];
  if (!recipeList) return;

  recipeList.innerHTML = '';

  recipes.forEach((recipe, index) => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
      <h3>${recipe.name}</h3>
      <strong>Tags:</strong> ${recipe.tags?.join(', ') || 'None'}<br/>
      <strong>Ingredients:</strong>
      <ul>${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
      <strong>Steps:</strong>
      <p>${recipe.steps}</p>
      <button onclick="editRecipe(${index})">✏️ Edit</button>
      <button onclick="deleteRecipe(${index})">🗑️ Delete</button>
    `;
    recipeList.appendChild(card);
  });
}

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('recipe-name').value.trim();
    const ingredients = document.getElementById('recipe-ingredients').value.trim().split('\n');
    const steps = document.getElementById('recipe-steps').value.trim();
    const tags = document.getElementById('recipe-tags').value
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag !== '');

    if (!name || !ingredients.length || !steps) return;

    const newRecipe = { name, ingredients, steps, tags };
    const saved = JSON.parse(localStorage.getItem('recipes')) || [];

    if (editingIndex !== null) {
      saved[editingIndex] = newRecipe;
      editingIndex = null;
    } else {
      saved.push(newRecipe);
    }

    localStorage.setItem('recipes', JSON.stringify(saved));
    form.reset();
    loadRecipes();
  });
}

function deleteRecipe(index) {
  const saved = JSON.parse(localStorage.getItem('recipes')) || [];
  saved.splice(index, 1);
  localStorage.setItem('recipes', JSON.stringify(saved));
  loadRecipes();
}

function editRecipe(index) {
  const saved = JSON.parse(localStorage.getItem('recipes')) || [];
  const recipe = saved[index];

  document.getElementById('recipe-name').value = recipe.name;
  document.getElementById('recipe-ingredients').value = recipe.ingredients.join('\n');
  document.getElementById('recipe-steps').value = recipe.steps;
  document.getElementById('recipe-tags').value = recipe.tags?.join(', ') || '';
  editingIndex = index;
}

loadRecipes();


// ----------------------
// MEAL PLANNER PAGE
// ----------------------

function renderMealPlanner() {
  const plannerContainer = document.getElementById('meal-planner');
  if (!plannerContainer) return;

  const recipes = JSON.parse(localStorage.getItem('recipes')) || [];
  const mealPlan = JSON.parse(localStorage.getItem('mealPlan')) || {};
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  plannerContainer.innerHTML = '';

  days.forEach(day => {
    const container = document.createElement('div');
    container.classList.add('planner-day');

    const label = document.createElement('label');
    label.textContent = day;
    label.setAttribute('for', `search-${day}`);

    const input = document.createElement('input');
    input.setAttribute('type', 'search');
    input.setAttribute('id', `search-${day}`);
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('placeholder', `Search recipes for ${day}...`);
    input.value = mealPlan[day] || '';

    // Create a container for autocomplete suggestions
    const suggestions = document.createElement('div');
    suggestions.classList.add('suggestions');

    // Show suggestions filtered by input value
    input.addEventListener('input', () => {
      const searchTerm = input.value.trim().toLowerCase();
      suggestions.innerHTML = '';
      if (!searchTerm) return;

      const filtered = recipes.filter(r => {
        const nameMatch = r.name.toLowerCase().includes(searchTerm);
        const tagsMatch = r.tags && r.tags.some(t => t.includes(searchTerm));
        return nameMatch || tagsMatch;
      });

      filtered.forEach(recipe => {
        const div = document.createElement('div');
        div.classList.add('suggestion-item');
        div.textContent = recipe.name;
        div.addEventListener('click', () => {
          input.value = recipe.name;
          suggestions.innerHTML = '';
          saveMealPlan(day, recipe.name);
        });
        suggestions.appendChild(div);
      });
    });

    // Save on blur if input value matches a recipe name
    input.addEventListener('blur', () => {
      setTimeout(() => {
        const val = input.value.trim();
        if (recipes.some(r => r.name === val)) {
          saveMealPlan(day, val);
        } else {
          // Optionally clear if no exact match
          // input.value = mealPlan[day] || '';
          // Or leave as is
        }
        suggestions.innerHTML = '';
      }, 150);
    });

    container.appendChild(label);
    container.appendChild(input);
    container.appendChild(suggestions);
    plannerContainer.appendChild(container);
  });
}

function saveMealPlan(day, recipeName) {
  const plan = JSON.parse(localStorage.getItem('mealPlan')) || {};
  plan[day] = recipeName;
  localStorage.setItem('mealPlan', JSON.stringify(plan));
}

// Call renderMealPlanner on page load
renderMealPlanner();


// ----------------------
// GROCERY LIST PAGE
// ----------------------

function generateGroceryList() {
  const groceryContainer = document.getElementById('grocery-list');
  if (!groceryContainer) return;

  const recipes = JSON.parse(localStorage.getItem('recipes')) || [];
  const mealPlan = JSON.parse(localStorage.getItem('mealPlan')) || {};
  const selectedRecipeNames = Object.values(mealPlan).filter(Boolean);
  const groceryItems = [];

  selectedRecipeNames.forEach(name => {
    const recipe = recipes.find(r => r.name === name);
    if (recipe && recipe.ingredients) {
      groceryItems.push(...recipe.ingredients);
    }
  });

  groceryItems.sort();

  groceryContainer.innerHTML = `
    <h2>Ingredients for Planned Meals</h2>
    <ul>${groceryItems.map(i => `<li>${i}</li>`).join('')}</ul>
  `;
}

generateGroceryList();
