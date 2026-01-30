import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Book } from '../types';
import { getAllBooks } from '../lib/db';
import { Settings } from 'lucide-react';

export default function Library() {
    const [books, setBooks] = useState<Book[]>([]);

    useEffect(() => {
        getAllBooks().then(setBooks);
    }, []);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                <Link to="/admin" style={{ color: '#ccc', padding: '10px' }} title="Result Management">
                    <Settings size={20} />
                </Link>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, 150px)',
                gap: '2rem',
                justifyContent: 'flex-start'
            }}>
                {books.map(book => (
                    <Link to={`/read/${book.id}`} key={book.id} style={{ textDecoration: 'none', color: 'inherit', textAlign: 'center', width: '150px' }}>
                        <div style={{
                            width: '150px',
                            height: '220px',
                            backgroundColor: '#f5f5f5',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            marginBottom: '1rem',
                            borderRadius: '2px', // Book-like corners
                            overflow: 'hidden',
                            transition: 'transform 0.2s',
                            cursor: 'pointer'
                        }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {book.coverImage ? (
                                <img src={book.coverImage} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                                    {book.title}
                                </div>
                            )}
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {book.title}
                        </div>
                    </Link>
                ))}
                {books.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#888', marginTop: '3rem' }}>
                        <p>No books available.</p>
                        <Link to="/admin" style={{ color: '#646cff' }}>Add your first book</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
