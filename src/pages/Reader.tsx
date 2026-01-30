import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Book } from '../types';
import { getBook } from '../lib/db';
import { ChevronLeft, ChevronRight, Play, Pause, ArrowLeft } from 'lucide-react';

export default function Reader() {
    const { id } = useParams<{ id: string }>();
    const [book, setBook] = useState<Book | null>(null);
    const [pageIndex, setPageIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);

    // Refs to handle TTS state independent of renders to avoid closures issues
    const isPlayingRef = useRef(false);

    useEffect(() => {
        if (id) {
            getBook(id).then(b => {
                setBook(b || null);
                setLoading(false);
            });
        }
    }, [id]);

    // Cleanup TTS on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    // Sync ref
    useEffect(() => {
        isPlayingRef.current = isPlaying;
        if (!isPlaying) {
            window.speechSynthesis.cancel();
        } else {
            // If we just started playing, trigger speech for current page
            // But only if not already speaking? 
            // Actually, simplest is to cancel and restart logic.
            speakCurrentPage();
        }
    }, [isPlaying]);

    // Handle page change while playing
    useEffect(() => {
        if (isPlaying) {
            speakCurrentPage();
        }
    }, [pageIndex]);

    const speakCurrentPage = () => {
        if (!book) return;

        // Cancel any current speech
        window.speechSynthesis.cancel();

        const page = book.pages[pageIndex];
        if (!page || !page.content) {
            // No content? Maybe just auto skip or stop?
            // If image only, maybe nothing to read.
            // If there's a caption, maybe read that?
            // Let's read content then caption.
            const textToRead = [page.content, page.caption].filter(Boolean).join('. ');

            if (!textToRead) {
                // Nothing to read, wait a bit then next page
                if (isPlayingRef.current) {
                    setTimeout(() => {
                        if (isPlayingRef.current) nextPage();
                    }, 2000);
                }
                return;
            }

            const utterance = new SpeechSynthesisUtterance(textToRead);
            utterance.onend = () => {
                // Only advance if still playing
                if (isPlayingRef.current) {
                    nextPage();
                }
            };

            // Error handling
            utterance.onerror = (e) => {
                console.error("TTS Error:", e);
                setIsPlaying(false);
            };

            window.speechSynthesis.speak(utterance);
            return;
        }

        const text = page.content + (page.caption ? `. ${page.caption}` : '');
        const utterance = new SpeechSynthesisUtterance(text);

        utterance.onend = () => {
            if (isPlayingRef.current) {
                nextPage();
            }
        };

        window.speechSynthesis.speak(utterance);
    };

    const nextPage = () => {
        if (book && pageIndex < book.pages.length - 1) {
            setPageIndex(p => p + 1);
        } else {
            // End of book
            setIsPlaying(false);
        }
    };

    const prevPage = () => {
        if (pageIndex > 0) {
            setPageIndex(p => p - 1);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                nextPage();
            } else if (e.key === 'ArrowLeft') {
                prevPage();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [book, pageIndex]); // Re-bind when pageIndex changes to ensure closure captures new state if needed, though state updater form is safer.


    if (loading) return <div>Loading...</div>;
    if (!book) return <div>Book not found</div>;

    const currentPage = book.pages[pageIndex];

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
            {/* Header */}
            <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                <Link to="/" style={{ color: '#333', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                    <ArrowLeft size={20} style={{ marginRight: '5px' }} /> Library
                </Link>

                <button onClick={() => setIsPlaying(!isPlaying)} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    backgroundColor: isPlaying ? '#ffebee' : '#e3f2fd',
                    color: isPlaying ? '#c62828' : '#1565c0',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    cursor: 'pointer' // Explicitly set cursor since we disabled it globally
                }}>
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    {isPlaying ? "Pause Read" : "Read Aloud"}
                </button>

                <span style={{ fontWeight: 600, color: '#888' }}>{book.title}</span>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative' }}>

                {/* Left Nav Area */}
                <div
                    onClick={prevPage}
                    style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0, width: '15%',
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: '1rem',
                        cursor: pageIndex > 0 ? 'pointer' : 'default',
                        opacity: 0 // Invisible but clickable areas, or maybe hint on hover?
                    }}
                    title="Previous Page"
                >
                    {/* We can make a visible arrow on hover or always if requested. */}
                </div>

                {/* Visible Nav Buttons (Floating or simple) */}
                {pageIndex > 0 && (
                    <button
                        onClick={prevPage}
                        style={{ position: 'absolute', left: '20px', backgroundColor: 'transparent', border: 'none', padding: '20px' }}
                    >
                        <ChevronLeft size={40} color="#ccc" />
                    </button>
                )}

                <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
                    {currentPage ? (
                        <div style={{ animation: 'fadeIn 0.5s' }}>
                            {currentPage.image && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <img
                                        src={currentPage.image}
                                        alt="Page Illustration"
                                        style={{ maxWidth: '100%', maxHeight: '50vh', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                    />
                                    {currentPage.caption && (
                                        <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                            {currentPage.caption}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ fontSize: '1.4rem', lineHeight: '1.8', whiteSpace: 'pre-wrap', textAlign: 'left', userSelect: 'none', cursor: 'default' }}>
                                {currentPage.content}
                            </div>
                        </div>
                    ) : (
                        <div>Empty Page</div>
                    )}
                </div>

                {pageIndex < book.pages.length - 1 && (
                    <button
                        onClick={nextPage}
                        style={{ position: 'absolute', right: '20px', backgroundColor: 'transparent', border: 'none', padding: '20px' }}
                    >
                        <ChevronRight size={40} color="#ccc" />
                    </button>
                )}
                {/* Right Nav Area */}
                <div
                    onClick={nextPage}
                    style={{
                        position: 'absolute', right: 0, top: 0, bottom: 0, width: '15%',
                        cursor: pageIndex < book.pages.length - 1 ? 'pointer' : 'default',
                    }}
                    title="Next Page"
                />

            </div>

            {/* Footer Controls */}
            <div style={{ padding: '1rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9', height: '50px' }}>
                <div style={{ color: '#888', fontWeight: 500 }}>
                    {pageIndex + 1} / {book.pages.length}
                </div>
            </div>
        </div>
    );
}
