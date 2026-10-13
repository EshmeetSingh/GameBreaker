import { useState } from "react";
import type React from "react";

import "./Header.css";

type HeaderProps = {
  searchError?: string;
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSearch: (query: string) => void;
};

function Header({
  searchError,
  isDarkMode,
  setIsDarkMode,
  setIsSidebarOpen,
  onSearch,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    onSearch(searchQuery);
  }

  function handleSidebarToggle(): void {
    setIsSidebarOpen((previous) => !previous);
  }

  function handleDarkModeToggle(): void {
    setIsDarkMode((previous) => !previous);
  }

  return (
    <header>
      <button
        type="button"
        className="button sidebar-toggle"
        onClick={handleSidebarToggle}
        aria-label="Toggle sidebar"
      >
        Sidebar
      </button>

      <h1 className="brand">GameBreaker</h1>

      <div className="header-actions">
        <form className="search" onSubmit={handleSubmit}>
          <input
            id="game-search"
            type="search"
            aria-label="Search games"
            placeholder="Search Games..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />

          <button type="submit" className="button">Search</button>
        </form>

        {searchError && <p role="alert">{searchError}</p>}

        <button
          type="button"
          className="button dark-mode-toggle"
          onClick={handleDarkModeToggle}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </header>
  );
}

export default Header;
