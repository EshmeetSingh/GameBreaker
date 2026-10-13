import { getHistoricalLow } from "./cheapshark";
import type { Game, StoreOffer } from "../types/game";

export function getCheapestOffer(game: Game): StoreOffer {
  return game.offers.reduce((cheapest, offer) =>
    offer.currentPrice < cheapest.currentPrice ? offer : cheapest,
  );
}

async function getHistoricalLowGames(games: Game[]): Promise<Game[]> {
  const historicalLows: Array<{ game: Game; historicalLow: number }> =
    await Promise.all(
      games.map(async (game) => ({
        game,
        historicalLow: await getHistoricalLow(game.id),
      })),
    );

  return historicalLows
    .filter(
      ({ game, historicalLow }) =>
        getCheapestOffer(game).currentPrice <= historicalLow,
    )
    .map(({ game }) => game);
}

function getMostPopularGame(games: Game[]): Game | undefined {
  return games.reduce<Game | undefined>((strongest, game) => {
    if (!strongest || game.ratingCount > strongest.ratingCount) {
      return game;
    }

    return strongest;
  }, undefined);
}

function getMostDiscountedGame(games: Game[]): Game | undefined {
  return games.reduce<Game | undefined>((strongest, game) => {
    const currentOffer = getCheapestOffer(game);

    if (!strongest) {
      return game;
    }

    const strongestOffer = getCheapestOffer(strongest);

    if (currentOffer.discountPercent > strongestOffer.discountPercent) {
      return game;
    }

    return strongest;
  }, undefined);
}

export async function getBestGameToday(
  games: Game[],
): Promise<Game | undefined> {
  const eligibleGames = games.filter((game) => game.ratingCount >= 500);
  const historicalLowGames = await getHistoricalLowGames(eligibleGames);
  const freeGames = eligibleGames.filter((game) =>
    game.offers.some((offer) => offer.currentPrice === 0),
  );

  const strongestHistoricalLowGame = getMostPopularGame(historicalLowGames);
  const strongestFreeGame = getMostPopularGame(freeGames);
  const strongestDiscountGame = getMostDiscountedGame(eligibleGames);

  return (
    strongestFreeGame ?? strongestHistoricalLowGame ?? strongestDiscountGame
  );
}

export function filterGames(
  games: Game[],
  activeStore: string | undefined,
  activeRating: number,
): Game[] {
  return games
    .filter((game) => {
      return (
        (!activeRating || game.rating >= activeRating) &&
        (!activeStore ||
          game.offers.some((offer) => offer.storeName === activeStore))
      );
    })
    .map((game) => ({
      ...game,
      offers: activeStore
        ? game.offers.filter((offer) => offer.storeName === activeStore)
        : game.offers,
    }));
}

export function getFreeGames(games: Game[]): Game[] {
  return games
    .filter((game) => game.offers.some((offer) => offer.currentPrice === 0))
    .sort((a, b) => b.ratingCount - a.ratingCount);
}

export function getBestDeals(games: Game[]): Game[] {
  return games
    .filter((game) => !game.offers.some((offer) => offer.currentPrice === 0))
    .sort((a, b) => {
      const aIsHistoricalLow =
        getCheapestOffer(a).currentPrice <= (a.historicalLow ?? Infinity);
      const bIsHistoricalLow =
        getCheapestOffer(b).currentPrice <= (b.historicalLow ?? Infinity);

      if (aIsHistoricalLow !== bIsHistoricalLow) {
        return Number(bIsHistoricalLow) - Number(aIsHistoricalLow);
      }

      return (
        getCheapestOffer(b).discountPercent -
        getCheapestOffer(a).discountPercent
      );
    });
}

export function getStores(games: Game[]): Set<string> {
  return new Set(
    games.flatMap((game) => game.offers.map((offer) => offer.storeName)),
  );
}

export function findGame(games: Game[], query: string): Game | undefined {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery === "") {
    return;
  }

  const exactMatch = games.find(
    (game) => game.title.trim().toLowerCase() === normalizedQuery,
  );

  const startsWithMatch = games.find((game) =>
    game.title.trim().toLowerCase().startsWith(normalizedQuery),
  );

  const containsMatch = games.find((game) =>
    game.title.trim().toLowerCase().includes(normalizedQuery),
  );

  return exactMatch ?? startsWithMatch ?? containsMatch;
}
