// Validate a complete import separately from individual admin edits, which
// legitimately build up a paper one question at a time.
function validateQuestionBank(questions, { paper, questionCount = 15 } = {}) {
  if (!Number.isSafeInteger(questionCount) || questionCount < 1) {
    throw new Error("Expected question count must be a positive integer");
  }
  if (!Array.isArray(questions)) return ["Question bank must be an array"];
  if (!questions.length && !paper) {
    return ["Question bank must contain at least one question"];
  }

  const errors = [];
  const papers = new Map();
  // An explicitly requested paper must be present, even if no rows match it.
  if (paper) papers.set(paper, new Map());

  for (const question of questions) {
    const source = question?.source;
    const match =
      typeof source === "string" &&
      source.match(/^(\d{4}\/[^/\s]+)\/([1-9]\d*)$/);
    if (!match || !Number.isSafeInteger(Number(match[2]))) {
      errors.push(`Invalid source identifier: ${JSON.stringify(source)}`);
      continue;
    }
    const paperId = match[1];
    if (paper && paperId !== paper) continue;

    if (!papers.has(paperId)) papers.set(paperId, new Map());
    const numbers = papers.get(paperId);
    const number = Number(match[2]);
    if (numbers.has(number)) {
      errors.push(
        `Duplicate source ${source} (question IDs ${numbers.get(number)} and ${question.id})`,
      );
    } else {
      numbers.set(number, question.id);
    }
  }

  for (const [paperId, numbers] of papers) {
    const missing = [];
    for (let number = 1; number <= questionCount; number++) {
      if (!numbers.has(number)) missing.push(number);
    }
    if (missing.length) {
      errors.push(`${paperId}: missing question numbers ${missing.join(", ")}`);
    }
    const unexpected = [...numbers.keys()]
      .filter((number) => number > questionCount)
      .sort((a, b) => a - b);
    if (unexpected.length) {
      errors.push(
        `${paperId}: unexpected question numbers ${unexpected.join(", ")}`,
      );
    }
  }

  return errors;
}

if (require.main === module) {
  try {
    const { values, positionals } = require("node:util").parseArgs({
      allowPositionals: true,
      options: {
        paper: { type: "string" },
        count: { type: "string", default: "15" },
      },
    });
    const dataPath = positionals[0] || process.env.DATA_PATH;
    if (!dataPath || positionals.length > 1) {
      throw new Error(
        "Usage: node validate-question-bank.js <path> [--paper YYYY/session] [--count 15]",
      );
    }
    const questions = JSON.parse(
      require("node:fs").readFileSync(dataPath, "utf8"),
    );
    const errors = validateQuestionBank(questions, {
      paper: values.paper,
      questionCount: Number(values.count),
    });
    if (errors.length) {
      console.error(errors.join("\n"));
      process.exitCode = 1;
    } else {
      console.log(
        `Question bank validation passed (${values.paper || "all papers"}; ${values.count} questions per paper).`,
      );
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { validateQuestionBank };
