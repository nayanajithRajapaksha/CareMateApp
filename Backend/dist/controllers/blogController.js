"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlog = exports.updateBlog = exports.createBlog = exports.getBlogById = exports.getBlogs = void 0;
const blogModel = __importStar(require("../models/blogModel"));
const getBlogs = async (req, res) => {
    try {
        const { status, category, search } = req.query;
        const blogs = await blogModel.getAllBlogs(status, category, search);
        res.status(200).json({ blogs });
    }
    catch (error) {
        console.error('Error in getBlogs controller:', error);
        res.status(500).json({ error: 'Failed to fetch blogs' });
    }
};
exports.getBlogs = getBlogs;
const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await blogModel.getBlogById(id);
        if (!blog) {
            res.status(404).json({ error: 'Blog post not found' });
            return;
        }
        res.status(200).json({ blog });
    }
    catch (error) {
        console.error('Error in getBlogById controller:', error);
        res.status(500).json({ error: 'Failed to fetch blog post' });
    }
};
exports.getBlogById = getBlogById;
const createBlog = async (req, res) => {
    try {
        const { title, subtitle, category, cover_image, author_name, author_role, read_time, content_blocks, status } = req.body;
        if (!title || !title.trim()) {
            res.status(400).json({ error: 'Blog title is required' });
            return;
        }
        const userId = req.user?.id;
        const userRole = req.user?.role || author_role || 'admin';
        const newBlog = await blogModel.createBlog({
            title,
            subtitle,
            category: category || 'General',
            cover_image,
            author_name: author_name || (userRole.toLowerCase() === 'moh' || userRole.toLowerCase() === 'supervisor' ? 'MOH Officer' : 'System Admin'),
            author_role: userRole,
            created_by: userId,
            read_time: read_time || '5 min read',
            content_blocks: content_blocks || [],
            status: status || 'published',
        });
        res.status(201).json({ message: 'Blog created successfully', blog: newBlog });
    }
    catch (error) {
        console.error('Error in createBlog controller:', error);
        res.status(500).json({ error: 'Failed to create blog' });
    }
};
exports.createBlog = createBlog;
const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, subtitle, category, cover_image, author_name, author_role, read_time, content_blocks, status } = req.body;
        const existing = await blogModel.getBlogById(id);
        if (!existing) {
            res.status(404).json({ error: 'Blog post not found' });
            return;
        }
        const updated = await blogModel.updateBlog(id, {
            title,
            subtitle,
            category,
            cover_image,
            author_name,
            author_role,
            read_time,
            content_blocks,
            status,
        });
        res.status(200).json({ message: 'Blog updated successfully', blog: updated });
    }
    catch (error) {
        console.error('Error in updateBlog controller:', error);
        res.status(500).json({ error: 'Failed to update blog' });
    }
};
exports.updateBlog = updateBlog;
const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await blogModel.deleteBlog(id);
        if (!success) {
            res.status(404).json({ error: 'Blog post not found or already deleted' });
            return;
        }
        res.status(200).json({ message: 'Blog deleted successfully' });
    }
    catch (error) {
        console.error('Error in deleteBlog controller:', error);
        res.status(500).json({ error: 'Failed to delete blog' });
    }
};
exports.deleteBlog = deleteBlog;
//# sourceMappingURL=blogController.js.map