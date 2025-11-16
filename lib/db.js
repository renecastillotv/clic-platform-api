const { createClient } = require("@supabase/supabase-js");

<<<<<<< HEAD
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.warn(⚠️ SUPABASE_URL o SUPABASE_SERVICE_KEY no están definidas");
}

=======
>>>>>>> c59b567deafa8dac65d628394fecc4b443b5fac4
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

<<<<<<< HEAD
module.exports = { supabase };
=======
module.exports = { supabase };
>>>>>>> c59b567deafa8dac65d628394fecc4b443b5fac4
