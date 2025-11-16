const { MeiliSearch } = require("meilisearch");

<<<<<<< HEAD
if (!process.env.MEILI_HOST || !process.env.MEILI_MASTER_KEY) {
  console.warn("⚠️ MEILI_HOST o MEILI_MASTER_KEY no están definidas");
}

const meili = new MeiliSearch({
  host: process.env.MEILI_HOST,
  apiKey: process.env.MEILI_MASTER_KEY,
});

module.exports = { meili };
=======
const meili = new MeiliSearch({
  host: process.env.MEILI_HOST,
  apiKey: process.env.MEILI_MASTER_KEY
});

module.exports = { meili };
>>>>>>> c59b567deafa8dac65d628394fecc4b443b5fac4
