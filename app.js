document.addEventListener("DOMContentLoaded", () => {
  const DAFTAR_BAHAN_BAKU_DEFAULT = [
    "Aji Plus",
    "Air",
    "Baking Powder",
    "Beras Jagung",
    "BS Astor Coklat",
    "Citric Acid",
    "Cocoa N6",
    "Cocoa Powder 301",
    "Coconut",
    "Dextrose",
    "Flavour Chocolate 70Fm093883",
    "Flavour Coklat Baru",
    "Garam",
    "Gula",
    "Jagung",
    "Lecithin",
    "Maltodextrine",
    "Margarin Menara Classic",
    "Milk Bubuk",
    "Milk Flavour",
    "Minyak",
    "Pandan Flavour",
    "Pewarna",
    "Pewarna Coklat",
    "Pewarna Pandan",
    "Pewarna Sunset Yellow",
    "Plastik Dorong",
    "Sari Manis",
    "Sofros",
    "Strawberry Flav",
    "Susu Baru",
    "Tepung",
    "Tepung Beras Menir",
    "Tepung Terigu Montana",
    "Tepung Wilis",
    "Vanillin",
    "Ziproti",
  ].sort();

  // Elements
  const loginOverlay = document.getElementById("login-overlay");
  const appContainer = document.getElementById("app");
  const passwordInput = document.getElementById("password-input");
  const loginButton = document.getElementById("login-button");
  const mainNavButtons = document.querySelectorAll(".main-nav-button");
  const contentSections = document.querySelectorAll(".content-section");
  const newIngredientInput = document.getElementById("new-ingredient-input");
  const addNewIngredientBtn = document.getElementById("add-new-ingredient-btn");
  const masterIngredientListUI = document.getElementById("master-ingredient-list-ui");
  const searchIngredientInput = document.getElementById("search-ingredient-input");
  const searchRecipeInput = document.getElementById("search-recipe-input");
  const saveAsCopyBtn = document.getElementById("save-as-copy");
  const ingredientsList = document.getElementById("ingredients-list");
  const addIngredientBtn = document.getElementById("add-ingredient");
  const calculateTotalBtn = document.getElementById("calculate-total");
  const totalWeightDisplay = document.getElementById("total-weight-display");
  const generateScaledBtn = document.getElementById("generate-scaled");
  const scaledRecipeDisplay = document.getElementById("scaled-recipe-display");
  const scaledTotalWeightDisplay = document.getElementById("scaled-total-weight-display");
  const saveRecipeBtn = document.getElementById("save-recipe");
  const savedRecipesList = document.getElementById("saved-recipes-list");
  const recipeTitleInput = document.getElementById("recipe-title");
  const totalUnitSelector = document.getElementById("total-unit-selector");
  const resultUnitSelector = document.getElementById("result-unit-selector");
  const cancelEditBtn = document.getElementById("cancel-edit");
  const formTitle = document.getElementById("form-title");
  const tabUtama = document.getElementById("tab-utama");
  const tabHitungan = document.getElementById("tab-hitungan");
  const bahanDatalist = document.getElementById("bahan-list");

  // State
  let masterIngredientList = [];
  let currentScaledRecipe = null;
  let currentTotalInGrams = 0;
  let editingIndex = null;
  let activeTab = "utama";

  // Login
  function handleLogin() {
    if (passwordInput.value === "1173") {
      sessionStorage.setItem("isLoggedIn", "true");
      loginOverlay.classList.add("hidden");
      appContainer.classList.remove("hidden");
    } else {
      alert("Password salah!");
    }
  }

  function checkLoginStatus() {
    if (sessionStorage.getItem("isLoggedIn") === "true") {
      loginOverlay.classList.add("hidden");
      appContainer.classList.remove("hidden");
    } else {
      loginOverlay.classList.remove("hidden");
      appContainer.classList.add("hidden");
    }
  }

  // Navigation
  mainNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTabId = button.dataset.tab;
      mainNavButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      contentSections.forEach((section) => {
        if (section.id === `${targetTabId}-section`) {
          section.classList.add("active");
        } else {
          section.classList.remove("active");
        }
      });
    });
  });

  // Ingredient Management
  function loadIngredients() {
    const savedIngredients = JSON.parse(localStorage.getItem("myIngredients"));
    if (savedIngredients && savedIngredients.length > 0) {
      masterIngredientList = savedIngredients;
    } else {
      masterIngredientList = DAFTAR_BAHAN_BAKU_DEFAULT;
      localStorage.setItem("myIngredients", JSON.stringify(masterIngredientList));
    }
    populateIngredientDatalist();
    renderMasterIngredientList();
  }

  function populateIngredientDatalist() {
    bahanDatalist.innerHTML = "";
    masterIngredientList.forEach((bahan) => {
      const option = document.createElement("option");
      option.value = bahan;
      bahanDatalist.appendChild(option);
    });
  }

  function renderMasterIngredientList() {
    masterIngredientListUI.innerHTML = "";
    const searchQuery = searchIngredientInput.value.toLowerCase();
    const filteredList = masterIngredientList.filter((bahan) => bahan.toLowerCase().includes(searchQuery));

    if (filteredList.length === 0) {
      masterIngredientListUI.innerHTML = "<li>Bahan tidak ditemukan.</li>";
      return;
    }

    filteredList.forEach((bahan) => {
      const indexInMaster = masterIngredientList.indexOf(bahan); // Get original index for deletion
      const li = document.createElement("li");
      li.innerHTML = `
            <span>${bahan}</span>
            <button class="delete-ingredient-btn btn-danger" data-index="${indexInMaster}">Hapus</button>
          `;
      masterIngredientListUI.appendChild(li);
    });
  }

  function addNewIngredient() {
    const newIngredient = newIngredientInput.value.trim();
    if (newIngredient === "") return alert("Nama bahan tidak boleh kosong.");
    if (masterIngredientList.some((bahan) => bahan.toLowerCase() === newIngredient.toLowerCase())) return alert("Bahan baku sudah ada dalam daftar.");

    masterIngredientList.push(newIngredient);
    masterIngredientList.sort();
    localStorage.setItem("myIngredients", JSON.stringify(masterIngredientList));
    populateIngredientDatalist();
    renderMasterIngredientList();
    newIngredientInput.value = "";
    alert(`'${newIngredient}' berhasil ditambahkan!`);
  }

  function deleteIngredient(index) {
    const ingredientToDelete = masterIngredientList[index];
    if (confirm(`Apakah Anda yakin ingin menghapus "${ingredientToDelete}"? Bahan ini akan dihapus permanen.`)) {
      masterIngredientList.splice(index, 1);
      localStorage.setItem("myIngredients", JSON.stringify(masterIngredientList));
      loadIngredients(); // Reload all lists
    }
  }

  function updateIngredientNumbers() {
    const rows = ingredientsList.querySelectorAll(".ingredient-row");
    rows.forEach((row, index) => {
      const numberEl = row.querySelector(".ingredient-number");
      if (numberEl) {
        numberEl.textContent = `${index + 1}.`;
      }
    });
  }

  // Recipe Functions
  function initializeDefaultRecipe() {
    if (!localStorage.getItem("myRecipes")) {
      localStorage.setItem("myRecipes", JSON.stringify([]));
    }
  }

  function convertWeight(grams, unit) {
    if (unit === "kg") return { value: grams / 1000, label: "kg" };
    if (unit === "oz") return { value: grams / 28.35, label: "ons" };
    return { value: grams, label: "gram" };
  }

  function createIngredientRow(ingredientInGrams = { name: "", quantity: "" }) {
    const row = document.createElement("div");
    row.className = "ingredient-row";

    const numberSpan = document.createElement("span");
    numberSpan.className = "ingredient-number";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.setAttribute("list", "bahan-list");
    nameInput.placeholder = "Nama bahan...";
    nameInput.className = "ingredient-name";
    nameInput.value = ingredientInGrams.name;

    const quantityInput = document.createElement("input");
    quantityInput.type = "text";
    quantityInput.inputMode = "decimal";
    quantityInput.placeholder = "Qty (kg)";
    quantityInput.className = "quantity-input";
    if (ingredientInGrams.quantity !== "") {
      const quantityInKg = parseFloat(ingredientInGrams.quantity) / 1000;
      quantityInput.value = quantityInKg.toFixed(3);
    } else {
      quantityInput.value = "";
    }
    quantityInput.oninput = () => {
      quantityInput.value = quantityInput.value.replace(/,/, ".");
    };

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "×";
    removeBtn.onclick = () => {
      row.remove();
      updateIngredientNumbers();
    };

    row.appendChild(numberSpan);
    row.appendChild(nameInput);
    row.appendChild(quantityInput);
    row.appendChild(removeBtn);
    ingredientsList.appendChild(row);
  }

  function calculateTotalWeight() {
    currentTotalInGrams = 0;
    ingredientsList.querySelectorAll(".ingredient-row").forEach((row) => {
      const quantityInKg = parseFloat(row.querySelector(".quantity-input").value) || 0;
      currentTotalInGrams += quantityInKg * 1000;
    });
    displayTotalWeight();
  }

  function displayTotalWeight() {
    const selectedUnit = totalUnitSelector.value;
    const converted = convertWeight(currentTotalInGrams, selectedUnit);
    totalWeightDisplay.textContent = `Total Berat Awal: ${converted.value.toFixed(3)} ${converted.label}`;
  }

  function generateScaledRecipe() {
    calculateTotalWeight();
    const operation = document.getElementById("scale-operation").value;
    const factor = parseFloat(document.getElementById("scale-factor").value) || 1;
    if (factor <= 0) return alert("Angka faktor harus lebih besar dari 0.");
    currentScaledRecipe = {
      title: recipeTitleInput.value || "Resep Tanpa Judul",
      ingredients: [],
      isMainRecipe: false,
    };
    currentScaledRecipe.origin = {
      parentTitle: recipeTitleInput.value,
      operation: operation === "multiply" ? "Dikali" : "Dibagi",
      factor: factor,
    };
    document.getElementById("type-calculated").checked = true;
    scaledRecipeDisplay.innerHTML = "";
    const table = document.createElement("table");
    table.className = "recipe-table";
    table.innerHTML = "<thead><tr><th>Bahan Baku</th><th>QTY</th></tr></thead>";
    const tbody = document.createElement("tbody");
    let scaledTotalInGrams = 0;
    ingredientsList.querySelectorAll(".ingredient-row").forEach((row) => {
      const name = row.querySelector(".ingredient-name").value;
      const originalQuantityInKg = parseFloat(row.querySelector(".quantity-input").value) || 0;
      const originalQuantityInGrams = originalQuantityInKg * 1000;
      let scaledQuantityInGrams = operation === "multiply" ? originalQuantityInGrams * factor : originalQuantityInGrams / factor;
      scaledTotalInGrams += scaledQuantityInGrams;
      if (name) currentScaledRecipe.ingredients.push({ name: name, quantity: scaledQuantityInGrams });
      const displayUnit = resultUnitSelector.value;
      const converted = convertWeight(scaledQuantityInGrams, displayUnit);
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${name}</td><td>${converted.value.toFixed(3)} ${converted.label}</td>`;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    scaledRecipeDisplay.appendChild(table);
    currentScaledRecipe.totalWeight = scaledTotalInGrams;
    const displayUnit = resultUnitSelector.value;
    const convertedTotal = convertWeight(scaledTotalInGrams, displayUnit);
    scaledTotalWeightDisplay.textContent = `Total Berat Akhir: ${convertedTotal.value.toFixed(3)} ${convertedTotal.label}`;
  }

  function saveRecipe(asCopy = false) {
    if (!recipeTitleInput.value.trim()) return alert("Judul resep tidak boleh kosong!");
    if (!currentScaledRecipe && ingredientsList.children.length > 0) calculateTotalWeight();
    const isCalculatedFromScaling = !!currentScaledRecipe;
    const currentRecipeData = {
      title: recipeTitleInput.value.trim(),
      totalWeight: isCalculatedFromScaling ? currentScaledRecipe.totalWeight : currentTotalInGrams,
      ingredients: isCalculatedFromScaling ? currentScaledRecipe.ingredients : [],
      isMainRecipe: document.getElementById("type-main").checked,
      lastModified: new Date().toISOString(),
      origin: isCalculatedFromScaling ? currentScaledRecipe.origin : null,
    };
    if (!isCalculatedFromScaling) {
      ingredientsList.querySelectorAll(".ingredient-row").forEach((row) => {
        const name = row.querySelector(".ingredient-name").value;
        const quantityInKg = parseFloat(row.querySelector(".quantity-input").value) || 0;
        if (name) currentRecipeData.ingredients.push({ name, quantity: quantityInKg * 1000 });
      });
    }
    if (asCopy) currentRecipeData.title += " (Copy)";
    let savedRecipes = JSON.parse(localStorage.getItem("myRecipes")) || [];
    if (editingIndex !== null && !asCopy) {
      savedRecipes.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
      const filteredRecipes = savedRecipes.filter((r) => (activeTab === "utama" ? r.isMainRecipe : !r.isMainRecipe));
      const originalRecipe = filteredRecipes[editingIndex];
      const indexInFullArray = savedRecipes.findIndex((r) => r.lastModified === originalRecipe.lastModified);
      if (indexInFullArray > -1) savedRecipes[indexInFullArray] = currentRecipeData;
      alert(`Resep "${currentRecipeData.title}" berhasil diperbarui!`);
    } else {
      savedRecipes.push(currentRecipeData);
      alert(`Resep "${currentRecipeData.title}" berhasil disimpan!`);
    }
    localStorage.setItem("myRecipes", JSON.stringify(savedRecipes));
    loadSavedRecipes();
    cancelEdit();
    mainNavButtons[0].click();
  }

  function loadSavedRecipes() {
    let savedRecipes = JSON.parse(localStorage.getItem("myRecipes")) || [];
    savedRecipes.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    const searchQuery = searchRecipeInput.value.toLowerCase();
    const filteredRecipes = savedRecipes.filter((recipe) => {
      const isInTab = activeTab === "utama" ? recipe.isMainRecipe : !recipe.isMainRecipe;
      const matchesSearch = recipe.title.toLowerCase().includes(searchQuery);
      return isInTab && matchesSearch;
    });
    savedRecipesList.innerHTML = "";
    if (filteredRecipes.length === 0) {
      savedRecipesList.innerHTML = `<p>Tidak ada resep yang cocok.</p>`;
      return;
    }
    filteredRecipes.forEach((recipe, index) => {
      const recipeEl = document.createElement("div");
      recipeEl.className = "saved-recipe-item";
      if (recipe.isMainRecipe) recipeEl.classList.add("main-recipe");
      const editDate = new Date(recipe.lastModified).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      let originHTML = "";
      if (!recipe.isMainRecipe && recipe.origin) {
        originHTML = `<div class="origin-info">Turunan dari resep: <strong>${recipe.origin.parentTitle}</strong> (${recipe.origin.operation} ${recipe.origin.factor})</div>`;
      }
      let ingredientsTable = `<table class="recipe-table"><thead><tr><th>Bahan Baku</th><th>QTY (kg)</th></tr></thead><tbody>`;
      recipe.ingredients.forEach((ing) => {
        const quantityInKg = ing.quantity / 1000;
        ingredientsTable += `<tr><td>${ing.name}</td><td>${quantityInKg.toFixed(3)}</td></tr>`;
      });
      ingredientsTable += `</tbody></table>`;
      const totalInKg = recipe.totalWeight / 1000;
      recipeEl.innerHTML = `
        <div class="action-buttons">
          <button class="edit-btn btn-warning" data-index="${index}">✏️ Edit</button>
          <button class="duplicate-btn btn-purple" data-index="${index}">📋 Copy</button>
          <button class="delete-btn btn-danger" data-index="${index}">🗑️ Hapus</button>
        </div>
        <h4>${recipe.title}</h4>
        <p class="edit-date">Diedit pada: ${editDate}</p>
        ${originHTML}
        <p><strong>Total Berat: ${recipe.totalWeight.toFixed(3)} gram (${totalInKg.toFixed(3)} kg)</strong></p>
        ${ingredientsTable}
      `;
      savedRecipesList.appendChild(recipeEl);
    });
  }

  function deleteRecipe(index) {
    if (!confirm("Apakah Anda yakin ingin menghapus resep ini?")) return;
    let savedRecipes = JSON.parse(localStorage.getItem("myRecipes")) || [];
    savedRecipes.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    const filteredRecipes = savedRecipes.filter((r) => (activeTab === "utama" ? r.isMainRecipe : !r.isMainRecipe));
    const recipeToDelete = filteredRecipes[index];
    const indexInFullArray = savedRecipes.findIndex((r) => r.lastModified === recipeToDelete.lastModified);
    if (indexInFullArray > -1) savedRecipes.splice(indexInFullArray, 1);
    localStorage.setItem("myRecipes", JSON.stringify(savedRecipes));
    loadSavedRecipes();
  }

  function editRecipe(index) {
    let savedRecipes = JSON.parse(localStorage.getItem("myRecipes")) || [];
    savedRecipes.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    const filteredRecipes = savedRecipes.filter((r) => (activeTab === "utama" ? r.isMainRecipe : !r.isMainRecipe));
    const recipeToEdit = filteredRecipes[index];
    if (!recipeToEdit) return;
    editingIndex = index;
    formTitle.textContent = "Mode Edit Resep";
    recipeTitleInput.value = recipeToEdit.title;
    document.getElementById(recipeToEdit.isMainRecipe ? "type-main" : "type-calculated").checked = true;
    ingredientsList.innerHTML = "";
    recipeToEdit.ingredients.forEach((ingInGrams) => createIngredientRow(ingInGrams));
    updateIngredientNumbers();
    saveRecipeBtn.textContent = "Perbarui Resep";
    cancelEditBtn.classList.remove("hidden");
    saveAsCopyBtn.classList.remove("hidden");
    mainNavButtons[1].click();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function duplicateRecipe(index) {
    let savedRecipes = JSON.parse(localStorage.getItem("myRecipes")) || [];
    savedRecipes.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    const filteredRecipes = savedRecipes.filter((r) => (activeTab === "utama" ? r.isMainRecipe : !r.isMainRecipe));
    const recipeToCopy = JSON.parse(JSON.stringify(filteredRecipes[index]));
    if (!recipeToCopy) return;
    recipeToCopy.title += " (Copy)";
    recipeToCopy.lastModified = new Date().toISOString();
    savedRecipes.push(recipeToCopy);
    localStorage.setItem("myRecipes", JSON.stringify(savedRecipes));
    loadSavedRecipes();
    alert("Resep berhasil diduplikasi!");
  }

  function cancelEdit() {
    editingIndex = null;
    formTitle.textContent = "Buat Resep Baru";
    recipeTitleInput.value = "";
    document.getElementById("type-main").checked = true;
    ingredientsList.innerHTML = "";
    createIngredientRow();
    updateIngredientNumbers();
    saveRecipeBtn.textContent = "Simpan Resep Ini";
    cancelEditBtn.classList.add("hidden");
    saveAsCopyBtn.classList.add("hidden");
    currentScaledRecipe = null;
    scaledRecipeDisplay.innerHTML = "<p>Hasil perhitungan akan muncul di sini.</p>";
    scaledTotalWeightDisplay.textContent = "";
    totalWeightDisplay.textContent = "Total Berat Awal: 0 kg";
  }

  // Event Listeners
  loginButton.addEventListener("click", handleLogin);
  passwordInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleLogin();
  });

  addNewIngredientBtn.addEventListener("click", addNewIngredient);
  newIngredientInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addNewIngredient();
  });

  masterIngredientListUI.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-ingredient-btn")) {
      const index = parseInt(e.target.dataset.index, 10);
      deleteIngredient(index);
    }
  });

  searchIngredientInput.addEventListener("input", renderMasterIngredientList);
  searchRecipeInput.addEventListener("input", loadSavedRecipes);
  saveRecipeBtn.addEventListener("click", () => saveRecipe(false));
  saveAsCopyBtn.addEventListener("click", () => saveRecipe(true));

  addIngredientBtn.addEventListener("click", () => {
    createIngredientRow();
    updateIngredientNumbers();
  });

  calculateTotalBtn.addEventListener("click", calculateTotalWeight);
  totalUnitSelector.addEventListener("change", displayTotalWeight);
  resultUnitSelector.addEventListener("change", () => {
    if (currentScaledRecipe) generateScaledRecipe();
  });
  generateScaledBtn.addEventListener("click", generateScaledRecipe);
  cancelEditBtn.addEventListener("click", cancelEdit);

  tabUtama.addEventListener("click", () => {
    activeTab = "utama";
    tabUtama.classList.add("active");
    tabHitungan.classList.remove("active");
    loadSavedRecipes();
  });

  tabHitungan.addEventListener("click", () => {
    activeTab = "hitungan";
    tabHitungan.classList.add("active");
    tabUtama.classList.remove("active");
    loadSavedRecipes();
  });

  savedRecipesList.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (!button) return;
    const index = button.dataset.index;
    if (button.classList.contains("delete-btn")) deleteRecipe(index);
    if (button.classList.contains("edit-btn")) editRecipe(index);
    if (button.classList.contains("duplicate-btn")) duplicateRecipe(index);
  });

  // Initialize
  checkLoginStatus();
  loadIngredients();
  initializeDefaultRecipe();
  cancelEdit();
  loadSavedRecipes();
});
