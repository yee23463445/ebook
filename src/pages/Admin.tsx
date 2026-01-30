import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Book } from '../types';
import { getAllBooks, saveBook, deleteBook } from '../lib/db';
import BookEditor from '../components/BookEditor';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';

export default function Admin() {
    const [books, setBooks] = useState<Book[]>([]);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    const loadBooks = async () => {
        setLoading(true);
        const data = await getAllBooks();
        // Sort by created recent first
        data.sort((a, b) => b.createdAt - a.createdAt);
        setBooks(data);
        setLoading(false);
    };

    useEffect(() => {
        loadBooks();
    }, []);

    const handleCreateNew = () => {
        setEditingBook(undefined);
        setIsEditorOpen(true);
    };

    const handleEdit = (book: Book) => {
        setEditingBook(book);
        setIsEditorOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this book? This cannot be undone.")) {
            await deleteBook(id);
            loadBooks();
        }
    };

    const handleSave = async (book: Book) => {
        await saveBook(book);
        setIsEditorOpen(false);
        loadBooks();
    };

    const handleCancel = () => {
        setIsEditorOpen(false);
        setEditingBook(undefined);
    };

    if (isEditorOpen) {
        return <BookEditor initialBook={editingBook} onSave={handleSave} onCancel={handleCancel} />;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Book Management</h1>
                    <Link to="/" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>&larr; Back to Library</Link>
                </div>
                <button onClick={handleCreateNew} style={{ display: 'flex', alignItems: 'center' }}>
                    <Plus size={18} style={{ marginRight: '5px' }} /> Add New Book
                </button>
            </div>

            {loading ? (
                <p>Loading books...</p>
            ) : books.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#888', border: '2px dashed #eee', borderRadius: '12px' }}>
                    <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No books found. Create your first one!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {books.map((book) => (
                        <div key={book.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '1rem',
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                            border: '1px solid #eee'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '80px',
                                backgroundColor: '#f0f0f0',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                marginRight: '1rem',
                                flexShrink: 0
                            }}>
                                {book.coverImage ? (
                                    <img src={book.coverImage} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>No Cover</div>
                                )}
                            </div>

                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>{book.title}</h3>
                                <span style={{ fontSize: '0.9rem', color: '#666' }}>{book.pages.length} Pages</span>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => handleEdit(book)} style={{ padding: '0.5rem', backgroundColor: '#f0f0f0' }} title="Edit">
                                    <Edit size={18} color="#333" />
                                </button>
                                <button onClick={() => handleDelete(book.id)} style={{ padding: '0.5rem', backgroundColor: '#fee' }} title="Delete">
                                    <Trash2 size={18} color="#d32f2f" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
