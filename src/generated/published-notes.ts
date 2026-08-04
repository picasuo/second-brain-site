export type PublishedNote = {
  title: string;
  date: string;
  tags: string[];
  noteUrl: string;
  renderedContent: string;
};

export const publishedNotes: PublishedNote[] = [];
