export interface Material {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  thumbnail: string;
  thumbnailPath: string;
  originalPath: string;
  width: number;
  height: number;
  fileSize?: number;
  description?: string;
  createdAt?: string;
}

export interface MaterialsData {
  items: Material[];
  categories: string[];
  tags: string[];
}
