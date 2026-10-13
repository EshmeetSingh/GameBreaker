import { useEffect, useMemo, useState } from "react";

import Header from "./components/Header";
import FilterSidebar from "./components/FilterSidebar";
import MainContent from "./components/MainContent";
import GameDetailsPanel from "./components/GameDetailsPanel";
import Footer from "./components/Footer";

import { getDeals } from "./services/cheapshark";
import { getUsdToInrRate } from "./services/currency";
import {
  filterGames,
  findGame,
  getBestGameToday,
  getFreeGames,
  getBestDeals,
  getStores,
} from "./services/game";

import type { Game } from "./types/game";

import "./App.css";

function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [usdToInrRate, setUsdToInrRate] = useState<number>();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showFreeGames, setShowFreeGames] = useState(false);
  const [bestGameToday, setBestGameToday] = useState<Game>();
  const [selectedGame, setSelectedGame] = useState<Game>();
  const [isGameSelected, setIsGameSelected] = useState<boolean>(false);
  const [pendingStore, setPendingStore] = useState<string>();
  const [activeStore, setActiveStore] = useState<string>();
  const [pendingRating, setPendingRating] = useState<number>(0);
  const [activeRating, setActiveRating] = useState<number>(0);
  const [searchError, setSearchError] = useState<string>();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  async function fetchGames() {
    const games = await getDeals();
    setGames(games);

    const rate = await getUsdToInrRate();
    setUsdToInrRate(rate);
  }

  useEffect(() => {
    async function loadGames() {
      try {
        setError(null);
        setIsLoading(true);

        await fetchGames();
      } catch (e) {
        setError(String(e));
      } finally {
        setIsLoading(false);
      }
    }

    loadGames();
  }, []);

  async function handleRetry() {
    try {
      setError(null);
      setIsLoading(true);

      await fetchGames();
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  }

  const filteredGames = useMemo(
    () => filterGames(games, activeStore, activeRating),
    [games, activeStore, activeRating],
  );

  useEffect(() => {
    let cancelled = false;

    async function updateBestGame() {
      const bestGame = await getBestGameToday(filteredGames);

      if (!cancelled) {
        setBestGameToday(bestGame);
        setSelectedGame(bestGame);
      }
    }

    updateBestGame();

    return () => {
      cancelled = true;
    };
  }, [filteredGames]);

  const freeGames = getFreeGames(filteredGames);
  const bestDeals = getBestDeals(filteredGames);
  const stores = getStores(games);
  const visibleGames = showFreeGames ? freeGames : bestDeals;

  function selectGame(game: Game): void {
    setSelectedGame(game);
    setIsGameSelected(true);
  }

  function showFreeGamesView(): void {
    setShowFreeGames(true);
  }

  function showBestDealsView(): void {
    setShowFreeGames(false);
  }

  function handleSearch(query: string): void {
    const match = findGame(games, query);

    if (match) {
      setSearchError(undefined);
      selectGame(match);
      return;
    }

    setSearchError(`No deals found for "${query.trim()}".`);
  }

  function handleClose(): void {
    setSelectedGame(bestGameToday);
    setIsGameSelected(false);
  }

  function handleApplyFilters(): void {
    setActiveStore(pendingStore);
    setActiveRating(pendingRating);
    setIsGameSelected(false);
  }

  function handleResetFilters(): void {
    setPendingStore(undefined);
    setActiveStore(undefined);
    setPendingRating(0);
    setActiveRating(0);
    setIsGameSelected(false);
  }

  if (error) {
    return (
      <div className={isDarkMode ? "app dark-mode error-page" : "app error-page"}>
        <main className="error-content" role="alert">
          <h1>Oops! Something went wrong.</h1>
          <p>{error}</p>
          <button className="button" onClick={handleRetry}>
            Retry
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? "app dark-mode" : "app"}>
      <Header
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        setIsSidebarOpen={setIsSidebarOpen}
        searchError={searchError}
        onSearch={handleSearch}
      />

      <main className="main-layout">
        {isSidebarOpen && (
          <>
            <div className="sidebar-backdrop" />

            <FilterSidebar
              stores={stores}
              selectedStore={pendingStore}
              minimumRating={pendingRating}
              onStoreChange={setPendingStore}
              onRatingChange={setPendingRating}
              onApplyFilters={handleApplyFilters}
              onResetFilters={handleResetFilters}
            />
          </>
        )}

        <section className="content-layout">
          <MainContent
            isLoading={isLoading}
            hasGames={filteredGames.length > 0}
            freeGames={freeGames}
            bestDeals={bestDeals}
            visibleGames={visibleGames}
            usdToInrRate={usdToInrRate}
            onShowFreeGames={showFreeGamesView}
            onShowBestDeals={showBestDealsView}
            onGameSelect={selectGame}
            onClearFilters={handleResetFilters}
          />

          <GameDetailsPanel
            game={selectedGame}
            usdToInrRate={usdToInrRate}
            isGameSelected={isGameSelected}
            onClose={handleClose}
            onResetFilters={handleResetFilters}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
