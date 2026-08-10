import React from 'react'
import styles from './Filters.module.css'

export default function Filters({
  categories,
  selectedCategories,
  onCategoryChange,
  minPrice,
  maxPrice,
  onMinPrice,
  onMaxPrice,
}) {
  const toggleCategory = (slug) => {
    if (selectedCategories.includes(slug)) {
      onCategoryChange(selectedCategories.filter((c) => c !== slug))
    } else {
      onCategoryChange([...selectedCategories, slug])
    }
  }

  return (
    <div className={styles.filters}>
      <div className={styles.group}>
        <p className={styles.groupLabel}>Product Categories</p>
        <div className={styles.chips}>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              className={`${styles.chip} ${selectedCategories.includes(cat.slug) ? styles.chipActive : ''}`}
              onClick={() => toggleCategory(cat.slug)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {selectedCategories.length > 0 && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => onCategoryChange([])}
          >
            Clear categories
          </button>
        )}
      </div>

      <div className={styles.group}>
        <p className={styles.groupLabel}>Price Range</p>
        <div className={styles.priceRow}>
          <label className={styles.priceField}>
            <span>Min $</span>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={minPrice}
              onChange={(e) => onMinPrice(e.target.value)}
            />
          </label>
          <span className={styles.priceSep}>–</span>
          <label className={styles.priceField}>
            <span>Max $</span>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => onMaxPrice(e.target.value)}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
