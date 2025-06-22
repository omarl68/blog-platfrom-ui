export interface Article {
  _id?: string;
  title: string;
  content: string;
  image?: string;
  tags: string[];
  author: string;
  authorName?: string;
  views: number;
  likes: number;
  shares: number;
  status: ArticleStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published'
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  tags?: string[];
  status?: ArticleStatus;
  image?: File;
}

export interface UpdateArticleRequest {
  title?: string;
  content?: string;
  tags?: string[];
  status?: ArticleStatus;
  image?: File;
}

export interface Comment {
  _id?: string;
  content: string;
  article: string;
  author: string;
  authorName?: string;
  parent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentRequest {
  content: string;
  parent?: string;
}

export interface UpdateCommentRequest {
  content?: string;
  parent?: string;
} 