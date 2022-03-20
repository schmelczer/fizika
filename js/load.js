let questions = null;
const loadQuestions = async (
  isSearch,
  categories,
  sourceScheme,
  questionCount
) => {
  if (questions === null) {
    questions = await (await fetch("fizika.json")).json();
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
        ${image ? `<img src="pics/${image}"><br>` : ""}
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
          ${
            d
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
