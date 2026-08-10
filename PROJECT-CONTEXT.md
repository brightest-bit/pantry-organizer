# Pantry Organizer — Project Context & Goals

## What This Tool Is

The Pantry Organizer is a single-page web application that helps users find Amazon storage containers and organizers that fit their specific pantry or cabinet dimensions. The user inputs their shelf measurements, the tool recommends products that physically fit, and the user can visually see how those products look placed on their shelves in an interactive 3D rendering. When they're ready to buy, product links send them to Amazon. The tool earns revenue through the Amazon Associates affiliate program.

The core value proposition: instead of guessing whether a bin will fit, the user measures once, sees exactly what fits, and buys with confidence.

## Technical Stack

- **Frontend**: A single self-contained HTML file (`pantry-organizer.html`) containing all CSS, HTML markup, and JavaScript inline. No build tools, no framework — plain vanilla JS. There is a separate `frontend/` directory with a Vite scaffolding (`vite.config.js`, `package.json`, `src/`) that appears to be for a future iteration but is not the active working version.
- **Backend**: Python (`backend/main.py`) with a `products.json` data file and `requirements.txt`. The backend is not currently integrated into the standalone HTML tool — the HTML file contains a hardcoded `PRODUCTS` array of 25 mock products. The backend exists for future API-driven product lookups.
- **3D Rendering**: Custom canvas-based isometric projection using the HTML5 Canvas 2D API. No WebGL, no Three.js — all hand-rolled with `project3D()`, `drawBox()`, `drawCylinder()`, and `drawFace()` helper functions. Supports drag-to-rotate (mouse and touch).
- **Styling**: Graph-paper aesthetic with Space Mono font. Muted earth tones (#f0ede6 background, #1c1c1c dark accents, #f0a500 gold highlights). Cards, dashed borders, monospace labels throughout.
- **Persistence**: localStorage for saving/loading sessions and a shopping list.

## How the Tool Works (User Flow)

1. **Pantry Type Selection** — User picks "Standard Pantry" (a single cabinet or shelving unit) or "Walk-In Pantry" (a room with walls). Walk-in mode shows additional room dimension fields (width, depth, ceiling height, door width).

2. **Shelf Measurements** — User adds one or more shelves, entering width, depth, height, and optional lip height for each. Supports inches or centimeters with a unit toggle. A "same dimensions" checkbox copies one shelf's values to the next.

3. **Packing Preference** (optional) — User can specify a target number of bins per shelf and whether they want to fill shelves completely or leave breathing room.

4. **Filters** (optional) — Category chips (Clear Plastic Bins, Turntables, Can Risers, etc.) and a max price filter narrow recommendations.

5. **Find Organizers** — The matching engine scores every product in the catalog against each shelf's usable dimensions. Products are ranked by dimensional fit, adjusted for packing preference. Results show the top matches per shelf.

6. **Interactive 3D Visualization** — A canvas renders the pantry as a 3D cabinet with enclosure walls (back, left, right), shelf boards, and a top cap. Selected products appear as colored boxes or cylinders on their shelves. Users drag to rotate the view. Position sliders (left/right and back/front) let users move individual product instances within a shelf.

7. **Multi-instance placement** — Users can add multiple units of the same product to a shelf, each independently positioned. Overlap detection turns conflicting products red with a warning banner.

8. **Shopping List** — A floating bottom panel tracks selected items with quantities and prices. Links go to Amazon (affiliate-tagged in production). The list persists across page reloads via localStorage.

## Current Product Catalog

25 mock products across 10 categories: Clear Plastic Bins, Open-Front Bins, Deep Shelf Bins, Wire & Natural Baskets, Turntables/Lazy Susans, Can Risers, Grain & Cereal Dispensers, Pop-Lid Containers, Drawer Organizers, and Shelf Risers. Each product has width/depth/height dimensions (in inches), a price, a color for 3D rendering, and an optional `shape: 'cylinder'` flag. In production, these will come from the Python backend pulling real Amazon product data.

## Key Technical Details for Future Sessions

- **State variables**: `shelves[]`, `selectedProducts[][]` (per-shelf arrays of `{uid, id, x, z}` instances), `shoppingList[]`, `lastShelfResults[]`, `pantryType`, `unit`, `fillPref`, `selectedCats[]`, `shelfVisibleCounts[]`.
- **3D coordinate system**: X = shelf width (left/right), Y = vertical (up), Z = shelf depth (back/front). Rotation via `rotY` (horizontal drag) and `rotX` (vertical drag). Projection uses a perspective formula with a virtual FOV.
- **Product positioning**: `x` (0–1) maps to left-right position on the shelf. `z` (0–1) maps to back-front position. These are normalized and multiplied by `(shelfWidth - productWidth)` or `(shelfDepth - productDepth)` to get actual pixel offsets.
- **Overlap detection**: Pairwise AABB intersection check on all placed boxes within a shelf. Out-of-bounds check flags products extending past shelf edges. Both conditions cause red rendering and a warning banner.
- **Results pagination**: Shows 3 products per shelf by default. "Show More Options" button reveals 3 more at a time. "Show Less" collapses back.
- **The FRONT label**: Dynamically tracks the projected 3D front-bottom edge of the model with a fixed pixel gap so it never overlaps regardless of model scale.

## Revenue Model

Amazon Associates affiliate links on product cards and in the shopping list. When users click "Shop →" and purchase on Amazon, the site earns a commission. The tool's entire purpose is to drive confident purchasing decisions by eliminating the "will it fit?" uncertainty.

## Planned Enhancements

### Custom Shape Drawing (Not Yet Implemented)

A feature to support non-rectangular walk-in pantries (L-shaped, U-shaped, nooks, angled walls). The user would draw their floorplan by clicking corner points on a canvas, then label each wall with real measurements, assign shelving to specific walls, and get the same product matching and 3D visualization — but rendered as a full room instead of a stacked cabinet. This feature is gated behind a "My pantry has a non-standard shape" checkbox so standard-pantry users never see it.

### Future Backend Integration

Replace the hardcoded 25-product catalog with live Amazon product data served by the Python backend. This would enable real affiliate links, live pricing, availability checks, and a much larger product selection.

## File Structure

```
pantry-organizer/
├── pantry-organizer.html      ← The working tool (standalone, all-in-one)
├── README.md
├── start-backend.ps1          ← PowerShell script to run the Python backend
├── start-frontend.ps1         ← PowerShell script to start Vite dev server
├── backend/
│   ├── main.py                ← Python API (future integration)
│   ├── products.json          ← Product data (future)
│   └── requirements.txt
└── frontend/
    ├── index.html             ← Vite entry point (future iteration)
    ├── package.json
    ├── vite.config.js
    └── src/                   ← Future component-based frontend
```

## Design Principles

- **Single-file simplicity**: The working tool is one HTML file with zero dependencies. Anyone can open it in a browser. No build step, no npm install.
- **Immediate visual feedback**: Every input change should reflect in the UI instantly — whether it's the 2D form or the 3D viewer.
- **Measurement-first UX**: The tool trusts the user's measurements as truth. It doesn't ask for information the user can't easily obtain with a tape measure.
- **Non-destructive editing**: Users can go back to edit inputs without losing selections. The shopping list persists independently of the current session state.
- **Progressive disclosure**: Simple cases stay simple. Advanced features (packing preference, custom shapes, multiple product instances) are available but don't clutter the default experience.
