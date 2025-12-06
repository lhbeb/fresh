export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          price: number;
          rating: number;
          review_count: number;
          images: string[];
          condition: string;
          category: string;
          brand: string;
          payee_email: string;
          currency: string;
          checkout_link: string;
          reviews: any; // JSONB type
          meta: any; // JSONB type
          in_stock: boolean;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description: string;
          price: number;
          rating?: number;
          review_count?: number;
          images: string[];
          condition: string;
          category: string;
          brand: string;
          payee_email: string;
          currency?: string;
          checkout_link: string;
          reviews?: any;
          meta?: any;
          in_stock?: boolean;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string;
          price?: number;
          rating?: number;
          review_count?: number;
          images?: string[];
          condition?: string;
          category?: string;
          brand?: string;
          payee_email?: string;
          currency?: string;
          checkout_link?: string;
          reviews?: any;
          meta?: any;
          in_stock?: boolean;
          is_featured?: boolean;
          updated_at?: string;
        };
      };
    };
  };
}

