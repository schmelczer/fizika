let questions = null;

// Auto-detect API base URL
const getApiBase = () => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  // If running on localhost, assume backend is on port 3001
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${protocol}//${hostname}:3001`;
  }

  // For production, assume backend is on same origin
  return "https://fizika-backend.schmelczer.dev";
};

const API_BASE = getApiBase();

// Fetch the question bank from the backend, which is the single source of
// truth. Cached after the first successful load.
const ensureQuestionsLoaded = async () => {
  if (questions !== null) return questions;

  const response = await fetch(`${API_BASE}/api/fizika`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  questions = await response.json();
  return questions;
};

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (ch) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[ch],
  );

// Question text is trusted but contains light markup (<sub>, <sup>, <br>) and
// pre-encoded entities. Escape everything first, then restore only that
// allowlist, so any other injected markup (e.g. <script>) stays inert.
const sanitizeQuestionHtml = (value) =>
  escapeHtml(value)
    .replace(/&lt;(\/?)(sub|sup)&gt;/g, "<$1$2>")
    .replace(/&lt;br\s*\/?&gt;/g, "<br>")
    .replace(/&amp;(lt|gt|amp|quot|#\d+|#x[0-9a-fA-F]+);/g, "&$1;");

const loadQuestions = async (
  isSearch,
  categories,
  sourceScheme,
  questionCount,
) => {
  await ensureQuestionsLoaded();

  let currentQuestions = questions.slice();

  if (isSearch) {
    currentQuestions = currentQuestions.filter((q) =>
      q.source.match(sourceScheme),
    );
  } else {
    shuffleArray(currentQuestions);
    currentQuestions = currentQuestions.filter((q) =>
      categories.includes(q.type),
    );
  }

  currentQuestions = currentQuestions.slice(0, questionCount);

  // Remember the exact set being shown. The two action buttons ("Kiértékelés"
  // and "Helyes megoldások") are bound once in fizika.js and grade this whole
  // set in a single pass. Previously each question injected its own #ans/#cAns
  // click handler; those were never removed, so they piled up across loads and
  // ended up grading stale (already-removed) questions, saving bogus 0%
  // results over the user's history.
  loadedQuestions = currentQuestions.map(({ id, correct }) => ({
    id: Number(id),
    correct: Number(correct),
  }));
  totalPoints = loadedQuestions.length;

  let resultHtml = "";
  currentQuestions.forEach(
    ({ id, source, description, a, b, c, d, image }, i) => {
      const qid = Number(id);
      const safeImage = image ? encodeURIComponent(image) : "";
      resultHtml += `
      <div class="feladat card" id="feladat${qid}">
        <h2 style="float: left;">${i + 1}.</h2><h2>${sanitizeQuestionHtml(source)}</h2>
        <pre>${sanitizeQuestionHtml(description)}</pre>
        ${image ? `<img src="${API_BASE}/api/pics/${safeImage}" crossorigin="anonymous" onerror="this.src='pics/${safeImage}'"><br>` : ""}
        <form id="form${qid}">
          <input type="radio" id="rad1" name="group">
          <label id="label${qid}" class="rad1">${sanitizeQuestionHtml(a)}</label>
          <br>
          <input type="radio" id="rad2" name="group">
          <label id="label${qid}" class="rad2">${sanitizeQuestionHtml(b)}</label>
          <br>
          <input type="radio" id="rad3" name="group">
          <label id="label${qid}" class="rad3">${sanitizeQuestionHtml(c)}</label>
          <br>
          ${d
          ? `
          <input type="radio" id="rad4" name="group">
          <label id="label${qid}" class="rad4">${sanitizeQuestionHtml(d)}</label>
          <br>`
          : ""
        }
        </form>
      </div>
      `;
    },
  );

  if (currentQuestions.length === 0) {
    resultHtml =
      '<div class="buttonwrapper"><b style="font-size: 2rem;">Nem található a keresésnek megfelelő feladat!</b></div>';
  }

  return resultHtml;
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Initialize year dropdown with dynamic years from question data
const initializeYearDropdown = async () => {
  try {
    await ensureQuestionsLoaded();

    // Reflect the live question count on the info page.
    const countEl = document.getElementById("questionCount");
    if (countEl) countEl.textContent = questions.length;

    // Extract unique years from question sources
    const yearSet = new Set();
    questions.forEach((q) => {
      const yearMatch = q.source.match(/^(\d{4})\//);
      if (yearMatch) {
        yearSet.add(parseInt(yearMatch[1]));
      }
    });

    // Convert to sorted array (newest first)
    const uniqueYears = Array.from(yearSet).sort((a, b) => b - a);

    // Get existing dropdown
    const yearDropdown = document.getElementById("evszam");
    if (!yearDropdown) return;

    // Preserve the "Összes év" option and add dynamic years
    const allYearsOption = '<option value="all/">Összes év</option>';
    const yearOptions = uniqueYears
      .map((year) => `<option value="${year}/">${year}</option>`)
      .join("");

    yearDropdown.innerHTML = allYearsOption + yearOptions;
  } catch (error) {
    console.error("Failed to initialize year dropdown:", error);
  }
};

// Initialize month dropdown dynamically based on selected year
const initializeMonthDropdown = (selectedYear) => {
  if (!questions) return;

  const monthDropdown = document.getElementById("honap");
  if (!monthDropdown) return;

  // Always include "Összes feladatsor" option
  let monthOptions = '<option value="all">Összes feladatsor</option>';

  if (selectedYear === "all/") {
    // Show all possible month patterns
    const monthSet = new Set();
    questions.forEach((q) => {
      const sourceMatch = q.source.match(/^(\d{4})\/(.+?)\//);
      if (sourceMatch) {
        monthSet.add(sourceMatch[2]);
      }
    });

    // Convert to sorted array and create options
    const uniqueMonths = Array.from(monthSet).sort();
    uniqueMonths.forEach((month) => {
      monthOptions += `<option value="${month}">${getMonthLabel(month)}</option>`;
    });
  } else {
    // Extract year from selected value (e.g., "2024/" -> "2024")
    const year = selectedYear.replace("/", "");

    // Get unique months for this specific year
    const monthSet = new Set();
    questions.forEach((q) => {
      const sourceMatch = q.source.match(`^${year}\/(.+?)\/`);
      if (sourceMatch) {
        monthSet.add(sourceMatch[1]);
      }
    });

    const uniqueMonths = Array.from(monthSet).sort();

    // Special handling for known year patterns
    if (year === "2006") {
      // Preserve existing 2006 logic but add any new months found
      monthOptions += '<option value="1">Február-Március</option>';
      monthOptions += '<option value="2">Május-Június</option>';
      monthOptions += '<option value="3">Október-November</option>';

      // Add any dynamic months not covered by the standard ones
      uniqueMonths.forEach((month) => {
        if (!["1", "2", "3"].includes(month)) {
          monthOptions += `<option value="${month}">${getMonthLabel(month)}</option>`;
        }
      });
    } else if (year === "2016") {
      // Preserve existing 2016 logic but add any new months found
      monthOptions += '<option value="1">Május-Június</option>';
      monthOptions += '<option value="2">Október-November</option>';
      monthOptions += '<option value="m1">1. Mintafeladatsor</option>';
      monthOptions += '<option value="m2">2. Mintafeladatsor</option>';
      monthOptions += '<option value="m3">3. Mintafeladatsor</option>';

      // Add any dynamic months not covered
      uniqueMonths.forEach((month) => {
        if (!["1", "2", "m1", "m2", "m3"].includes(month)) {
          monthOptions += `<option value="${month}">${getMonthLabel(month)}</option>`;
        }
      });
    } else if (year === "2017") {
      // Preserve existing 2017 logic but add any new months found
      monthOptions += '<option value="1">Május-Június</option>';
      monthOptions += '<option value="2">Október-November</option>';

      // Add any dynamic months
      uniqueMonths.forEach((month) => {
        if (!["1", "2"].includes(month)) {
          monthOptions += `<option value="${month}">${getMonthLabel(month)}</option>`;
        }
      });
    } else {
      // For other years, use standard logic plus dynamic months
      const hasStandard1 = uniqueMonths.includes("1");
      const hasStandard2 = uniqueMonths.includes("2");

      if (hasStandard1) {
        monthOptions += '<option value="1">Május-Június</option>';
      }
      if (hasStandard2) {
        monthOptions += '<option value="2">Október-November</option>';
      }

      // Add any non-standard months
      uniqueMonths.forEach((month) => {
        if (!["1", "2"].includes(month)) {
          monthOptions += `<option value="${month}">${getMonthLabel(month)}</option>`;
        }
      });
    }
  }

  monthDropdown.innerHTML = monthOptions;
};

// Helper function to get readable month labels
const getMonthLabel = (monthValue) => {
  // Handle known patterns
  const knownLabels = {
    1: "Május-Június",
    2: "Október-November",
    3: "Harmadik időszak",
    m1: "1. Mintafeladatsor",
    m2: "2. Mintafeladatsor",
    m3: "3. Mintafeladatsor",
  };

  return knownLabels[monthValue] || monthValue;
};
