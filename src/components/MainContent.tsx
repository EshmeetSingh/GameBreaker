import GameCard from "./GameCard";
import type { Game } from "../types/game";

import "./MainContent.css";

type MainContentProps = {
  isLoading: boolean;
  hasGames: boolean;
  freeGames: Game[];
  bestDeals: Game[];
  visibleGames: Game[];
  usdToInrRate: number | undefined;
  onShowFreeGames: () => void;
  onShowBestDeals: () => void;
  onGameSelect: (game: Game) => void;
  onClearFilters: () => void;
};

function MainContent({
  isLoading,
  hasGames,
  freeGames,
  bestDeals,
  visibleGames,
  usdToInrRate,
  onShowFreeGames,
  onShowBestDeals,
  onGameSelect,
  onClearFilters,
}: MainContentProps) {
  if (isLoading) {
    return (
      <div className="games-content">
        <section>
          <h2>Free Games</h2>
        </section>

        <section>
          <h2>Best Deals</h2>
        </section>

        <section>
          <h2>Games</h2>

          <div className="grid-type-buttons">
            <button onClick={onShowFreeGames}>Free Games</button>
            <button onClick={onShowBestDeals}>Best Deals</button>
          </div>

          <div className="game-grid">
            {Array.from({ length: 8 }).map((_, index) => (
              <div className="game-card skeleton-card" key={index}>
                <div className="skeleton-image"></div>
                <div className="skeleton-title"></div>
                <div className="skeleton-deal"></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  } else if (!hasGames) {
    return (
      <div className="empty-state">
        <h2>No games match your current filters.</h2>
        <button className="button" onClick={onClearFilters}>Clear Filters</button>
      </div>
    );
  } else {
    return (
      <div className="games-content">
        <section>
          <h2>Free Games</h2>

          <div className="free-game-carousel">
            {freeGames.map((freeGame) => (
              <GameCard
                key={freeGame.id}
                game={freeGame}
                usdToInrRate={usdToInrRate}
                onClick={onGameSelect}
              />
            ))}
          </div>
        </section>

        <section>
          <h2>Best Deals</h2>

          <div className="best-deals-carousel">
            {bestDeals.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                usdToInrRate={usdToInrRate}
                onClick={onGameSelect}
              />
            ))}
          </div>
        </section>

        <section>
          <h2>Games</h2>

          <div className="grid-type-buttons">
            <button onClick={onShowFreeGames}>Free Games</button>
            <button onClick={onShowBestDeals}>Best Deals</button>
          </div>

          <div className="game-grid">
            {visibleGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                usdToInrRate={usdToInrRate}
                onClick={onGameSelect}
              />
            ))}
          </div>
        </section>
      </div>
    );
  }
}

export default MainContent;