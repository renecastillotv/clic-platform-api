// lib/meili.js
const { MeiliSearch } = require('meilisearch');

if (!process.env.MEILI_HOST || !process.env.MEILI_MASTER_KEY) {
    console.error('❌ Falta MEILI_HOST o MEILI_MASTER_KEY en .env');
    process.exit(1);
}

const meili = new MeiliSearch({
    host: process.env.MEILI_HOST,       // ej: https://search.clicinmobiliaria.com
    apiKey: process.env.MEILI_MASTER_KEY,
});

function getPropertiesIndex(tenantSlug) {
    const slug = tenantSlug || process.env.DEFAULT_TENANT_SLUG || 'clicrd';
    return meili.index(`properties_${slug}`);
}

module.exports = {
    meili,
    getPropertiesIndex,
};
