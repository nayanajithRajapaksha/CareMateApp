import { apiClient } from './apiClient';

export interface BlogBlock {
  id: string;
  type: 'subtitle' | 'text' | 'image';
  text?: string;
  url?: string;
  caption?: string;
}

export interface Blog {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  cover_image?: string;
  author_name: string;
  author_role: string;
  read_time?: string;
  content_blocks: BlogBlock[];
  status: 'published' | 'draft';
  created_at?: string;
  updated_at?: string;
}

export const blogService = {
  getAllBlogs: async (params?: { status?: string; category?: string; search?: string }): Promise<{ blogs: Blog[] }> => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient(`/blogs${queryString}`, { method: 'GET' });
  },

  getBlogById: async (id: string): Promise<{ blog: Blog }> => {
    return apiClient(`/blogs/${id}`, { method: 'GET' });
  },

  createBlog: async (blogData: Partial<Blog>): Promise<{ message: string; blog: Blog }> => {
    return apiClient('/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData),
    });
  },

  updateBlog: async (id: string, blogData: Partial<Blog>): Promise<{ message: string; blog: Blog }> => {
    return apiClient(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(blogData),
    });
  },

  deleteBlog: async (id: string): Promise<{ message: string }> => {
    return apiClient(`/blogs/${id}`, {
      method: 'DELETE',
    });
  },
};
