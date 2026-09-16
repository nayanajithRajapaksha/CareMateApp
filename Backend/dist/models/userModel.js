"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findProfileById = exports.findUserByEmail = void 0;
const db_1 = require("../config/db");
const findUserByEmail = async (email) => {
    const result = await (0, db_1.clientQuery)('SELECT * FROM app_users WHERE email = $1', [email]);
    return result.rows[0] || null;
};
exports.findUserByEmail = findUserByEmail;
const findProfileById = async (id) => {
    const result = await (0, db_1.clientQuery)('SELECT role, full_name, hospital FROM profiles WHERE id = $1', [id]);
    return result.rows[0] || null;
};
exports.findProfileById = findProfileById;
//# sourceMappingURL=userModel.js.map