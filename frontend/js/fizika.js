var isSearch = false;
var totalPoints = 0;
var loadedQuestions = [];
var timer = 0;
var startTimer = 0;
var reviewMode = 0;

function aspect() {
  if ($(window).width() > $(window).height()) {
    $("#cim").html("Fizika gyakorlás");
  } else {
    $("#cim").html("Fizika");
  }
}

async function ajaxLoad(type) {
  reviewMode = 0;
  totalPoints = 0;
  loadedQuestions = [];
  $("#state").html("");
  $("#state2").html("");
  $("#percentage").html("");
  $("#megoldas").hide();
  $("#loadingGif").show();

  let result = "";

  try {
    if (type == 1) {
      var source =
        "^" +
        $("#evszam").val() +
        $("#honap").val() +
        $("#feladat").val() +
        "$";
      for (var i = 0; i <= 3; i++) {
        source = source.replace("all", ".*");
      }
      result = await loadQuestions(true, undefined, source, 1000000);
    } else if (type == 2) {
      result = await loadQuestions(
        false,
        [
          "mk",
          "md",
          "me",
          "mf",
          "mr",
          "h",
          "es",
          "ee",
          "ev",
          "m",
          "o",
          "ah",
          "am",
          "cs",
          "v",
        ],
        undefined,
        15,
      );
    } else {
      var NOQ = $("#numberof").val() ? $("#numberof").val() : 15;
      categories = [
        $("#mk").prop("checked") ? "mk" : "",
        $("#md").prop("checked") ? "md" : "",
        $("#me").prop("checked") ? "me" : "",
        $("#mf").prop("checked") ? "mf" : "",
        $("#mr").prop("checked") ? "mr" : "",
        $("#h").prop("checked") ? "h" : "",
        $("#es").prop("checked") ? "es" : "",
        $("#ee").prop("checked") ? "ee" : "",
        $("#ev").prop("checked") ? "ev" : "",
        $("#m").prop("checked") ? "m" : "",
        $("#o").prop("checked") ? "o" : "",
        $("#ah").prop("checked") ? "ah" : "",
        $("#am").prop("checked") ? "am" : "",
        $("#cs").prop("checked") ? "cs" : "",
        $("#v").prop("checked") ? "v" : "",
      ];
      result = await loadQuestions(false, categories, undefined, NOQ);
    }

    $("#loadingGif").hide();
    $("#content").html(result);
    $("#state2").hide();
    if (
      result !=
      '<div class="buttonwrapper"><b style="font-size: 2rem;">Nem található a keresésnek megfelelő feladat!</b></div>'
    ) {
      $("#megoldas").show();
      $("#state").html("Feladatok sikeresen letöltve!");
      startTimer = 1;
      timer = 0;
    }
  } catch (error) {
    $("#loadingGif").hide();
    $("#content").html(`
      <div class="buttonwrapper">
        <b style="font-size: 1.5rem; color: #dc3545;">
          Nem sikerült betölteni a feladatokat
        </b>
        <p style="margin-top: 1rem; color: #666;">
          ${error.message}
        </p>
        <p style="margin-top: 0.5rem; color: #666;">
          Ellenőrizd az internetkapcsolatot vagy próbáld újra.
        </p>
        <button class="button" onclick="location.reload()" style="margin-top: 1rem;">
          Újrapróbálás
        </button>
      </div>
    `);
    $("#state").html("Hiba a feladatok betöltésekor");
    console.error("Quiz loading error:", error);
  }
}

// Colour a single question green/red depending on whether the user selected
// its correct answer, and report whether they got it right.
function gradeQuestion(question) {
  var div = "#feladat" + question.id;
  var selected = "#form" + question.id + " #rad" + question.correct;
  var isCorrect = $(selected).is(":checked");
  $(div).animate({ backgroundColor: isCorrect ? "#C6FF8C" : "#FF808C" }, 1100);
  return isCorrect;
}

// Grade every question currently on screen and return the score as a string
// percentage (e.g. "66.67"). Grading the whole known set in one pass replaces
// the old per-question click handlers, which accumulated across loads and
// could save bogus results.
function scoreLoadedQuestions() {
  var correctAnswersGiven = 0;
  loadedQuestions.forEach(function (question) {
    if (gradeQuestion(question)) correctAnswersGiven++;
  });
  var percentage = (correctAnswersGiven / totalPoints) * 100;
  percentage = Math.round(percentage * 100) / 100;
  return percentage.toFixed(2);
}

// "Kiértékelés": grade the answers and, unless we are already reviewing, save
// the result once.
function evaluate() {
  if (!loadedQuestions.length) return;
  var percentage = scoreLoadedQuestions();
  $("#percentage").html("Eredmény: " + percentage + "%");
  $("#state").html("Válaszok leellenőrizve!");

  if (isLocal && !reviewMode) {
    saveResult(percentage);
    reviewMode = 1;
  }
}

// "Helyes megoldások": reveal the correct answers. This is a review action, so
// we enter review mode *before* grading to guarantee it can never overwrite a
// previously saved result.
function showCorrect() {
  if (!loadedQuestions.length) return;
  reviewMode = 1;
  var percentage = scoreLoadedQuestions();
  loadedQuestions.forEach(function (question) {
    $("#label" + question.id + ".rad" + question.correct).css(
      "background-color",
      "#C6FF8C",
    );
  });
  $("#percentage").html("Eredmény: " + percentage + "%");
  $("#state").html("Helyes válaszok bejelölve!");
  $("#state2").show();
  $("#state2").html(
    "(Ellenőrző mód, az itteni eredményeid nem kerülnek elmentésre, a módból való kilépéshez tölts be egy új tesztsort!)",
  );
}

function saveResult(percentage) {
  var datum = new Date();
  var ido = Math.round(timer / 60);
  localStorage["teszt" + numberOfPreviousTests] = percentage;
  localStorage["teszt" + numberOfPreviousTests + "date"] =
    datum.toLocaleDateString();
  localStorage["teszt" + numberOfPreviousTests + "time"] = ido;
  localStorage["teszt" + numberOfPreviousTests + "total"] = totalPoints;
  startTimer = 0;
  timer = 0;
  $("#state2").show();
  $("#state2").html(
    "Eredményed mentésre került! Ellenőrző módba belépve az eredményeid nem kerülnek tárolásra. A módból való kilépéshez tölts be egy új tesztsort!",
  );
  eredmeny();
}

function howMany() {
  var localString = "localStorage.teszt";
  numberOfPreviousTests = 1; //number of previous tests+1
  localString += numberOfPreviousTests;
  while (typeof eval(localString) !== "undefined") {
    numberOfPreviousTests++;
    localString = "localStorage.teszt" + numberOfPreviousTests;
  }
}

function eredmeny() {
  howMany();
  if (isLocal) {
    if (typeof localStorage.teszt1 !== "undefined") {
      $("#tablazat").html(
        '<table id="ered"><tr><th></th><th>Dátum</th><th>Időtartam</th><th>Eredmény</th><th>Pontszám</th></tr></table>',
      );
      for (var i = 1; i < numberOfPreviousTests; i++) {
        var localString = "localStorage.teszt" + i;
        var datumString = localString + "date";
        var timeString = localString + "time";
        var totalString = localString + "total";
        var isGood = eval(localString);
        $("#ered tr:last").after(
          "<tr><td>" +
            i +
            ".</td><td>" +
            eval(datumString) +
            "</td><td>" +
            eval(timeString) +
            " perc</td>" +
            "<td style='color: hsl(" +
            isGood +
            ",100%,50%);''> <b>" +
            eval(localString) +
            "%</b></td><td>" +
            Math.round((eval(localString) * eval(totalString)) / 100) +
            "/" +
            eval(totalString) +
            " pont</td></tr>",
        );
      }
    } else {
      $("#info").html("Még nincsenek elmentett eredményeid.");
    }
  } else {
    $("#tablazat").html(
      "<h2>Sajnos a böngésződ nem támogatja ezt a funkciót, tölts le egy modernebbet vagy jelentkezz be!</h2>",
    );
  }
}

//starting up
if (typeof Storage !== "undefined") {
  var isLocal = 1;
  howMany();
} else {
  var isLocal = 0;
}

setInterval(function () {
  if (startTimer) timer++;
}, 1000);

$(document).ready(function () {
  eredmeny();

  // Populate the year dropdown, then the month dropdown for the default "all".
  initializeYearDropdown().then(() => initializeMonthDropdown("all/"));

  $(window).on("mousewheel", function () {
    $("body").stop();
  });

  aspect();

  $("#bfooldal").click(function () {
    $("#bfooldal").css("font-weight", "700");
    $("#bteszt").css("font-weight", "400");
    $("#beredmenyek").css("font-weight", "400");
    $("#eredmenyek").hide();
    $("#teszt").hide();
    $("#fooldal").show();
  });
  $("#bteszt").click(function () {
    $("#bfooldal").css("font-weight", "400");
    $("#bteszt").css("font-weight", "700");
    $("#beredmenyek").css("font-weight", "400");
    $("#eredmenyek").hide();
    $("#teszt").show();
    $("#fooldal").hide();
  });
  $("#beredmenyek").click(function () {
    $("#bfooldal").css("font-weight", "400");
    $("#bteszt").css("font-weight", "400");
    $("#beredmenyek").css("font-weight", "700");
    $("#eredmenyek").show();
    $("#teszt").hide();
    $("#fooldal").hide();
  });
  $("#bkereses").click(function () {
    $("#kereses").show();
    $("#temakor").hide();
    $("#load").show();
    isSearch = true;
  });
  $("#btemakor").click(function () {
    $("#kereses").hide();
    $("#temakor").show();
    $("#load").show();
    isSearch = false;
  });
  $("#berettsegi").click(function () {
    $("#kereses").hide();
    $("#temakor").hide();
    $("#load").hide();
    isSearch = false;
  });
  $("#evszam").change(function () {
    initializeMonthDropdown($("#evszam").val());
    $("#honap").val("all");
  });

  $("#mec").change(function () {
    var isChecked = this.checked;
    $("#mk").prop("checked", isChecked);
    $("#md").prop("checked", isChecked);
    $("#me").prop("checked", isChecked);
    $("#mf").prop("checked", isChecked);
    $("#mr").prop("checked", isChecked);
  });
  $("#ele").change(function () {
    var isChecked = this.checked;
    $("#es").prop("checked", isChecked);
    $("#ee").prop("checked", isChecked);
    $("#ev").prop("checked", isChecked);
  });
  $("#atm").change(function () {
    var isChecked = this.checked;
    $("#ah").prop("checked", isChecked);
    $("#am").prop("checked", isChecked);
  });
  $("#berettsegi").click(function (event) {
    ajaxLoad(2);
  });
  $("#load").click(function (event) {
    ajaxLoad(isSearch ? 1 : 3);
  });
  $("#ans").click(function (event) {
    event.preventDefault();
    evaluate();
  });
  $("#cAns").click(function (event) {
    event.preventDefault();
    showCorrect();
  });
  $(".scroll").click(function () {
    $("body").animate(
      {
        scrollTop: $("#teszt").offset().top,
      },
      3000,
    );
  });
});

(function (d) {
  d.each(
    [
      "backgroundColor",
      "borderBottomColor",
      "borderLeftColor",
      "borderRightColor",
      "borderTopColor",
      "color",
      "outlineColor",
    ],
    function (f, e) {
      d.fx.step[e] = function (g) {
        if (!g.colorInit) {
          g.start = c(g.elem, e);
          g.end = b(g.end);
          g.colorInit = true;
        }
        g.elem.style[e] =
          "rgb(" +
          [
            Math.max(
              Math.min(
                parseInt(g.pos * (g.end[0] - g.start[0]) + g.start[0]),
                255,
              ),
              0,
            ),
            Math.max(
              Math.min(
                parseInt(g.pos * (g.end[1] - g.start[1]) + g.start[1]),
                255,
              ),
              0,
            ),
            Math.max(
              Math.min(
                parseInt(g.pos * (g.end[2] - g.start[2]) + g.start[2]),
                255,
              ),
              0,
            ),
          ].join(",") +
          ")";
      };
    },
  );
  function b(f) {
    var e;
    if (f && f.constructor == Array && f.length == 3) {
      return f;
    }
    if (
      (e =
        /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(
          f,
        ))
    ) {
      return [parseInt(e[1]), parseInt(e[2]), parseInt(e[3])];
    }
    if (
      (e =
        /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(
          f,
        ))
    ) {
      return [
        parseFloat(e[1]) * 2.55,
        parseFloat(e[2]) * 2.55,
        parseFloat(e[3]) * 2.55,
      ];
    }
    if ((e = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(f))) {
      return [parseInt(e[1], 16), parseInt(e[2], 16), parseInt(e[3], 16)];
    }
    if ((e = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(f))) {
      return [
        parseInt(e[1] + e[1], 16),
        parseInt(e[2] + e[2], 16),
        parseInt(e[3] + e[3], 16),
      ];
    }
    if ((e = /rgba\(0, 0, 0, 0\)/.exec(f))) {
      return a.transparent;
    }
    return a[d.trim(f).toLowerCase()];
  }
  function c(g, e) {
    var f;
    do {
      f = d.css(g, e);
      if ((f != "" && f != "transparent") || d.nodeName(g, "body")) {
        break;
      }
      e = "backgroundColor";
    } while ((g = g.parentNode));
    return b(f);
  }
  var a = {};
})(jQuery);
