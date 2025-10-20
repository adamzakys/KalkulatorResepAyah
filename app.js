document.addEventListener("DOMContentLoaded", () => {
  const DAFTAR_BAHAN_BAKU = [
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

  // --- ELEMEN-ELEMEN PENTING ---
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

  // --- STATE APLIKASI ---
  let currentScaledRecipe = null;
  let currentTotalInGrams = 0;
  let editingIndex = null;
  let activeTab = "utama"; // 'utama' atau 'hitungan'

  // --- FUNGSI-FUNGSI ---

  function initializeDefaultRecipe() {
    const savedRecipes = JSON.parse(localStorage.getItem("myRecipes"));
    if (!savedRecipes || savedRecipes.length === 0) {
      const defaultRecipe = {
        title: "Resep Cococrunch Coklat (Contoh)",
        totalWeight: 15920,
        lastModified: new Date().toISOString(),
        isMainRecipe: true, // Menandakan ini resep utama
        ingredients: [
          { name: "Cocoa Powder 301", quantity: 140 },
          { name: "Maltodextrine", quantity: 2800 },
          { name: "Flavour Coklat Baru", quantity: 175 },
          { name: "Vanillin", quantity: 35 },
          { name: "Garam", quantity: 210 },
          { name: "Gula", quantity: 2100 },
          { name: "Aji Plus", quantity: 56 },
          { name: "Sofros", quantity: 100 },
          { name: "Susu Baru", quantity: 30 },
          { name: "Dextrose", quantity: 140 },
          { name: "Sari Manis", quantity: 112 },
          { name: "Pewarna Coklat", quantity: 47 },
          { name: "Minyak", quantity: 9975 },
        ],
      };
      localStorage.setItem("myRecipes", JSON.stringify([defaultRecipe]));
    }
  }

  function convertWeight(grams, unit) {
    if (unit === "kg") return { value: grams / 1000, label: "kg" };
    if (unit === "oz") return { value: grams / 28.35, label: "ons" };
    return { value: grams, label: "gram" };
  }

  function createIngredientRow(ingredientInGrams = { name: DAFTAR_BAHAN_BAKU[0], quantity: "" }) {
    const row = document.createElement("div");
    row.className = "ingredient-row";
    const select = document.createElement("select");
    select.className = "ingredient-select";
    DAFTAR_BAHAN_BAKU.forEach((bahan) => {
      const option = document.createElement("option");
      option.value = bahan;
      option.textContent = bahan;
      if (bahan === ingredientInGrams.name) option.selected = true;
      select.appendChild(option);
    });
    const quantityInput = document.createElement("input");
    quantityInput.type = "text";
    quantityInput.inputMode = "decimal";
    quantityInput.placeholder = "Kuantitas (kg)";
    quantityInput.className = "ingredient-quantity";
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
    removeBtn.onclick = () => row.remove();
    row.appendChild(select);
    row.appendChild(quantityInput);
    row.appendChild(removeBtn);
    ingredientsList.appendChild(row);
  }

  function calculateTotalWeight() {
    currentTotalInGrams = 0;
    ingredientsList.querySelectorAll(".ingredient-row").forEach((row) => {
      const quantityInKg = parseFloat(row.querySelector(".ingredient-quantity").value) || 0;
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

    currentScaledRecipe = { title: recipeTitleInput.value || "Resep Tanpa Judul", ingredients: [], isMainRecipe: false };

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
      const name = row.querySelector(".ingredient-select").value;
      const originalQuantityInKg = parseFloat(row.querySelector(".ingredient-quantity").value) || 0;
      const originalQuantityInGrams = originalQuantityInKg * 1000;
      let scaledQuantityInGrams = operation === "multiply" ? originalQuantityInGrams * factor : originalQuantityInGrams / factor;
      scaledTotalInGrams += scaledQuantityInGrams;
      currentScaledRecipe.ingredients.push({ name: name, quantity: scaledQuantityInGrams });
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

  function saveRecipe() {
    if (!recipeTitleInput.value.trim()) {
      return alert("Judul resep tidak boleh kosong!");
    }

    if (!currentScaledRecipe) {
      calculateTotalWeight();
      currentScaledRecipe = {
        title: recipeTitleInput.value.trim(),
        totalWeight: currentTotalInGrams,
        ingredients: [],
      };
      ingredientsList.querySelectorAll(".ingredient-row").forEach((row) => {
        const name = row.querySelector(".ingredient-select").value;
        const quantityInKg = parseFloat(row.querySelector(".ingredient-quantity").value) || 0;
        currentScaledRecipe.ingredients.push({ name, quantity: quantityInKg * 1000 });
      });
    }

    currentScaledRecipe.title = recipeTitleInput.value.trim();
    currentScaledRecipe.isMainRecipe = document.getElementById("type-main").checked;
    currentScaledRecipe.lastModified = new Date().toISOString();

    let savedRecipes = JSON.parse(localStorage.getItem("myRecipes")) || [];

    if (editingIndex !== null) {
      savedRecipes.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
      const filteredRecipes = savedRecipes.filter((r) => (activeTab === "utama" ? r.isMainRecipe : !r.isMainRecipe));
      const originalRecipe = filteredRecipes[editingIndex];
      const indexInFullArray = savedRecipes.findIndex((r) => r.lastModified === originalRecipe.lastModified);

      if (indexInFullArray > -1) savedRecipes[indexInFullArray] = currentScaledRecipe;
      alert(`Resep "${currentScaledRecipe.title}" berhasil diperbarui!`);
    } else {
      savedRecipes.push(currentScaledRecipe);
      alert(`Resep "${currentScaledRecipe.title}" berhasil disimpan!`);
    }

    localStorage.setItem("myRecipes", JSON.stringify(savedRecipes));
    loadSavedRecipes();
    cancelEdit();
  }

  function loadSavedRecipes() {
    let savedRecipes = JSON.parse(localStorage.getItem("myRecipes")) || [];
    savedRecipes.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    const filteredRecipes = savedRecipes.filter((recipe) => (activeTab === "utama" ? recipe.isMainRecipe : !recipe.isMainRecipe));

    savedRecipesList.innerHTML = "";
    if (filteredRecipes.length === 0) {
      savedRecipesList.innerHTML = `<p>Belum ada resep di kategori ini.</p>`;
      return;
    }

    filteredRecipes.forEach((recipe, index) => {
      const recipeEl = document.createElement("div");
      recipeEl.className = "saved-recipe-item";
      if (recipe.isMainRecipe) recipeEl.classList.add("main-recipe");

      const editDate = new Date(recipe.lastModified).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

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
                    <button class="edit-btn" data-index="${index}">✏️ Edit</button>
                    <button class="duplicate-btn" data-index="${index}">📋 Copy</button>
                    <button class="delete-btn" data-index="${index}">🗑️ Hapus</button>
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
    saveRecipeBtn.textContent = "Perbarui Resep";
    cancelEditBtn.classList.remove("hidden");
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
    saveRecipeBtn.textContent = "Simpan Resep Ini";
    cancelEditBtn.classList.add("hidden");
    currentScaledRecipe = null;
    scaledRecipeDisplay.innerHTML = "<p>Hasil perhitungan akan muncul di sini.</p>";
    scaledTotalWeightDisplay.textContent = "";
    totalWeightDisplay.textContent = "Total Berat Awal: 0 kg";
  }

  // --- EVENT LISTENERS ---
  addIngredientBtn.addEventListener("click", createIngredientRow);
  calculateTotalBtn.addEventListener("click", calculateTotalWeight);
  totalUnitSelector.addEventListener("change", displayTotalWeight);
  resultUnitSelector.addEventListener("change", () => {
    if (currentScaledRecipe) generateScaledRecipe();
  });
  generateScaledBtn.addEventListener("click", generateScaledRecipe);
  saveRecipeBtn.addEventListener("click", saveRecipe);
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

  // --- INISIALISASI APLIKASI ---
  initializeDefaultRecipe();
  cancelEdit();
  loadSavedRecipes();
});
