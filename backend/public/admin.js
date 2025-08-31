const API_BASE = window.location.origin;

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  loadQuestions();
  loadImages();
  
  // Set up event listeners
  setupEventListeners();
});

function setupEventListeners() {
  // Tab switching
  document.querySelectorAll('.tab[data-tab]').forEach(tab => {
    tab.addEventListener('click', (e) => {
      switchTab(e.target.dataset.tab);
    });
  });
  
  // Add question button
  document.getElementById('addQuestionBtn').addEventListener('click', showAddQuestionModal);
  
  // Image upload
  document.getElementById('imageUpload').addEventListener('change', uploadImage);
  
  // Modal close buttons
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  
  // Question form submit
  document.getElementById('questionForm').addEventListener('submit', saveQuestion);
  
  // Close modal when clicking outside
  document.getElementById('questionModal').addEventListener('click', (e) => {
    if (e.target.id === 'questionModal') {
      closeModal();
    }
  });
}

// Tab switching
function switchTab(tabName) {
  document
    .querySelectorAll(".tab-content")
    .forEach((tab) => tab.classList.remove("active"));
  document
    .querySelectorAll(".tab")
    .forEach((tab) => tab.classList.remove("active"));

  document.getElementById(tabName + "Tab").classList.add("active");
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

  if (tabName === "images") loadImages();
}

// Questions management
async function loadQuestions() {
  try {
    const response = await fetch(`${API_BASE}/api/admin/questions`);
    if (response.ok) {
      const questions = await response.json();
      displayQuestions(questions);
    } else {
      throw new Error("Failed to load");
    }
  } catch (error) {
    document.getElementById("questionsList").innerHTML =
      '<div class="alert alert-danger">Hiba a kérdések betöltésekor</div>';
  }
}

function displayQuestions(questions) {
  const container = document.getElementById("questionsList");
  container.innerHTML = questions
    .map(
      (q) => `
        <div class="question-item">
            <h4>ID: ${q.id} - ${q.source}</h4>
            <p><strong>Kérdés:</strong> ${q.description.substring(
              0,
              100
            )}...</p>
            <p><strong>Típus:</strong> ${
              q.type
            } | <strong>Helyes válasz:</strong> ${
        ["A", "B", "C", "D"][q.correct - 1]
      }</p>
            <div class="question-actions">
                <button data-edit-id="${q.id}">Szerkesztés</button>
                <button class="danger" data-delete-id="${q.id}">Törlés</button>
            </div>
        </div>
    `
    )
    .join("");
    
  // Add event listeners for edit and delete buttons
  container.querySelectorAll('[data-edit-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      editQuestion(parseInt(e.target.dataset.editId));
    });
  });
  
  container.querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      deleteQuestion(parseInt(e.target.dataset.deleteId));
    });
  });
}

function showAddQuestionModal() {
  document.getElementById("modalTitle").textContent =
    "Új kérdés hozzáadása";
  document.getElementById("questionForm").reset();
  document.getElementById("questionId").value = "";
  document.getElementById("questionModal").style.display = "block";
}

async function editQuestion(id) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/questions`);
    if (response.ok) {
      const questions = await response.json();
      const question = questions.find((q) => q.id === id);

      if (question) {
        document.getElementById("modalTitle").textContent =
          "Kérdés szerkesztése";
        document.getElementById("questionId").value = question.id;
        document.getElementById("questionSource").value = question.source;
        document.getElementById("questionDescription").value =
          question.description;
        document.getElementById("questionA").value = question.a;
        document.getElementById("questionB").value = question.b;
        document.getElementById("questionC").value = question.c;
        document.getElementById("questionD").value = question.d;
        document.getElementById("questionCorrect").value =
          question.correct;
        document.getElementById("questionType").value = question.type;
        document.getElementById("questionImage").value =
          question.image || "";
        document.getElementById("questionModal").style.display = "block";
      }
    }
  } catch (error) {
    showAlert("questionsAlert", "Hiba a kérdés betöltésekor", "danger");
  }
}

async function saveQuestion(event) {
  event.preventDefault();

  const data = {
    source: document.getElementById("questionSource").value,
    description: document.getElementById("questionDescription").value,
    a: document.getElementById("questionA").value,
    b: document.getElementById("questionB").value,
    c: document.getElementById("questionC").value,
    d: document.getElementById("questionD").value,
    correct: parseInt(document.getElementById("questionCorrect").value),
    type: document.getElementById("questionType").value,
    image: document.getElementById("questionImage").value || null,
  };

  const id = document.getElementById("questionId").value;
  const isEdit = id !== "";

  try {
    const response = await fetch(
      isEdit
        ? `${API_BASE}/api/admin/questions/${id}`
        : `${API_BASE}/api/admin/questions`,
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (response.ok) {
      closeModal();
      loadQuestions();
      showAlert("questionsAlert", "Kérdés sikeresen mentve!", "success");
    } else {
      const error = await response.json();
      showAlert(
        "questionsAlert",
        error.error || "Hiba a mentés során",
        "danger"
      );
    }
  } catch (error) {
    showAlert("questionsAlert", "Kapcsolat hiba", "danger");
  }
}

async function deleteQuestion(id) {
  if (!confirm("Biztosan törölni szeretnéd ezt a kérdést?")) return;

  try {
    const response = await fetch(
      `${API_BASE}/api/admin/questions/${id}`,
      { method: "DELETE" }
    );
    if (response.ok) {
      loadQuestions();
      showAlert("questionsAlert", "Kérdés törölve!", "success");
    } else {
      throw new Error("Delete failed");
    }
  } catch (error) {
    showAlert("questionsAlert", "Hiba a törlés során", "danger");
  }
}

// Images management
async function loadImages() {
  try {
    const response = await fetch(`${API_BASE}/api/images`);
    if (response.ok) {
      const images = await response.json();
      displayImages(images);
    } else {
      throw new Error("Failed to load");
    }
  } catch (error) {
    document.getElementById("imagesList").innerHTML =
      '<div class="alert alert-danger">Hiba a képek betöltésekor</div>';
  }
}

function displayImages(images) {
  const container = document.getElementById("imagesList");
  container.innerHTML = images
    .map(
      (image) => `
        <div class="image-item">
            <img src="${API_BASE}/api/pics/${image}" alt="${image}">
            <p>${image}</p>
            <button class="danger" data-delete-image="${image}">Törlés</button>
        </div>
    `
    )
    .join("");
    
  // Add event listeners for delete buttons
  container.querySelectorAll('[data-delete-image]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      deleteImage(e.target.dataset.deleteImage);
    });
  });
}

async function uploadImage() {
  const input = document.getElementById("imageUpload");
  const file = input.files[0];

  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`${API_BASE}/api/admin/images/upload`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      input.value = "";
      loadImages();
      showAlert("imagesAlert", "Kép sikeresen feltöltve!", "success");
    } else {
      const error = await response.json();
      showAlert(
        "imagesAlert",
        error.error || "Hiba a feltöltés során",
        "danger"
      );
    }
  } catch (error) {
    showAlert("imagesAlert", "Kapcsolat hiba", "danger");
  }
}

async function deleteImage(filename) {
  if (!confirm(`Biztosan törölni szeretnéd a ${filename} képet?`)) return;

  try {
    const response = await fetch(
      `${API_BASE}/api/admin/images/${encodeURIComponent(filename)}`,
      {
        method: "DELETE",
      }
    );

    if (response.ok) {
      loadImages();
      showAlert("imagesAlert", "Kép törölve!", "success");
    } else {
      throw new Error("Delete failed");
    }
  } catch (error) {
    showAlert("imagesAlert", "Hiba a törlés során", "danger");
  }
}

// Utility functions
function closeModal() {
  document.getElementById("questionModal").style.display = "none";
}

function showAlert(elementId, message, type) {
  const alertDiv = document.getElementById(elementId);
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  alertDiv.style.display = "block";

  setTimeout(() => {
    alertDiv.style.display = "none";
  }, 5000);
}

// This is now handled in setupEventListeners()