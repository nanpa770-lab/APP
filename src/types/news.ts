export type NewsCategory =
  | 'politics'
  | 'economy'
  | 'society'
  | 'world'
  | 'tech'
  | 'culture'
  | 'sports';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  category: NewsCategory;
  source: string;
  imageUrl?: string;
}

export interface NewsResponse {
  articles: NewsArticle[];
  totalCount: number;
  lastUpdated: string;
}

export interface NewsFilter {
  category?: NewsCategory;
  keyword?: string;
  limit?: number;
}
