const fs = require("node:fs");
const { dist } = require("./config");

if (fs.existsSync(dist)) {
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(dist);
} else {
  fs.mkdirSync(dist);
}
