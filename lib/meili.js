const { MeiliSearch } = require("meilisearch");

if (!process.env.MEILI_HOST || !process.env.MEILI_MASTER_KEY) {
  console.warn("⚠️ MEILI_HOST o MEILI_MASTER_KEY no están definidas");
}

const meili = new MeiliSearch({
  host: process.env.MEILI_HOST,
  apiKey: process.env.MEILI_MASTER_KEY,
});

module.exports = { meili };