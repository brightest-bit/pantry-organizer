import React from 'react'
import styles from './Results.module.css'

function ProductCard({ product }) {
  return (
    <div className={styles.card}>
      <img
        src={product.image_url}
        alt={product.name}
        className={styles.cardImg}
        loading="lazy"
      />
      <div className={styles.cardBody}>
        <span className={styles.categoryBadge}>{product.category_label}</span>
        <h4 className={styles.cardName}>{product.name}</h4>
        <p className={styles.cardDesc}>{product.description}</p>

        <div className={styles.cardDims}>
          <span title="Width">W {product.dimensions.width}"</span>
          <span title="Depth">D {product.dimensions.depth}"</span>
          <span title="Height">H {product.dimensions.height}"</span>
        </div>

        <div className={styles.cardFit}>
          <span className={styles.fitPill}>
            {product.quantity_side_by_side}× side-by-side
          </span>
          <span className={styles.fitPill}>
            {product.quantity_front_to_back}× front-to-back
          </span>
        </div>

        <div className={styles.cardFooter}>
          <span className={styles.price}>${product.price.toFixed(2)}</span>
          <a
            href={product.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.buyBtn}
          >
            View on Amazon →
          </a>
        </div>
      </div>
    </div>
  )
}

function ShelfResult({ shelf }) {
  const { shelf_number, shelf_dimensions, usable_height, matches } = shelf

  return (
    <section className={styles.shelfSection}>
      <div className={styles.shelfHeader}>
        <div>
          <h3 className={styles.shelfTitle}>Shelf {shelf_number}</h3>
          <p className={styles.shelfDims}>
            {shelf_dimensions.width}" W × {shelf_dimensions.depth}" D × {shelf_dimensions.height}" H
            {shelf_dimensions.lip_height > 0 && (
              <> · Lip {shelf_dimensions.lip_height}" · Usable height {usable_height}"</>
            )}
          </p>
        </div>
        <span className={styles.matchCount}>{matches.length} match{matches.length !== 1 ? 'es' : ''}</span>
      </div>

      {matches.length === 0 ? (
        <p className={styles.noMatches}>
          No products found for these dimensions. Try adjusting your filters or checking your measurements.
        </p>
      ) : (
        <div className={styles.cards}>
          {matches.map((product, i) => (
            <div key={product.id} className={styles.cardWrapper}>
              {i === 0 && <div className={styles.topPickBadge}>Top Pick</div>}
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default function Results({ results, onReset }) {
  return (
    <div className={styles.results}>
      <div className={styles.resultsHeader}>
        <div>
          <h2 className={styles.resultsTitle}>Your Recommendations</h2>
          <p className={styles.resultsSub}>
            Showing top matches for {results.shelves.length} shelf{results.shelves.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={onReset} className={styles.resetBtn}>
          ← Start Over
        </button>
      </div>

      {results.shelves.map((shelf) => (
        <ShelfResult key={shelf.shelf_number} shelf={shelf} />
      ))}
    </div>
  )
}
