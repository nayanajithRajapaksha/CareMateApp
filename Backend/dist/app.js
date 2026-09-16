"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const childrenRoutes_1 = __importDefault(require("./routes/childrenRoutes"));
const staffRoutes_1 = __importDefault(require("./routes/staffRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const clinicRoutes_1 = __importDefault(require("./routes/clinicRoutes"));
const blogRoutes_1 = __importDefault(require("./routes/blogRoutes"));
const blogModel_1 = require("./models/blogModel");
const appointmentRoutes_1 = __importDefault(require("./routes/appointmentRoutes"));
const app = (0, express_1.default)();
// Initialize Database Tables
(0, blogModel_1.createBlogTableIfNotExists)();
// Global Middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cors_1.default)());
// Mount Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/children', childrenRoutes_1.default);
app.use('/api/staff', staffRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/clinics', clinicRoutes_1.default);
app.use('/api/blogs', blogRoutes_1.default);
app.use('/api/appointments', appointmentRoutes_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map