const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "src");

function walk(dir, removed) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.name === ".DS_Store" || entry.name.startsWith("._")) {
      fs.unlinkSync(fullPath);
      removed.push(fullPath);
      continue;
    }
    if (entry.isDirectory()) walk(fullPath, removed);
  }
}

const removed = [];
walk(ROOT, removed);
if (removed.length) {
  // eslint-disable-next-line no-console
  console.log(`Removed ${removed.length} macOS junk file(s) from src/`);
  removed.forEach((file) => {
    // eslint-disable-next-line no-console
    console.log(`  - ${path.relative(path.resolve(__dirname, ".."), file)}`);
  });
}
