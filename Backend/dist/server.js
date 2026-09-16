"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables before importing app
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const schedulingSchema_1 = require("./config/schedulingSchema");
const PORT = process.env.PORT || 3000;
(0, schedulingSchema_1.ensureSchedulingSchema)()
    .then(() => {
    app_1.default.listen(PORT, () => {
        console.log(`CareMate Custom Authentication Backend running on port ${PORT}`);
    });
})
    .catch(error => {
    console.error('Failed to initialize scheduling tables:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map