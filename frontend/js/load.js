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
