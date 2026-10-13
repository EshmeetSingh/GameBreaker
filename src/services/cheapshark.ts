import type { Game, StoreOffer } from "../types/game";

type CheapSharkDeal = {
  gameID: string;
  title: string;
  thumb: string;
  storeID: string;
  salePrice: string;
  normalPrice: string;
  savings: string;
  steamRatingPercent: string;
  steamRatingCount: string;
  dealID: string;
};

type CheapSharkStore = {
  storeID: string;
  storeName: string;
};

type CheapSharkGameDetails = {
  cheapestPriceEver: {
    price: string;
  };
};

async function getStores(): Promise<CheapSharkStore[]> {
  const response = await fetch("https://www.cheapshark.com/api/1.0/stores");

  if (!response.ok) {
    throw new Error("Failed to fetch stores.");
  }

  return response.json();
}

export async function getHistoricalLow(gameId: string): Promise<number> {
  const response = await fetch(
    `https://www.cheapshark.com/api/1.0/games?id=${gameId}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch historical low.");
  }

  const data: CheapSharkGameDetails = await response.json();

  return Number(data.cheapestPriceEver.price);
}

function normalizeOffer(
  deal: CheapSharkDeal,
  storeNames: Record<string, string>,
): StoreOffer {
  return {
    storeId: deal.storeID,
    storeName: storeNames[deal.storeID] ?? "Unknown Store",
    currentPrice: Number(deal.salePrice),
    normalPrice: Number(deal.normalPrice),
    discountPercent: Number(deal.savings),
    dealURL: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
  };
}

async function normalizeDeals(
  deals: CheapSharkDeal[],
  stores: CheapSharkStore[],
): Promise<Game[]> {
  const storeNames = Object.fromEntries(
    stores.map((store) => [store.storeID, store.storeName]),
  );

  const gamesById = deals.reduce<Record<string, Game>>((games, deal) => {
    const gameId = deal.gameID;
    const offer = normalizeOffer(deal, storeNames);

    if (!games[gameId]) {
      games[gameId] = {
        id: gameId,
        title: deal.title,
        image: deal.thumb,
        rating: Number(deal.steamRatingPercent),
        ratingCount: Number(deal.steamRatingCount),
        offers: [offer],
      };
    } else {
      games[gameId].offers.push(offer);
    }

    return games;
  }, {});

  const games = Object.values(gamesById);

  return Promise.all(
    games.map(async (game) => ({
      ...game,
      historicalLow: await getHistoricalLow(game.id),
    })),
  );
}

export async function getDeals(): Promise<Game[]> {
  const [dealsResponse, stores] = await Promise.all([
    fetch("https://www.cheapshark.com/api/1.0/deals?pageSize=60"),
    getStores(),
  ]);

  if (!dealsResponse.ok) {
    throw new Error("Failed to fetch deals. Try Again.");
  }

  const deals: CheapSharkDeal[] = await dealsResponse.json();

  return normalizeDeals(deals, stores);
}
