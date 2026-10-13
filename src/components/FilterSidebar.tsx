import type React from "react";

import "./FilterSidebar.css";

type FilterSidebarProps = {
  stores: Set<string>;
  selectedStore: string | undefined;
  minimumRating: number;
  onStoreChange: (storeName: string | undefined) => void;
  onRatingChange: (rating: number) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
};

function FilterSidebar({
  stores,
  selectedStore,
  minimumRating,
  onStoreChange,
  onRatingChange,
  onApplyFilters,
  onResetFilters,
}: FilterSidebarProps) {
  function handleRatingChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    onRatingChange(Number(event.target.value));
  }
  return (
    <aside className="filter-sidebar">
      <h2>Filters</h2>
      <label htmlFor="store-select">Stores:</label>
      <select
        name="stores"
        id="store-select"
        value={selectedStore ?? ""}
        onChange={(event) => onStoreChange(event.target.value || undefined)}
      >
        <option value="">All Stores</option>
        {Array.from(stores).map((store) => (
          <option key={store} value={store}>
            {store}
          </option>
        ))}
      </select>
      <label htmlFor="minimum-rating">
        Min. Rating: {minimumRating > 0 ? `${minimumRating}%` : ""}
      </label>
      <input
        type="range"
        id="minimum-rating"
        min={0}
        max={100}
        step={1}
        value={minimumRating}
        onChange={handleRatingChange}
      />
      <div className="sidebar-buttons">
        <button type="button" className="button" onClick={onApplyFilters}>
          Apply
        </button>
        <button type="button" className="button" onClick={onResetFilters}>
          Reset
        </button>
      </div>
    </aside>
  );
}

export default FilterSidebar;
