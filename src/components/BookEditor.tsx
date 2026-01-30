import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Book, Page } from '../types';
import { Trash2, Plus, X } from 'lucide-react';

interface BookEditorProps {
    initialBook?: Book;
    onSave: (book: Book) => void;
    onCancel: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

export default function BookEditor({ initialBook, onSave, onCancel }: BookEditorProps) {
    const [title, setTitle] = useState(initialBook?.title || '');
    const [coverImage, setCoverImage] = useState(initialBook?.coverImage || '');
    const [pages, setPages] = useState<Page[]>(initialBook?.pages || []);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper to handle image upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const base64 = await fileToBase64(file);
                callback(base64);
            } catch (err) {
                console.error("Error reading file:", err);
            }
        }
    };

    const addPage = () => {
        setPages([...pages, { id: uuidv4(), content: '' }]);
    };

    const updatePage = (id: string, field: keyof Page, value: string) => {
        setPages(pages.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const removePage = (id: string) => {
        setPages(pages.filter(p => p.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return alert("Title is required");
        if (pages.length === 0) return alert("At least one page is required");

        setIsSubmitting(true);

        const book: Book = {
            id: initialBook?.id || uuidv4(),
            title,
            coverImage,
            pages,
            createdAt: initialBook?.createdAt || Date.now(),
        };

        onSave(book);
    };

    return (
        <form onSubmit={handleSubmit} className="book-editor" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>{initialBook ? 'Edit Book' : 'New Book'}</h2>
                <div style={{ gap: '10px', display: 'flex' }}>
                    <button type="button" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
                    <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Book'}</button>
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Book Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter book title"
                        style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Cover Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, setCoverImage)}
                    />
                    {coverImage && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <img src={coverImage} alt="Cover Preview" style={{ height: '150px', objectFit: 'cover', borderRadius: '4px' }} />
                            <button type="button" onClick={() => setCoverImage('')} style={{ marginLeft: '10px', fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>Remove</button>
                        </div>
                    )}
                </div>
            </div>

            <h3>Pages ({pages.length})</h3>

            {pages.map((page, index) => (
                <div key={page.id} style={{ marginBottom: '1.5rem', padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px', position: 'relative', backgroundColor: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ fontWeight: 600 }}>Page {index + 1}</span>
                        <button type="button" onClick={() => removePage(page.id)} style={{ padding: '4px 8px', color: '#d32f2f' }} title="Remove Page">
                            <Trash2 size={16} />
                        </button>
                    </div>

                    <textarea
                        value={page.content}
                        onChange={(e) => updatePage(page.id, 'content', e.target.value)}
                        placeholder="Page content (text to be read)..."
                        style={{ width: '100%', minHeight: '100px', padding: '0.8rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />

                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Page Image (Optional)</label>
                            {!page.image ? (
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, (base64) => updatePage(page.id, 'image', base64))}
                                />
                            ) : (
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <img src={page.image} alt="Page" style={{ maxHeight: '150px', maxWidth: '100%', borderRadius: '4px', border: '1px solid #ccc' }} />
                                    <button
                                        type="button"
                                        onClick={() => updatePage(page.id, 'image', '')}
                                        style={{ position: 'absolute', top: -10, right: -10, borderRadius: '50%', width: '24px', height: '24px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', border: '1px solid #ccc' }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {page.image && (
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Image Caption (Optional)</label>
                                <input
                                    type="text"
                                    value={page.caption || ''}
                                    onChange={(e) => updatePage(page.id, 'caption', e.target.value)}
                                    placeholder="Enter caption..."
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            ))}

            <button type="button" onClick={addPage} style={{ width: '100%', padding: '1rem', borderStyle: 'dashed', borderColor: '#ccc', backgroundColor: '#fdfdfd' }}>
                <Plus size={16} style={{ verticalAlign: 'text-bottom', marginRight: '5px' }} /> Add Page
            </button>

            <div style={{ height: '40px' }}></div>
        </form>
    );
}
