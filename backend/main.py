import json
from pathlib import Path
from typing import Optional, List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Pantry Organizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load product catalog once at startup
PRODUCTS_PATH = Path(__file__).parent / "products.json"
with open(PRODUCTS_PATH, "r") as f:
    ALL_PRODUCTS = json.load(f)

CATEGORY_LABELS = {
    "clear_plastic_bins": "Clear Plastic Bins",
    "open_front_bins": "Open-Front Bins",
    "deep_shelf_bins": "Deep Shelf Bins",
    "wire_natural_baskets": "Wire & Natural Baskets",
    "turntables": "Turntables / Lazy Susans",
    "can_risers": "Can Risers",
    "grain_dispensers": "Grain & Cereal Dispensers",
    "pop_lid_containers": "Pop-Lid Containers",
    "drawer_organizers": "Drawer Organizers",
    "shelf_risers": "Shelf Risers",
}


# ---------- Request / Response models ----------

class ShelfInput(BaseModel):
    shelf_number: int
    width: float      # inches
    depth: float      # inches
    height: float     # inches
    lip_height: float = 0.0  # inches — reduces usable height


class PantryRequest(BaseModel):
    shelves: List[ShelfInput]
    categories: Optional[List[str]] = None   # filter by category slugs
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    top_n: int = 3


class ProductResult(BaseModel):
    id: str
    name: str
    category: str
    category_label: str
    price: float
    dimensions: dict
    image_url: str
    product_url: str
    description: str
    tags: List[str]
    fit_score: float
    quantity_side_by_side: int
    quantity_front_to_back: int


class ShelfResult(BaseModel):
    shelf_number: int
    shelf_dimensions: dict
    usable_height: float
    matches: List[ProductResult]


class PantryResponse(BaseModel):
    shelves: List[ShelfResult]
    categories: List[dict]


# ---------- Matching logic ----------

def score_product(product: dict, usable_w: float, usable_d: float, usable_h: float) -> Optional[dict]:
    """
    Returns a scored product dict if the product fits in the shelf space,
    otherwise None. Products must fit within all three dimensions.
    A small clearance buffer (0.25 in) is added so products aren't a
    perfect tight squeeze.
    """
    p = product["dimensions"]
    pw, pd, ph = p["width"], p["depth"], p["height"]

    # Must physically fit (with a small clearance buffer)
    if pw > usable_w or pd > usable_d or ph > usable_h:
        return None

    # How many fit side-by-side (width) and front-to-back (depth)
    qty_w = max(1, int(usable_w / pw))
    qty_d = max(1, int(usable_d / pd))

    # Score considers how well a single product fills the space proportionally
    # We weight width fit most (eye-level accessibility)
    width_ratio = pw / usable_w
    depth_ratio = pd / usable_d
    height_ratio = ph / usable_h
    fit_score = round((width_ratio * 0.4 + depth_ratio * 0.3 + height_ratio * 0.3), 4)

    return {
        **product,
        "category_label": CATEGORY_LABELS.get(product["category"], product["category"]),
        "fit_score": fit_score,
        "quantity_side_by_side": qty_w,
        "quantity_front_to_back": qty_d,
    }


@app.post("/match", response_model=PantryResponse)
def match_products(request: PantryRequest):
    shelf_results = []

    for shelf in request.shelves:
        usable_height = max(0.0, shelf.height - shelf.lip_height)
        usable_w = shelf.width
        usable_d = shelf.depth

        candidates = []

        for product in ALL_PRODUCTS:
            # Category filter
            if request.categories and product["category"] not in request.categories:
                continue

            # Price filter
            if request.min_price is not None and product["price"] < request.min_price:
                continue
            if request.max_price is not None and product["price"] > request.max_price:
                continue

            scored = score_product(product, usable_w, usable_d, usable_height)
            if scored:
                candidates.append(scored)

        # Sort by fit_score descending, take top N
        candidates.sort(key=lambda x: x["fit_score"], reverse=True)
        top_matches = candidates[: request.top_n]

        shelf_results.append(
            ShelfResult(
                shelf_number=shelf.shelf_number,
                shelf_dimensions={
                    "width": shelf.width,
                    "depth": shelf.depth,
                    "height": shelf.height,
                    "lip_height": shelf.lip_height,
                },
                usable_height=usable_height,
                matches=[ProductResult(**m) for m in top_matches],
            )
        )

    return PantryResponse(
        shelves=shelf_results,
        categories=[{"slug": k, "label": v} for k, v in CATEGORY_LABELS.items()],
    )


@app.get("/categories")
def get_categories():
    return [{"slug": k, "label": v} for k, v in CATEGORY_LABELS.items()]


@app.get("/health")
def health():
    return {"status": "ok", "products_loaded": len(ALL_PRODUCTS)}
