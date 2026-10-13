export type StoreOffer = {
  storeId: string;
  storeName: string;
  currentPrice: number;
  normalPrice: number;
  discountPercent: number;
  dealURL: string;
};

export type Game = {
  id: string;
  title: string;
  image: string;
  rating: number;
  ratingCount: number;
  description?: string;
  developer?: string;
  genres?: string[];
  historicalLow?: number;
  offers: StoreOffer[];
};
