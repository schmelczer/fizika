let questions = null;

// Auto-detect API base URL
const getApiBase = () => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  // If running on localhost, assume backend is on port 3001
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:3001`;
  }

  // For production, assume backend is on same origin
  return "https://fizika-backend.schmelczer.dev"
};

const API_BASE = getApiBase();

const loadQuestions = async (
  isSearch,
  categories,
  sourceScheme,
  questionCount
) => {
  if (questions === null) {
    try {
      const response = await fetch(`${API_BASE}/api/fizika`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      questions = await response.json();
      console.log('Questions loaded from backend API');
    } catch (error) {
      console.warn('Failed to load questions from API, falling back to local file:', error);
      try {
        const fallbackResponse = await fetch("fizika.json");
        if (!fallbackResponse.ok) {
          throw new Error(`Local file not available: ${fallbackResponse.status}`);
        }
        questions = await fallbackResponse.json();
        console.log('Questions loaded from local fallback file');
      } catch (fallbackError) {
        console.error('Both API and local file failed:', fallbackError);
        throw new Error('Unable to load quiz data from either backend API or local file');
      }
    }
  }

  let currentQuestions = questions.slice();

  if (isSearch) {
    currentQuestions = currentQuestions.filter((q) =>
      q.source.match(sourceScheme)
    );
  } else {
    shuffleArray(currentQuestions);
    currentQuestions = currentQuestions.filter((q) =>
      categories.includes(q.type)
    );
  }

  resultHtml = "";

  currentQuestions = currentQuestions.slice(0, questionCount);
  currentQuestions.forEach(
    ({ id, source, description, a, b, c, d, correct, image }, i) => {
      resultHtml += `
      <div class="feladat card" id="feladat${id}"> 
        <h2 style="float: left;">${i + 1}.</h2><h2>${source}</h2>
        <pre>${description}</pre>
        ${image ? `<img src="${API_BASE}/api/pics/${image}" onerror="this.src='pics/${image}'"><br>` : ""}
        <form id="form${id}"">
          <input type="radio" id="rad1" name="group">
          <label id="label${id}" class="rad1">${a}</label>
          <br>
          <input type="radio" id="rad2" name="group">
          <label id="label${id}" class="rad2">${b}</label>
          <br>
          <input type="radio" id="rad3" name="group">
          <label id="label${id}" class="rad3">${c}</label>
          <br>
          ${d
          ? `
          <input type="radio" id="rad4" name="group">
          <label id="label${id}" class="rad4">${d}</label>
          <br>`
          : ""
        }
        </form>
        <script type="text/javascript">
          $(document).ready(function(){
              totalPoints++;
              $("#ans").click(function(event){
                  event.preventDefault();
                  teszt(${id}, ${correct});    
              });
              $("#cAns").click(function(event){
                  event.preventDefault();
                  showCorrect(${id}, ${correct});
              });
          });
        </script>
      </div>
      `;
    }
  );

  resultHtml +=
    currentQuestions.length === 0
      ? '<div class="buttonwrapper"><b style="font-size: 2rem;">Nem található a keresésnek megfelelő feladat!</b></div>'
      : `<script type="text/javascript">
            startTimer = 1;
            timer = 0;
          </script>`;

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
    // Load questions if not already loaded
    if (questions === null) {
      try {
        const response = await fetch(`${API_BASE}/api/fizika`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        questions = await response.json();
        console.log('Questions loaded for year dropdown initialization');
      } catch (error) {
        console.warn('Failed to load questions from API, falling back to local file:', error);
        try {
          const fallbackResponse = await fetch("fizika.json");
          if (!fallbackResponse.ok) {
            throw new Error(`Local file not available: ${fallbackResponse.status}`);
          }
          questions = await fallbackResponse.json();
          console.log('Questions loaded from local fallback file for year dropdown');
        } catch (fallbackError) {
          console.error('Both API and local file failed:', fallbackError);
          return; // Don't update dropdown if data unavailable
        }
      }
    }

    // Extract unique years from question sources
    const yearSet = new Set();
    questions.forEach(q => {
      const yearMatch = q.source.match(/^(\d{4})\//);
      if (yearMatch) {
        yearSet.add(parseInt(yearMatch[1]));
      }
    });

    // Convert to sorted array (newest first)
    const uniqueYears = Array.from(yearSet).sort((a, b) => b - a);

    // Get existing dropdown
    const yearDropdown = document.getElementById('evszam');
    if (!yearDropdown) return;

    // Preserve the "Összes év" option and add dynamic years
    const allYearsOption = '<option value="all/">Összes év</option>';
    const yearOptions = uniqueYears.map(year => 
      `<option value="${year}/">${year}</option>`
    ).join('');

    yearDropdown.innerHTML = allYearsOption + yearOptions;
    
    console.log('Year dropdown initialized with years:', uniqueYears);
    
  } catch (error) {
    console.error('Failed to initialize year dropdown:', error);
  }
};

// Initialize month dropdown dynamically based on selected year
const initializeMonthDropdown = (selectedYear) => {
  if (!questions) return;

  const monthDropdown = document.getElementById('honap');
  if (!monthDropdown) return;

  // Always include "Összes feladatsora" option
  let monthOptions = '<option value="all">Összes feladatsora</option>';

  if (selectedYear === 'all/') {
    // Show all possible month patterns
    const monthSet = new Set();
    questions.forEach(q => {
      const sourceMatch = q.source.match(/^(\d{4})\/(.+?)\//);
      if (sourceMatch) {
        monthSet.add(sourceMatch[2]);
      }
    });

    // Convert to sorted array and create options
    const uniqueMonths = Array.from(monthSet).sort();
    uniqueMonths.forEach(month => {
      monthOptions += `<option value="${month}" class="fdynamic">${getMonthLabel(month)}</option>`;
    });

  } else {
    // Extract year from selected value (e.g., "2024/" -> "2024")
    const year = selectedYear.replace('/', '');
    
    // Get unique months for this specific year
    const monthSet = new Set();
    questions.forEach(q => {
      const sourceMatch = q.source.match(`^${year}\/(.+?)\/`);
      if (sourceMatch) {
        monthSet.add(sourceMatch[1]);
      }
    });

    const uniqueMonths = Array.from(monthSet).sort();
    
    // Special handling for known year patterns
    if (year === '2006') {
      // Preserve existing 2006 logic but add any new months found
      monthOptions += '<option value="1" class="f2006">Február-Március</option>';
      monthOptions += '<option value="2" class="f2006">Május-Június</option>';
      monthOptions += '<option value="3" class="f2006">Október-November</option>';
      
      // Add any dynamic months not covered by the standard ones
      uniqueMonths.forEach(month => {
        if (!['1', '2', '3'].includes(month)) {
          monthOptions += `<option value="${month}" class="f2006">${getMonthLabel(month)}</option>`;
        }
      });
      
    } else if (year === '2016') {
      // Preserve existing 2016 logic but add any new months found  
      monthOptions += '<option value="1" class="f">Május-Június</option>';
      monthOptions += '<option value="2" class="f">Október-November</option>';
      monthOptions += '<option value="m1" class="f2016">1. Mintafeladatsor</option>';
      monthOptions += '<option value="m2" class="f2016">2. Mintafeladatsor</option>';
      monthOptions += '<option value="m3" class="f2016">3. Mintafeladatsor</option>';
      
      // Add any dynamic months not covered
      uniqueMonths.forEach(month => {
        if (!['1', '2', 'm1', 'm2', 'm3'].includes(month)) {
          monthOptions += `<option value="${month}" class="f">${getMonthLabel(month)}</option>`;
        }
      });
      
    } else if (year === '2017') {
      // Preserve existing 2017 logic but add any new months found
      monthOptions += '<option value="1" class="f">Május-Június</option>';
      monthOptions += '<option value="2" class="f">Október-November</option>';
      
      // Add any dynamic months
      uniqueMonths.forEach(month => {
        if (!['1', '2'].includes(month)) {
          monthOptions += `<option value="${month}" class="f">${getMonthLabel(month)}</option>`;
        }
      });
      
    } else {
      // For other years, use standard logic plus dynamic months
      const hasStandard1 = uniqueMonths.includes('1');
      const hasStandard2 = uniqueMonths.includes('2');
      
      if (hasStandard1) {
        monthOptions += '<option value="1" class="f">Május-Június</option>';
      }
      if (hasStandard2) {
        monthOptions += '<option value="2" class="f">Október-November</option>';
      }
      
      // Add any non-standard months
      uniqueMonths.forEach(month => {
        if (!['1', '2'].includes(month)) {
          monthOptions += `<option value="${month}" class="f">${getMonthLabel(month)}</option>`;
        }
      });
    }
  }

  monthDropdown.innerHTML = monthOptions;
  console.log(`Month dropdown initialized for year: ${selectedYear}`);
};

// Helper function to get readable month labels
const getMonthLabel = (monthValue) => {
  // Handle known patterns
  const knownLabels = {
    '1': 'Május-Június',
    '2': 'Október-November', 
    '3': 'Harmadik időszak',
    'm1': '1. Mintafeladatsor',
    'm2': '2. Mintafeladatsor', 
    'm3': '3. Mintafeladatsor'
  };
  
  return knownLabels[monthValue] || monthValue;
};
