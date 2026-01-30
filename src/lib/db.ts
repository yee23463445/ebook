import { openDB, type DBSchema } from 'idb';
import type { Book } from '../types';
import { defaultBooks } from '../data/defaultBooks';

interface EbookDB extends DBSchema {
    books: {
        key: string;
        value: Book;
    };
}

const DB_NAME = 'ebook-db';
const STORE_NAME = 'books';

export async function initDB() {
    return openDB<EbookDB>(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        },
    });
}

export async function getAllBooks(): Promise<Book[]> {
    const db = await initDB();
    return db.getAll(STORE_NAME);
}

export async function getBook(id: string): Promise<Book | undefined> {
    const db = await initDB();
    return db.get(STORE_NAME, id);
}

export async function saveBook(book: Book): Promise<string> {
    const db = await initDB();
    await db.put(STORE_NAME, book);
    return book.id;
}

export async function deleteBook(id: string): Promise<void> {
    const db = await initDB();
    await db.delete(STORE_NAME, id);
}

export async function initializeDefaultBooks(): Promise<void> {
    const db = await initDB();
    const count = await db.count(STORE_NAME);

    if (count === 0) {
        const baseUrl = import.meta.env.BASE_URL;

        // Process paths to correct URL
        const booksToAdd = defaultBooks.map(book => ({
            ...book,
            coverImage: book.coverImage ? `${baseUrl}${book.coverImage}` : '',
            pages: book.pages.map(p => ({
                ...p,
                image: p.image ? `${baseUrl}${p.image}` : undefined
            }))
        }));

        const tx = db.transaction(STORE_NAME, 'readwrite');
        await Promise.all(booksToAdd.map(book => tx.store.put(book)));
        await tx.done;
    }
}
