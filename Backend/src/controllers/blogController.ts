import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as blogModel from '../models/blogModel';

export const getBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, category, search } = req.query;
    const blogs = await blogModel.getAllBlogs(
      status as string | undefined,
      category as string | undefined,
      search as string | undefined
    );
    res.status(200).json({ blogs });
  } catch (error) {
    console.error('Error in getBlogs controller:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
};

export const getBlogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const blog = await blogModel.getBlogById(id as string);
    if (!blog) {
      res.status(404).json({ error: 'Blog post not found' });
      return;
    }
    res.status(200).json({ blog });
  } catch (error) {
    console.error('Error in getBlogById controller:', error);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
};

export const createBlog = async (req: AuthRequest, res: Response): Promise<void> => {
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
  } catch (error) {
    console.error('Error in createBlog controller:', error);
    res.status(500).json({ error: 'Failed to create blog' });
  }
};

export const updateBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, subtitle, category, cover_image, author_name, author_role, read_time, content_blocks, status } = req.body;

    const existing = await blogModel.getBlogById(id as string);
    if (!existing) {
      res.status(404).json({ error: 'Blog post not found' });
      return;
    }

    const updated = await blogModel.updateBlog(id as string, {
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
  } catch (error) {
    console.error('Error in updateBlog controller:', error);
    res.status(500).json({ error: 'Failed to update blog' });
  }
};

export const deleteBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const success = await blogModel.deleteBlog(id as string);
    if (!success) {
      res.status(404).json({ error: 'Blog post not found or already deleted' });
      return;
    }
    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error in deleteBlog controller:', error);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
};
