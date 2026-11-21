export type ArticleStatus = 'draft' | 'in_review' | 'published' | 'archived';

export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  status: ArticleStatus;
  organizationId: string;
  authorId: string;
  publishedAt: string | null;
  version: number;
  imageUrl?: string;
}
