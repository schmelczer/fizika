const { test } = require("node:test");
const assert = require("node:assert/strict");
const { validateQuestionBank } = require("./validate-question-bank");

const completePaper = (paper = "2025/2", count = 15) =>
  Array.from({ length: count }, (_, i) => ({
    id: 683 + i,
    source: `${paper}/${i + 1}`,
  }));

test("complete papers have unique sources and every expected question", () => {
  assert.deepEqual(
    validateQuestionBank([...completePaper(), ...completePaper("2016/m1")]),
    [],
  );
});

test("the October 2025 mislabel reports both duplicate 5 and missing 6", () => {
  const questions = completePaper();
  questions[5].source = "2025/2/5";
  const errors = validateQuestionBank(questions);
  assert.equal(errors.length, 2);
  assert.match(errors[0], /Duplicate source 2025\/2\/5.*687 and 688/);
  assert.match(errors[1], /2025\/2: missing question numbers 6$/);

  questions[5].source = "2025/2/6";
  assert.deepEqual(validateQuestionBank(questions), []);
});

test("completeness includes missing first and last questions", () => {
  const errors = validateQuestionBank(completePaper().slice(1, -1));
  assert.deepEqual(errors, ["2025/2: missing question numbers 1, 15"]);
});

test("unexpected question numbers fail validation", () => {
  assert.deepEqual(validateQuestionBank(completePaper("2025/2", 16)), [
    "2025/2: unexpected question numbers 16",
  ]);
});

test("paper checks ignore other papers but detect an entirely missing import", () => {
  assert.deepEqual(
    validateQuestionBank([...completePaper(), { id: 1, source: "2024/2/1" }], {
      paper: "2025/2",
    }),
    [],
  );
  assert.match(
    validateQuestionBank([], { paper: "2025/2" })[0],
    /2025\/2: missing question numbers 1, 2, 3.*15$/,
  );
});

test("the expected count is explicit, so shorter imports cannot appear complete", () => {
  assert.deepEqual(
    validateQuestionBank(completePaper("2025/2", 3), { questionCount: 3 }),
    [],
  );
  assert.match(
    validateQuestionBank(completePaper("2025/2", 3))[0],
    /missing question numbers 4, 5, 6.*15$/,
  );
});

test("malformed sources and invalid banks fail validation", () => {
  for (const source of [
    undefined,
    null,
    "2025/2/0",
    "2025/2/1.5",
    "2025/2/01",
    "2025/2/1 ",
  ]) {
    assert.match(
      validateQuestionBank([{ source }])[0],
      /Invalid source identifier/,
    );
  }
  assert.deepEqual(validateQuestionBank({}), [
    "Question bank must be an array",
  ]);
  assert.deepEqual(validateQuestionBank([]), [
    "Question bank must contain at least one question",
  ]);
  for (const questionCount of [0, -1, 1.5, NaN, Infinity]) {
    assert.throws(
      () => validateQuestionBank([], { questionCount }),
      /positive integer/,
    );
  }
});
