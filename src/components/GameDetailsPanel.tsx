import { useEffect, useState } from "react";

import { getHistoricalLow } from "../services/cheapshark";
import { getRawgMetadata, type RawgMetadata } from "../services/rawg";
import { getCheapestOffer } from "../services/game";

import type { Game } from "../types/game";

import "./GameDetailsPanel.css";

type GameDetailsPanelProps = {
  game?: Game;
  usdToInrRate?: number;
  isGameSelected: boolean;
  onClose: () => void;
  onResetFilters: () => void;
};

function cleanDescription(description: string): string {
  const parser = new DOMParser();
  const descriptionDoc = parser.parseFromString(description, "text/html");

  return descriptionDoc.body.textContent ?? "";
}

function GameDetailsPanel({
  game,
  usdToInrRate,
  isGameSelected,
  onClose,
  onResetFilters,
}: GameDetailsPanelProps) {
  const [historicalLow, setHistoricalLow] = useState<{
    gameId: string;
    value: number;
  }>();

  const [rawgMetadata, setRawgMetadata] = useState<{
    gameId: string;
    metadata: RawgMetadata;
  }>();

  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);

  useEffect(() => {
    if (!game) {
      return;
    }

    let cancelled = false;

    const gameId = game.id;
    const title = game.title;
    const store = getCheapestOffer(game).storeName;

    async function loadHistoricalLow(): Promise<void> {
      try {
        const low = await getHistoricalLow(gameId);

        if (!cancelled) {
          setHistoricalLow({ gameId, value: low });
        }
      } catch (error) {
        console.error("Failed to load Historical Low:", error);
      }
    }

    async function loadRawgMetadata(): Promise<void> {
      try {
        const metadata = await getRawgMetadata(title, store);

        if (!cancelled && metadata) {
          setRawgMetadata({ gameId, metadata });
        }
      } catch (error) {
        console.error("Failed to load RAWG metadata:", error);
      }
    }

    loadHistoricalLow();
    loadRawgMetadata();

    return () => {
      cancelled = true;
    };
  }, [game]);

  const cheapestOffer = game ? getCheapestOffer(game) : undefined;

  const currentPriceInr =
    cheapestOffer && usdToInrRate
      ? cheapestOffer.currentPrice * usdToInrRate
      : undefined;

  const otherOffers =
    game && cheapestOffer
      ? game.offers.filter((offer) => offer.storeId !== cheapestOffer.storeId)
      : [];

  return (
    <aside className="best-game-today">
      <h2>{isGameSelected ? "Game Details" : "Best Game Today"}</h2>

      {!game && (
        <div className="empty-state">
          <p>No standout game found.</p>

          <button type="button" className="button" onClick={onResetFilters}>
            Clear Filters
          </button>
        </div>
      )}

      {game && cheapestOffer && (
        <>
          {isGameSelected && (
            <button
              type="button"
              className="button game-details-back"
              onClick={onClose}
            >
              Back
            </button>
          )}

          <div className="game-details-image-backdrop">
            {/* Game identity */}
            <img
              className="game-details-image "
              src={game.image}
              alt={game.title}
            />
          </div>

          <div className="game-details-content">
            <h2 className="game-details-title">{game.title}</h2>
            <div className="game-details-grid">
              <div className="game-details-overview">
                {rawgMetadata?.gameId === game.id &&
                  rawgMetadata.metadata.description && (
                    <>
                      <p
                        className={`game-details-description ${
                          expandedGameId === game.id ? "expanded" : ""
                        }`}
                      >
                        {cleanDescription(rawgMetadata.metadata.description)}
                      </p>
                      <button
                        type="button"
                        className="button game-details-description-toggle"
                        onClick={() =>
                          setExpandedGameId(
                            expandedGameId === game.id ? null : game.id,
                          )
                        }
                      >
                        {expandedGameId === game.id ? "See less" : "See more"}
                      </button>
                    </>
                  )}
              </div>

              <div className="game-details-primary-deal">
                {/* Primary deal */}
                <p>
                  {cheapestOffer.currentPrice === 0
                    ? "FREE"
                    : currentPriceInr !== undefined
                      ? `₹${currentPriceInr.toFixed(2)} • ${cheapestOffer.discountPercent.toFixed(2)}% OFF`
                      : "Loading price..."}
                </p>

                <p>{cheapestOffer.storeName}</p>

                <a
                  href={cheapestOffer.dealURL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Deal
                </a>
              </div>

              <div className="game-details-information">
                {/* Game information */}
                <p>
                  Rating:{" "}
                  {game.rating > 0
                    ? `${game.rating}% (${game.ratingCount.toLocaleString()} reviews)`
                    : "Not available"}
                </p>

                <p>
                  Historical Low:{" "}
                  {historicalLow?.gameId === game.id && usdToInrRate
                    ? `₹${(historicalLow.value * usdToInrRate).toFixed(2)}`
                    : "Loading price..."}
                </p>

                {rawgMetadata?.gameId === game.id &&
                  rawgMetadata.metadata.developer && (
                    <p>Developer: {rawgMetadata.metadata.developer}</p>
                  )}
              </div>
            </div>

            <div className="game-details-other-offers">
              {/* Other store offers */}
              <p>Other Store Offers:</p>

              {otherOffers.length > 0 && usdToInrRate ? (
                otherOffers.map((offer) => (
                  <p key={offer.storeId}>
                    {offer.storeName} •{" "}
                    {`₹${(offer.currentPrice * usdToInrRate).toFixed(2)}`} •{" "}
                    {`${offer.discountPercent.toFixed(2)}% OFF`} •{" "}
                    <a
                      href={offer.dealURL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Deal
                    </a>
                  </p>
                ))
              ) : (
                <p>No Other Store Offers available</p>
              )}
            </div>
          </div>
        </>
      )}
    </aside>
  );
}

export default GameDetailsPanel;
