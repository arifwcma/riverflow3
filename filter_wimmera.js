const fs = require("fs");

const inputFile = "formatted.json";
const outputFile = "wimmera.json";

const data = JSON.parse(fs.readFileSync(inputFile, "utf8"));

const filtered = data.filter(entry => entry.cma_decode === "Wimmera CMA");

fs.writeFileSync(outputFile, JSON.stringify(filtered, null, 2), "utf8");

console.log(`Saved ${filtered.length} entries to ${outputFile}`);
