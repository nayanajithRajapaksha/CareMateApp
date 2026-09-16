"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./config/db"));
async function run() {
    try {
        const child_id = '5cca37a6-7d50-4272-add4-ccdb53dec38f';
        const existingBooking = await db_1.default.query(`SELECT id FROM appointments WHERE child_id = $1 AND status = 'booked'`, [child_id]);
        console.table(existingBooking.rows);
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await db_1.default.end();
    }
}
run();
//# sourceMappingURL=checkDb.js.map