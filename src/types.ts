export interface Page {
  id: string;
  content: string;
  image?: string; // Data URI
  caption?: string;
}

export interface Book {
  id: string;
  title: string;
  coverImage: string; // Data URI
  pages: Page[];
  createdAt: number;
}
