// functions/search-properties.js
const { getPropertiesIndex } = require('../lib/meili');

/**
 * Búsqueda simple de propiedades desde Meilisearch.
 * GET /search-properties?tenant=clicrd&q=naco&operation=venta&type=apartamento&page=1&limit=20
 */
module.exports = async (req, res) => {
  try {
    const tenant = req.query.tenant || process.env.DEFAULT_TENANT_SLUG || 'clicrd';
    const q = req.query.q || ''; // texto de búsqueda
    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);

    const filters = [];

    // filtros simples
    if (req.query.operation) {
      filters.push(`operation = "${req.query.operation}"`);
    }

    if (req.query.type) {
      filters.push(`type = "${req.query.type}"`);
    }

    if (req.query.sector) {
      filters.push(`sector = "${req.query.sector}"`);
    }

    // precio mínimo / máximo
    if (req.query.min_price) {
      filters.push(`price_sale >= ${Number(req.query.min_price)}`);
    }

    if (req.query.max_price) {
      filters.push(`price_sale <= ${Number(req.query.max_price)}`);
    }

    const filterString = filters.length ? filters.join(' AND ') : undefined;

    const index = getPropertiesIndex(tenant);

    const searchParams = {
      q,
      filter: filterString,
      limit,
      offset: (page - 1) * limit,
    };

    const result = await index.search(q, searchParams);

    return res.json({
      ok: true,
      tenant,
      query: q,
      page,
      limit,
      total: result.estimatedTotalHits,
      items: result.hits,
    });
  } catch (err) {
    console.error('Error in search-properties:', err);
    return res.status(500).json({
      error: 'Internal error in search-properties',
      message: err.message,
    });
  }
};
