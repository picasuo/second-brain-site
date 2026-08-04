export type PublishedNote = {
  title: string;
  date: string;
  tags: string[];
  noteUrl: string;
  renderedContent: string;
  tableOfContents: TableOfContentsItem[];
};

export type TableOfContentsItem = {
  depth: 2 | 3;
  id: string;
  text: string;
};

export const publishedNotes: PublishedNote[] = [];
