const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { validateQuestionBank } = require("./validate-question-bank");

const additions = require("./audit/additions.json");
const corrections = require("./audit/corrections.json");
const papers = require("./audit/papers.json");
const assets = require("./audit/assets.json");
const fields = [
  "source",
  "description",
  "a",
  "b",
  "c",
  "d",
  "correct",
  "type",
  "image",
];
const acceptedAnswers = (question) =>
  question.acceptedAnswers || [question.correct];

function auditQuestionBank(
  questions,
  {
    expectedQuestions = additions,
    expectedCorrections = corrections,
    expectedPapers = papers,
    expectedAssets = assets,
    picsPath,
  } = {},
) {
  const errors = validateQuestionBank(questions);
  if (!Array.isArray(questions)) return errors;
  const bySource = new Map(questions.map((q) => [q.source, q]));
  const ids = new Set();
  for (const question of questions) {
    if (
      !Number.isSafeInteger(question.id) ||
      question.id < 1 ||
      ids.has(question.id)
    ) {
      errors.push(
        `${question.source}: invalid or duplicate question ID ${question.id}`,
      );
    }
    ids.add(question.id);
  }
  for (const paper of expectedPapers) {
    if (!questions.some((q) => q.source.startsWith(`${paper.paper}/`))) {
      errors.push(`${paper.paper}: entire paper is missing`);
    }
    paper.answerKey.forEach((correct, index) => {
      const source = `${paper.paper}/${index + 1}`;
      const actual = bySource.get(source);
      if (!actual) {
        errors.push(`${source}: missing question`);
        return;
      }
      if (actual.correct !== correct)
        errors.push(`${source}: correct answer differs from the official key`);
      const accepted = paper.acceptedAnswers[index + 1] || [correct];
      if (JSON.stringify(acceptedAnswers(actual)) !== JSON.stringify(accepted))
        errors.push(`${source}: accepted answers differ from the official key`);
    });
  }
  for (const correction of expectedCorrections) {
    const actual = bySource.get(correction.source);
    if (!actual) continue;
    for (const [field, value] of Object.entries(correction.after)) {
      if (JSON.stringify(actual[field]) !== JSON.stringify(value))
        errors.push(
          `${correction.source}: ${field} differs from the verified correction`,
        );
    }
  }
  for (const expected of expectedQuestions) {
    const actual = bySource.get(expected.source);
    if (!actual) {
      errors.push(`${expected.source}: missing question`);
      continue;
    }
    for (const field of fields) {
      if (actual[field] !== expected[field])
        errors.push(
          `${expected.source}: ${field} differs from the reviewed source`,
        );
    }
    if (
      JSON.stringify(acceptedAnswers(actual)) !==
      JSON.stringify(acceptedAnswers(expected))
    ) {
      errors.push(
        `${expected.source}: accepted answers differ from the official key`,
      );
    }
  }
  if (picsPath) {
    for (const asset of expectedAssets) {
      if (
        path.basename(asset.file) !== asset.file ||
        /[\\/]/.test(asset.file)
      ) {
        errors.push(`Unsafe image filename: ${asset.file}`);
        continue;
      }
      try {
        const data = fs.readFileSync(path.join(picsPath, asset.file));
        if (
          crypto.createHash("sha256").update(data).digest("hex") !==
          asset.sha256
        ) {
          errors.push(`${asset.file}: image differs from the reviewed figure`);
        }
      } catch (error) {
        errors.push(
          `${asset.file}: ${error.code === "ENOENT" ? "missing image" : error.message}`,
        );
      }
    }
  }
  return errors;
}

if (require.main === module) {
  try {
    const { values, positionals } = require("node:util").parseArgs({
      allowPositionals: true,
      options: { pics: { type: "string" } },
    });
    const dataPath = positionals[0] || process.env.DATA_PATH;
    if (!dataPath || positionals.length > 1)
      throw new Error(
        "Usage: node audit-question-bank.js <fizika.json> --pics <images-directory>",
      );
    const errors = auditQuestionBank(
      JSON.parse(fs.readFileSync(dataPath, "utf8")),
      {
        picsPath:
          values.pics ||
          process.env.PICS_PATH ||
          path.join(__dirname, "../frontend/pics"),
      },
    );
    if (errors.length) throw new Error(errors.join("\n"));
    console.log(
      `Audit passed: ${papers.length} papers, ${papers.reduce((count, paper) => count + paper.questionCount, 0)} questions, ${assets.length} images checked against the reviewed sources.`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  auditQuestionBank,
  additions,
  corrections,
  papers,
  assets,
  fields,
};
