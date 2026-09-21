"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupabase = getSupabase;
const supabase_js_1 = require("@supabase/supabase-js");
let _supabase = null;
function getSupabase() {
    if (!_supabase) {
        const supabaseUrl = process.env.SUPABASE_URL || '';
        const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY || '';
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase URL or Key is missing from environment variables. Set SUPABASE_URL and SUPABASE_SECRET_KEY.');
        }
        _supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    }
    return _supabase;
}
//# sourceMappingURL=supabase.js.map