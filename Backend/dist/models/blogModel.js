"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlog = exports.updateBlog = exports.createBlog = exports.getBlogById = exports.getAllBlogs = exports.createBlogTableIfNotExists = void 0;
const db_1 = __importDefault(require("../config/db"));
const createBlogTableIfNotExists = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS blogs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      subtitle TEXT,
      category VARCHAR(100) NOT NULL DEFAULT 'General',
      cover_image TEXT,
      author_name VARCHAR(255) NOT NULL DEFAULT 'CareMate Team',
      author_role VARCHAR(100) NOT NULL DEFAULT 'admin',
      created_by UUID,
      read_time VARCHAR(50) DEFAULT '5 min read',
      content_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
      status VARCHAR(50) NOT NULL DEFAULT 'published',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
    try {
        await db_1.default.query(query);
        console.log('Blogs database table verified/created.');
    }
    catch (error) {
        console.error('Error creating blogs table:', error);
    }
};
exports.createBlogTableIfNotExists = createBlogTableIfNotExists;
const getAllBlogs = async (statusFilter, categoryFilter, searchQuery) => {
    let query = `SELECT * FROM blogs WHERE 1=1`;
    const values = [];
    let index = 1;
    if (statusFilter && statusFilter !== 'all') {
        query += ` AND status = $${index++}`;
        values.push(statusFilter);
    }
    if (categoryFilter && categoryFilter !== 'All Topics') {
        query += ` AND LOWER(category) = LOWER($${index++})`;
        values.push(categoryFilter);
    }
    if (searchQuery && searchQuery.trim() !== '') {
        query += ` AND (LOWER(title) LIKE LOWER($${index}) OR LOWER(subtitle) LIKE LOWER($${index}))`;
        values.push(`%${searchQuery.trim()}%`);
        index++;
    }
    query += ` ORDER BY created_at DESC`;
    const res = await db_1.default.query(query, values);
    return res.rows;
};
exports.getAllBlogs = getAllBlogs;
const getBlogById = async (id) => {
    const res = await db_1.default.query(`SELECT * FROM blogs WHERE id = $1`, [id]);
    return res.rows[0] || null;
};
exports.getBlogById = getBlogById;
const createBlog = async (blog) => {
    const res = await db_1.default.query(`INSERT INTO blogs 
      (title, subtitle, category, cover_image, author_name, author_role, created_by, read_time, content_blocks, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`, [
        blog.title,
        blog.subtitle || null,
        blog.category || 'General',
        blog.cover_image || null,
        blog.author_name || 'CareMate Team',
        blog.author_role || 'admin',
        blog.created_by || null,
        blog.read_time || '5 min read',
        JSON.stringify(blog.content_blocks || []),
        blog.status || 'published'
    ]);
    return res.rows[0];
};
exports.createBlog = createBlog;
const updateBlog = async (id, blog) => {
    const res = await db_1.default.query(`UPDATE blogs
     SET title = COALESCE($1, title),
         subtitle = COALESCE($2, subtitle),
         category = COALESCE($3, category),
         cover_image = COALESCE($4, cover_image),
         author_name = COALESCE($5, author_name),
         author_role = COALESCE($6, author_role),
         read_time = COALESCE($7, read_time),
         content_blocks = COALESCE($8, content_blocks),
         status = COALESCE($9, status),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $10
     RETURNING *`, [
        blog.title ?? null,
        blog.subtitle ?? null,
        blog.category ?? null,
        blog.cover_image ?? null,
        blog.author_name ?? null,
        blog.author_role ?? null,
        blog.read_time ?? null,
        blog.content_blocks ? JSON.stringify(blog.content_blocks) : null,
        blog.status ?? null,
        id
    ]);
    return res.rows[0];
};
exports.updateBlog = updateBlog;
const deleteBlog = async (id) => {
    const res = await db_1.default.query(`DELETE FROM blogs WHERE id = $1 RETURNING id`, [id]);
    return res.rows.length > 0;
};
exports.deleteBlog = deleteBlog;
//# sourceMappingURL=blogModel.js.map