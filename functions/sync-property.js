// functions/sync-property.js
const { supabase } = require('../lib/db');
const { getPropertiesIndex } = require('../lib/meili');
const { v4: uuidv4 } = require('uuid');

/**
 * Sincroniza UNA propiedad desde Supabase hacia Meilisearch.
 * Recibe:  ?id=<uuid_propiedad>
 */
module.exports = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Missing ?id=' });
    }

    // 1. Buscar propiedad base
    const { data: property, error: propError } = await supabase
      .from('properties_raw')
      .select('*')
      .eq('id', id)
      .single();

    if (propError) {
      console.error('Error fetching property:', propError);
      return res.status(500).json({ error: 'Failed to fetch property from Supabase' });
    }

    if (!property) {
      return res.status(404).json({ error: `Property not found: ${id}` });
    }

    // 2. Buscar tenant (para saber slug y plan)
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', property.tenant_id)
      .single();

    if (tenantError || !tenant) {
      console.error('Error fetching tenant:', tenantError);
      return res.status(500).json({ error: 'Failed to fetch tenant' });
    }

    const tenantSlug = tenant.slug || 'clicrd';

    // 3. (Opcional) Buscar relaciones: amenities, tags, etc. 
    // Las ponemos vacías por ahora para no explotar.
    const amenities = [];
    const tags = [];

    // 4. Construir documento para Meilisearch
    //    👉 Aquí es donde armamos el "properties_[tenant]" completo
    const doc = {
      id: property.id,
      tenant_id: property.tenant_id,
      tenant_slug: tenantSlug,
      original_tenant_id: property.tenant_id,

      title: property.title,
      description: property.description,
      slug: property.slug,
      type: property.type,
      operation: property.operation,          // compra, alquiler, temporal
      status: property.status || 'publicado',

      currency: property.currency || 'USD',
      price_sale: property.price_sale,
      price_rent: property.price_rent,
      price_temp: property.price_temp,
      maintenance: property.maintenance,

      m2_total: property.m2_total,
      m2_construction: property.m2_construction,
      rooms: property.rooms,
      bathrooms: property.bathrooms,
      parking: property.parking,
      floor_level: property.floor_level,
      building_floors: property.building_floors,
      lot_size: property.lot_size,
      year_built: property.year_built,
      is_project: property.is_project,

      // TODO: cuando tengas tabla de locations, estos campos saldrán de ahí
      country: property.country || null,
      state: property.state || null,
      city: property.city || null,
      zone: property.zone || null,
      sector: property.sector || null,
      address_public: property.address_public || null,

      // TODO: cuando tengas coords:
      _geo: property.lat && property.lng ? { lat: property.lat, lng: property.lng } : null,

      // Tags y amenities (llenaremos luego con joins reales)
      tags,
      amenities,

      // Campos para SEO/flags — los afinaremos después
      seo_level: property.seo_level || 1,
      seo_title: property.seo_title || property.title,
      seo_description: property.seo_description || property.description?.slice(0, 140) || '',
      seo_keywords: property.seo_keywords || [],

      // Stats básicos
      views: property.views || 0,
      shares: property.shares || 0,
      bookmarks: property.bookmarks || 0,
      featured_score: property.featured_score || 0,

      // Timestamps
      created_at: property.created_at,
      updated_at: property.updated_at,
    };

    // 5. Indexar en Meilisearch
    const index = getPropertiesIndex(tenantSlug);

    const task = await index.addDocuments([doc]);

    return res.json({
      ok: true,
      indexUid: index.uid,
      task,
      docId: doc.id,
    });
  } catch (err) {
    console.error('Error in sync-property function:', err);
    return res.status(500).json({
      error: 'Internal error in sync-property',
      message: err.message,
    });
  }
};
