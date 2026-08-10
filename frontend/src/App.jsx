import React, { useState, useEffect } from 'react'
import ShelfForm from './components/ShelfForm.jsx'
import Filters from './components/Filters.jsx'
import Results from './components/Results.jsx'
import styles from './App.module.css'

const DEFAULT_SHELF = { width: '', depth: '', height: '', lip_height: '' }

export default function App() {
  const [shelves, setShelves] = useState([{ ...DEFAULT_SHELF }])
  const [categories, setCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {})
  }, [])

  const addShelf = () => setShelves([...shelves, { ...DEFAULT_SHELF }])

  const removeShelf = (idx) => {
    if (shelves.length === 1) return
    setShelves(shelves.filter((_, i) => i !== idx))
  }

  const updateShelf = (idx, field, value) => {
    const updated = shelves.map((s, i) =>
      i === idx ? { ...s, [field]: value } : s
    )
    setShelves(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setResults(null)

    // Validate all fields are filled
    for (let i = 0; i < shelves.length; i++) {
      const s = shelves[i]
      if (!s.width || !s.depth || !s.height) {
        setError(`Shelf ${i + 1} is missing required measurements (width, depth, height).`)
        setLoading(false)
        return
      }
    }

    const payload = {
      shelves: shelves.map((s, i) => ({
        shelf_number: i + 1,
        width: parseFloat(s.width),
        depth: parseFloat(s.depth),
        height: parseFloat(s.height),
        lip_height: parseFloat(s.lip_height) || 0,
      })),
      categories: selectedCategories.length > 0 ? selectedCategories : null,
      min_price: minPrice !== '' ? parseFloat(minPrice) : null,
      max_price: maxPrice !== '' ? parseFloat(maxPrice) : null,
      top_n: 3,
    }

    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setShelves([{ ...DEFAULT_SHELF }])
    setSelectedCategories([])
    setMinPrice('')
    setMaxPrice('')
    setResults(null)
    setError(null)
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.logo}>🗄️</span>
          <div>
            <h1 className={styles.title}>Pantry Organizer</h1>
            <p className={styles.subtitle}>Enter your shelf measurements to find the right organizers</p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {!results ? (
          <form onSubmit={handleSubmit} className={styles.formCard}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Shelf Measurements</h2>
              <p className={styles.hint}>All measurements in inches</p>
              {shelves.map((shelf, idx) => (
                <ShelfForm
                  key={idx}
                  index={idx}
                  shelf={shelf}
                  onChange={updateShelf}
                  onRemove={removeShelf}
                  canRemove={shelves.length > 1}
                />
              ))}
              <button type="button" onClick={addShelf} className={styles.addShelfBtn}>
                + Add Another Shelf
              </button>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Filters <span className={styles.optional}>(optional)</span></h2>
              <Filters
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryChange={setSelectedCategories}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onMinPrice={setMinPrice}
                onMaxPrice={setMaxPrice}
              />
            </section>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Finding matches…' : 'Find Organizers'}
            </button>
          </form>
        ) : (
          <Results results={results} onReset={handleReset} />
        )}
      </main>
    </div>
  )
}
