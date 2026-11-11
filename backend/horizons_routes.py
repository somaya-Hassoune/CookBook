"""Routes CRUD pour les horizons du fichier data/cookbook.json.
À placer à côté de main.py (dans le dossier backend).
"""
import json
import re
from pathlib import Path
from typing import Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/horizons", tags=["Horizons"])
DATA_FILE = Path(__file__).resolve().parent / "data" / "cookbook.json"


class HorizonPayload(BaseModel):
    id: str | None = None
    code: str = Field(min_length=1)
    name: str = Field(min_length=1)
    material: str = ""
    compacity: str = ""
    water: str = ""
    contacts: str = ""
    risk: str = ""
    orientation: str = ""
    tags: list[str] = Field(default_factory=list)


def read_data() -> dict[str, Any]:
    if not DATA_FILE.exists():
        raise HTTPException(status_code=500, detail=f"Fichier JSON introuvable : {DATA_FILE}")
    try:
        with DATA_FILE.open("r", encoding="utf-8") as file:
            return json.load(file)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=500, detail="Le fichier cookbook.json n'est pas un JSON valide.") from exc


def write_data(data: dict[str, Any]) -> None:
    temporary = DATA_FILE.with_suffix(".json.tmp")
    with temporary.open("w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)
        file.write("\n")
    temporary.replace(DATA_FILE)


def enrich_horizon(horizon: dict[str, Any], data: dict[str, Any]) -> dict[str, Any]:
    recipes = [r for r in data.get("recipes", []) if r.get("horizonId") == horizon.get("id")]
    blasts = [b for b in data.get("blasts", []) if b.get("horizonId") == horizon.get("id")]
    return {**horizon, "recipeCount": len(recipes), "blastCount": len(blasts)}


@router.get("")
def list_horizons():
    data = read_data()
    return [enrich_horizon(h, data) for h in data.get("horizons", [])]


@router.get("/{horizon_id}")
def get_horizon(horizon_id: str):
    data = read_data()
    horizon = next((h for h in data.get("horizons", []) if h.get("id") == horizon_id), None)
    if not horizon:
        raise HTTPException(status_code=404, detail="Horizon introuvable.")
    result = enrich_horizon(horizon, data)
    result["recipes"] = [
        {"id": r.get("id"), "code": r.get("code"), "name": r.get("name"), "version": r.get("version"), "status": r.get("status")}
        for r in data.get("recipes", []) if r.get("horizonId") == horizon_id
    ]
    return result


@router.post("", status_code=201)
def create_horizon(payload: HorizonPayload):
    data = read_data()
    horizons = data.setdefault("horizons", [])
    horizon_id = (payload.id or "").strip() or ("hz-" + re.sub(r"[^a-z0-9]+", "-", payload.code.lower()).strip("-"))
    if any(h.get("id") == horizon_id for h in horizons):
        raise HTTPException(status_code=409, detail="Un horizon avec cet identifiant existe déjà. Modifie le code.")
    if any(h.get("code", "").lower() == payload.code.lower() for h in horizons):
        raise HTTPException(status_code=409, detail="Ce code horizon existe déjà.")
    new_horizon = {**payload.model_dump(exclude={"id"}), "id": horizon_id}
    horizons.append(new_horizon)
    write_data(data)
    return enrich_horizon(new_horizon, data)


@router.put("/{horizon_id}")
def update_horizon(horizon_id: str, payload: HorizonPayload):
    data = read_data()
    horizon = next((h for h in data.get("horizons", []) if h.get("id") == horizon_id), None)
    if not horizon:
        raise HTTPException(status_code=404, detail="Horizon introuvable.")
    if any(h.get("id") != horizon_id and h.get("code", "").lower() == payload.code.lower() for h in data.get("horizons", [])):
        raise HTTPException(status_code=409, detail="Ce code horizon est déjà utilisé.")
    horizon.update(payload.model_dump(exclude={"id"}))
    write_data(data)
    return enrich_horizon(horizon, data)


@router.delete("/{horizon_id}")
def delete_horizon(horizon_id: str):
    data = read_data()
    horizon = next((h for h in data.get("horizons", []) if h.get("id") == horizon_id), None)
    if not horizon:
        raise HTTPException(status_code=404, detail="Horizon introuvable.")
    recipe_count = sum(1 for r in data.get("recipes", []) if r.get("horizonId") == horizon_id)
    blast_count = sum(1 for b in data.get("blasts", []) if b.get("horizonId") == horizon_id)
    if recipe_count or blast_count:
        raise HTTPException(status_code=409, detail=f"Suppression impossible : cet horizon est lié à {recipe_count} recette(s) et {blast_count} tir(s).")
    data["horizons"] = [h for h in data.get("horizons", []) if h.get("id") != horizon_id]
    write_data(data)
    return {"message": "Horizon supprimé.", "id": horizon_id}
