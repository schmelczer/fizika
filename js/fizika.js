var isSearch = false;
var totalPoints = 0;
var currentPoints = 0;
var correctAnswersGiven = 0;
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
  currentPoints = 0;
  $("#state").html("");
  $("#state2").html("");
  $("#percentage").html("");
  $("#megoldas").hide();
  $("#loadingGif").show();

  let result = "";
  if (type == 1) {
    var source =
      "^" + $("#evszam").val() + $("#honap").val() + $("#feladat").val() + "$";
    for (var i = 0; i <= 3; i++) {
      source = source.replace("all", ".*");
      console.log(source);
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
      15
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
  }
}

function showCorrect(id, correctAns) {
  teszt(id, correctAns);
  eval(
    "$('" +
      "#label" +
      id +
      ".rad" +
      correctAns +
      "').css('background-color', '#C6FF8C');"
  );
  $("#state").html("Helyes válaszok bejelölve!");
  $("#state2").html(
    "(Ellenőrző mód, az itteni eredményeid nem kerülnek elmentésre, a módból való kilépéshez tölts be egy új tesztsort!)"
  );
}

function teszt(id, correctAns) {
  var div = "#feladat" + id;
  var correct = "#form" + id + " #rad" + correctAns;
  var isCorrect = $(correct).is(":checked");
  currentPoints++;
  if (isCorrect) {
    $(div).animate({ backgroundColor: "#C6FF8C" }, 1100);
    correctAnswersGiven++;
  } else {
    $(div).animate({ backgroundColor: "#FF808C" }, 1100);
  }
  console.log(currentPoints, totalPoints, correctAnswersGiven);
  if (currentPoints >= totalPoints) {
    var percentage = (correctAnswersGiven / totalPoints) * 100;
    percentage = Math.round(percentage * 100) / 100;
    percentage = percentage.toFixed(2);
    $("#percentage").html("Eredmény: " + percentage + "%");
    $("#state").html("Válaszok leellenőrizve!");
    if (isLocal && !reviewMode) {
      var datum = new Date();
      var ido = Math.round(timer / 60);
      eval(
        "localStorage.teszt" + numberOfPreviousTests + " = '" + percentage + "'"
      );
      eval(
        "localStorage.teszt" +
          numberOfPreviousTests +
          "date = '" +
          datum.toLocaleDateString() +
          "'"
      );
      eval(
        "localStorage.teszt" + numberOfPreviousTests + "time = '" + ido + "'"
      );
      eval(
        "localStorage.teszt" +
          numberOfPreviousTests +
          "total = '" +
          totalPoints +
          "'"
      );
      startTimer = 0;
      timer = 0;
      $("#state2").show();
      $("#state2").html(
        "Eredményed mentésre került! Ellenőrző módba belépve az eredményeid nem kerülnek tárolásra. A módból való kilépéshez tölts be egy új tesztsort!"
      );
      eredmeny();
      reviewMode = 1;
    }
    currentPoints = 0;
    correctAnswersGiven = 0;
  }
}

function scrollTo(where) {
  $("html, body").animate(
    {
      scrollTop: $(where).offset().top - 100,
    },
    1000
  );
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
        '<table id="ered"><tr><th></th><th>Dátum</th><th>Időtartam</th><th>Eredmény</th><th>Pontszám</th></tr></table>'
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
            " pont</td></tr>"
        );
      }
    } else {
      $("#info").html("Még nincsenek elmentett eredményeid.");
    }
  } else {
    $("#tablazat").html(
      "<h2>Sajnos a böngésződ nem támogatja ezt a funkciót, tölts le egy modernebbet vagy jelentkezz be!</h2>"
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
  $(window).on("mousewheel", function () {
    $("body").stop();
  });

  $(document).ajaxError(function (event, jqxhr, settings) {
    if (!settings.secondExec) {
      settings.secondExec = true;
      setTimeout(function () {
        $.ajax(settings);
      }, 500);
    }
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
    //eredmeny();
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
    if ($("#evszam").val() == "2006/") {
      $(".f2006").show();
      $(".f2016").hide();
      $(".f").hide();
      $(".fnem17").hide();
    } else if ($("#evszam").val() == "2016/") {
      $(".f2006").hide();
      $(".f2016").show();
      $(".f").show();
      $(".fnem17").show();
    } else if ($("#evszam").val() == "2017/") {
      $(".f2006").hide();
      $(".f2016").hide();
      $(".f").show();
      $(".fnem17").hide();
    } else {
      $(".f2006").hide();
      $(".f2016").hide();
      $(".f").show();
      $(".fnem17").show();
    }
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
  $(".scroll").click(function () {
    $("body").animate(
      {
        scrollTop: $("#teszt").offset().top,
      },
      3000
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
                255
              ),
              0
            ),
            Math.max(
              Math.min(
                parseInt(g.pos * (g.end[1] - g.start[1]) + g.start[1]),
                255
              ),
              0
            ),
            Math.max(
              Math.min(
                parseInt(g.pos * (g.end[2] - g.start[2]) + g.start[2]),
                255
              ),
              0
            ),
          ].join(",") +
          ")";
      };
    }
  );
  function b(f) {
    var e;
    if (f && f.constructor == Array && f.length == 3) {
      return f;
    }
    if (
      (e = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(
        f
      ))
    ) {
      return [parseInt(e[1]), parseInt(e[2]), parseInt(e[3])];
    }
    if (
      (e = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(
        f
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
