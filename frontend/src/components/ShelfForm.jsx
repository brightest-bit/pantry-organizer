import React from 'react'
import styles from './ShelfForm.module.css'

export default function ShelfForm({ index, shelf, onChange, onRemove, canRemove }) {
  return (
    <div className={styles.shelf}>
      <div className={styles.shelfHeader}>
        <span className={styles.shelfLabel}>Shelf {index + 1}</span>
        {canRemove && (
          <button type="button" onClick={() => onRemove(index)} className={styles.removeBtn} aria-label="Remove shelf">
            ✕ Remove
          </button>
        )}
      </div>

      <div className={styles.fields}>
        <label className={styles.field}>
          <span>Width (in)</span>
          <input
            type="number"
            min="1"
            step="0.25"
            placeholder="e.g. 24"
            value={shelf.width}
            onChange={(e) => onChange(index, 'width', e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span>Depth (in)</span>
          <input
            type="number"
            min="1"
            step="0.25"
            placeholder="e.g. 14"
            value={shelf.depth}
            onChange={(e) => onChange(index, 'depth', e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span>Height (in)</span>
          <input
            type="number"
            min="1"
            step="0.25"
            placeholder="e.g. 12"
            value={shelf.height}
            onChange={(e) => onChange(index, 'height', e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span>Lip Height (in)</span>
          <input
            type="number"
            min="0"
            step="0.25"
            placeholder="e.g. 1 (optional)"
            value={shelf.lip_height}
            onChange={(e) => onChange(index, 'lip_height', e.target.value)}
          />
        </label>
      </div>
    </div>
  )
}
