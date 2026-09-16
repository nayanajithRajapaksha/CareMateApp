export interface BlogBlock {
    id: string;
    type: 'subtitle' | 'text' | 'image';
    text?: string;
    url?: string;
    caption?: string;
}
export interface BlogData {
    id?: string;
    title: string;
    subtitle?: string;
    category: string;
    cover_image?: string;
    author_name: string;
    author_role: string;
    created_by?: string;
    read_time?: string;
    content_blocks: BlogBlock[];
    status?: 'published' | 'draft';
    created_at?: string;
    updated_at?: string;
}
export declare const createBlogTableIfNotExists: () => Promise<void>;
export declare const getAllBlogs: (statusFilter?: string, categoryFilter?: string, searchQuery?: string) => Promise<any[]>;
export declare const getBlogById: (id: string) => Promise<any>;
export declare const createBlog: (blog: BlogData) => Promise<any>;
export declare const updateBlog: (id: string, blog: Partial<BlogData>) => Promise<any>;
export declare const deleteBlog: (id: string) => Promise<boolean>;
//# sourceMappingURL=blogModel.d.ts.map