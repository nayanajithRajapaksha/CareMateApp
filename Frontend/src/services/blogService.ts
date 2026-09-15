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
  getBlogs: async (category?: string, search?: string): Promise<Blog[]> => {
    try {
      const query = new URLSearchParams();
      query.append('status', 'published');
      if (category && category !== 'All Topics') {
        query.append('category', category);
      }
      if (search && search.trim() !== '') {
        query.append('search', search.trim());
      }
      const res = await apiClient(`/blogs?${query.toString()}`);
      return res.blogs || [];
    } catch (error) {
      console.error('Error fetching blogs in mobile service:', error);
      return [];
    }
  },

  getBlogById: async (id: string): Promise<Blog | null> => {
    try {
      const res = await apiClient(`/blogs/${id}`);
      return res.blog || null;
    } catch (error) {
      console.error('Error fetching blog details in mobile service:', error);
      return null;
    }
  },
};
