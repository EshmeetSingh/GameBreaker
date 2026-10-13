import type { Game } from "../types/game";
import { getCheapestOffer } from "../services/game";

import "./GameCard.css";

type GameCardProps = {
  game: Game;
  usdToInrRate?: number;
  onClick: (game: Game) => void;
};

function GameCard({ game, usdToInrRate, onClick }: GameCardProps) {
  const cheapestOffer = getCheapestOffer(game);
  const currentPriceInr = usdToInrRate
    ? cheapestOffer.currentPrice * usdToInrRate
    : undefined;

  function handleClick(): void {
    onClick(game);
  }

  return (
    <button type="button" className="game-card" onClick={handleClick}>
      <div className="game-card-image-backdrop">
        <img className="game-card-image" src={game.image} alt={game.title} />
      </div>
      <div className="game-card-content">
        <h2 className="game-card-title">{game.title}</h2>
        <p className="game-card-deal">
          {cheapestOffer.currentPrice === 0
            ? "FREE"
            : currentPriceInr !== undefined
              ? `₹${currentPriceInr.toFixed(2)} • ${cheapestOffer.discountPercent.toFixed(2)}% OFF`
              : "Loading price..."}
        </p>
      </div>
    </button>
  );
}

export default GameCard;
