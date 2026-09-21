"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY || '';
if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key is missing from environment variables');
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
//# sourceMappingURL=supabase.js.map