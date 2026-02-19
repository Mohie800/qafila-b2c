export interface FaqCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  sortOrder: number;
  isActive: boolean;
  _count: {
    faqs: number;
  };
  faqs?: Faq[];
  createdAt: string;
  updatedAt: string;
}

export interface Faq {
  id: string;
  categoryId: string;
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
  sortOrder: number;
  isActive: boolean;
  category?: {
    id: string;
    nameEn: string;
    nameAr: string;
  };
  createdAt: string;
  updatedAt: string;
}
