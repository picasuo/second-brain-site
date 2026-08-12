export type TableOfContentsItem = { depth: 2 | 3; id: string; text: string };

export type PublishedNote = { title: string; date: string; filename: string; tags: string[]; noteUrl: string; renderedContent: string; tableOfContents: TableOfContentsItem[] };

export const publishedNotes: PublishedNote[] = [];
