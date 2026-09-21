import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit3, Trash2, ArrowUp, ArrowDown, Type, Image as ImageIcon, 
  Heading, Eye, X, Sparkles 
} from 'lucide-react';
import { blogService, type Blog, type BlogBlock } from '../services/blogService';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIES = ['Nutrition', 'Vaccinations', 'Mental Health', 'Child Development', 'General Health'];

export const BlogManager: React.FC = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal & Editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Nutrition');
  const [coverImage, setCoverImage] = useState('');
  const [readTime, setReadTime] = useState('5 min read');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [blocks, setBlocks] = useState<BlogBlock[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Preview modal
  const [previewBlog, setPreviewBlog] = useState<Blog | null>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await blogService.getAllBlogs({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined
      });
      setBlogs(data.blogs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [selectedCategory, searchQuery]);

  const openNewBlogModal = () => {
    setEditingBlogId(null);
    setTitle('');
    setSubtitle('');
    setCategory('Nutrition');
    setCoverImage('https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=600&q=80');
    setReadTime('5 min read');
    setStatus('published');
    setBlocks([
      { id: Date.now().toString() + '-1', type: 'subtitle', text: 'Overview & Importance' },
      { id: Date.now().toString() + '-2', type: 'text', text: 'Write your detailed guidance paragraph here...' }
    ]);
    setFormError('');
    setIsEditorOpen(true);
  };

  const openEditBlogModal = (blog: Blog) => {
    setEditingBlogId(blog.id);
    setTitle(blog.title);
    setSubtitle(blog.subtitle || '');
    setCategory(blog.category || 'Nutrition');
    setCoverImage(blog.cover_image || '');
    setReadTime(blog.read_time || '5 min read');
    setStatus(blog.status || 'published');
    setBlocks(Array.isArray(blog.content_blocks) ? blog.content_blocks : []);
    setFormError('');
    setIsEditorOpen(true);
  };

  // Block Manipulations (Move/Swap/Add/Remove)
  const addBlock = (type: 'subtitle' | 'text' | 'image') => {
    const newBlock: BlogBlock = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4),
      type,
      text: type === 'subtitle' ? 'New Section Subtitle' : type === 'text' ? 'Enter text paragraph here...' : '',
      url: type === 'image' ? 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80' : '',
      caption: type === 'image' ? 'Image caption' : ''
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (index: number, updatedFields: Partial<BlogBlock>) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], ...updatedFields };
    setBlocks(updated);
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === blocks.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setBlocks(updated);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Blog title is required.');
      return;
    }
    setSaving(true);
    setFormError('');

    try {
      const payload: Partial<Blog> = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        category,
        cover_image: coverImage.trim(),
        read_time: readTime.trim(),
        status,
        author_name: user?.full_name || 'CareMate Administrator',
        author_role: user?.role || 'admin',
        content_blocks: blocks
      };

      if (editingBlogId) {
        await blogService.updateBlog(editingBlogId, payload);
      } else {
        await blogService.createBlog(payload);
      }

      setIsEditorOpen(false);
      fetchBlogs();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save blog post.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBlog = async (id: string, blogTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${blogTitle}"?`)) return;
    try {
      await blogService.deleteBlog(id);
      setBlogs(blogs.filter(b => b.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete blog');
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h3 className="text-h2" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={24} color="var(--color-primary)" /> Educational Blogs Management
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--color-text-muted)' }}>
            Create and publish health articles with flexible, reorderable subtitle, text, and image blocks.
          </p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={openNewBlogModal}>
          <Plus size={18} /> Create New Blog Post
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: 38 }}
              placeholder="Search blogs by title or subtitle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              className={`btn ${selectedCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: 13 }}
              onClick={() => setSelectedCategory('all')}
            >
              All Topics
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 14px', fontSize: 13 }}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blogs List */}
      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: '12px 16px', borderRadius: 8 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading educational blogs...</div>
      ) : blogs.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <p style={{ fontSize: 16, marginBottom: 12 }}>No blogs found for the selected criteria.</p>
          <button className="btn btn-primary" onClick={openNewBlogModal}>Create First Blog</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {blogs.map(blog => (
            <div key={blog.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Cover Image */}
              <div style={{ position: 'relative', height: 160, backgroundColor: 'var(--color-bg)' }}>
                {blog.cover_image ? (
                  <img src={blog.cover_image} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                    <ImageIcon size={40} opacity={0.4} />
                  </div>
                )}
                <span style={{
                  position: 'absolute', top: 12, left: 12,
                  backgroundColor: 'rgba(22, 121, 121, 0.9)', color: '#fff',
                  fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 12
                }}>
                  {blog.category}
                </span>
                <span style={{
                  position: 'absolute', top: 12, right: 12,
                  backgroundColor: blog.status === 'published' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(245, 158, 11, 0.9)',
                  color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 10, textTransform: 'uppercase'
                }}>
                  {blog.status}
                </span>
              </div>

              {/* Info */}
              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: 'var(--color-text-dark)', lineHeight: 1.3 }}>
                  {blog.title}
                </h4>
                {blog.subtitle && (
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 12px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {blog.subtitle}
                  </p>
                )}

                <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted)' }}>
                  <span>{blog.author_name}</span>
                  <span>{blog.read_time || '5 min read'}</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div style={{ backgroundColor: 'var(--color-bg)', padding: '12px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={() => setPreviewBlog(blog)}
                >
                  <Eye size={14} /> Preview
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => openEditBlogModal(blog)}
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: 13, color: 'var(--color-error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                    onClick={() => handleDeleteBlog(blog.id, blog.title)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="card" style={{
            width: '100%', maxWidth: 850, maxHeight: '90vh', display: 'flex', flexDirection: 'column',
            padding: 0, overflow: 'hidden', position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-surface)' }}>
              <h4 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                {editingBlogId ? 'Edit Educational Article' : 'Create Educational Article'}
              </h4>
              <button onClick={() => setIsEditorOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="var(--color-text-muted)" />
              </button>
            </div>

            {/* Modal Body Scroll */}
            <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
              {formError && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: '10px 14px', borderRadius: 6, marginBottom: 20, fontSize: 14 }}>
                  {formError}
                </div>
              )}

              <form id="blogForm" onSubmit={handleSaveBlog} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Main Settings */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="input-label">Article Title *</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      placeholder="e.g. Essential Breastfeeding Guide for New Mothers"
                      required
                    />
                  </div>

                  <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="input-label">Lead Subtitle / Overview Paragraph</label>
                    <textarea 
                      className="input-field" 
                      rows={2} 
                      value={subtitle} 
                      onChange={e => setSubtitle(e.target.value)}
                      placeholder="A short introductory summary displayed on the card..."
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Topic Category</label>
                    <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Read Time</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={readTime} 
                      onChange={e => setReadTime(e.target.value)} 
                      placeholder="e.g. 5 min read"
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Publishing Status</label>
                    <select className="input-field" value={status} onChange={e => setStatus(e.target.value as any)}>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="input-label">Cover Image URL</label>
                    <input 
                      type="url" 
                      className="input-field" 
                      value={coverImage} 
                      onChange={e => setCoverImage(e.target.value)} 
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>

                {/* Content Blocks Section Header */}
                <div style={{ marginTop: 12, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <h5 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Content Blocks (Move / Swap Position)</h5>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>
                        Add subtitles, paragraphs, and images. Use up & down arrows to reorder content blocks easily.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ fontSize: 13, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
                        onClick={() => addBlock('subtitle')}
                      >
                        <Heading size={14} /> + Subtitle
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ fontSize: 13, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
                        onClick={() => addBlock('text')}
                      >
                        <Type size={14} /> + Text
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ fontSize: 13, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
                        onClick={() => addBlock('image')}
                      >
                        <ImageIcon size={14} /> + Image
                      </button>
                    </div>
                  </div>

                  {/* Render Editable Blocks */}
                  {blocks.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', border: '2px dashed var(--color-border)', borderRadius: 8, color: 'var(--color-text-muted)', fontSize: 14 }}>
                      No blocks added yet. Click one of the buttons above to add your first block.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {blocks.map((block, index) => (
                        <div key={block.id || index} style={{ border: '1px solid var(--color-border)', borderRadius: 8, padding: 16, backgroundColor: 'var(--color-bg)', position: 'relative' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ backgroundColor: 'var(--color-primary)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
                                #{index + 1} {block.type}
                              </span>
                            </div>

                            {/* Swap & Move Controls */}
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ padding: '4px 8px', fontSize: 12 }}
                                disabled={index === 0}
                                title="Move Block Up"
                                onClick={() => moveBlock(index, 'up')}
                              >
                                <ArrowUp size={14} /> Move Up
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ padding: '4px 8px', fontSize: 12 }}
                                disabled={index === blocks.length - 1}
                                title="Move Block Down"
                                onClick={() => moveBlock(index, 'down')}
                              >
                                <ArrowDown size={14} /> Move Down
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ padding: '4px 8px', color: 'var(--color-error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                title="Delete Block"
                                onClick={() => removeBlock(index)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Block Fields */}
                          {block.type === 'subtitle' && (
                            <input
                              type="text"
                              className="input-field"
                              value={block.text || ''}
                              onChange={e => updateBlock(index, { text: e.target.value })}
                              placeholder="Enter Subheading Title..."
                              style={{ fontWeight: 600 }}
                            />
                          )}

                          {block.type === 'text' && (
                            <textarea
                              className="input-field"
                              rows={3}
                              value={block.text || ''}
                              onChange={e => updateBlock(index, { text: e.target.value })}
                              placeholder="Enter detailed content text paragraph..."
                            />
                          )}

                          {block.type === 'image' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                              <input
                                type="url"
                                className="input-field"
                                value={block.url || ''}
                                onChange={e => updateBlock(index, { url: e.target.value })}
                                placeholder="Image URL (e.g. https://images.unsplash.com/...)"
                              />
                              <input
                                type="text"
                                className="input-field"
                                value={block.caption || ''}
                                onChange={e => updateBlock(index, { caption: e.target.value })}
                                placeholder="Image caption (Optional)"
                              />
                              {block.url && (
                                <img 
                                  src={block.url} 
                                  alt="Preview" 
                                  style={{ maxHeight: 120, objectFit: 'contain', borderRadius: 6, marginTop: 4, alignSelf: 'flex-start' }} 
                                />
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditorOpen(false)}>
                Cancel
              </button>
              <button type="submit" form="blogForm" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : editingBlogId ? 'Update Article' : 'Publish Article'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Article Preview Modal */}
      {previewBlog && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="card" style={{
            width: '100%', maxWidth: 700, maxHeight: '85vh', overflowY: 'auto',
            padding: 32, position: 'relative'
          }}>
            <button 
              onClick={() => setPreviewBlog(null)} 
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} color="var(--color-text-muted)" />
            </button>

            {previewBlog.cover_image && (
              <img src={previewBlog.cover_image} alt={previewBlog.title} style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 12, marginBottom: 20 }} />
            )}

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <span style={{ backgroundColor: 'var(--color-primary)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 12 }}>
                {previewBlog.category}
              </span>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{previewBlog.read_time}</span>
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 12px', color: 'var(--color-text-dark)' }}>{previewBlog.title}</h2>
            {previewBlog.subtitle && (
              <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 24, fontStyle: 'italic' }}>
                {previewBlog.subtitle}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Array.isArray(previewBlog.content_blocks) && previewBlog.content_blocks.map((block, idx) => (
                <div key={idx}>
                  {block.type === 'subtitle' && (
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-primary)', marginTop: 12, marginBottom: 8 }}>
                      {block.text}
                    </h3>
                  )}
                  {block.type === 'text' && (
                    <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--color-text-dark)', margin: 0 }}>
                      {block.text}
                    </p>
                  )}
                  {block.type === 'image' && (
                    <div style={{ margin: '12px 0', textAlign: 'center' }}>
                      <img src={block.url} alt={block.caption || 'Article image'} style={{ maxWidth: '100%', borderRadius: 8 }} />
                      {block.caption && (
                        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 6 }}>
                          {block.caption}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
