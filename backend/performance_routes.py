from pathlib import Path
import json
from fastapi import APIRouter

router = APIRouter(prefix="/performances", tags=["Performances"])

DATA_FILE = Path(__file__).resolve().parent / "data" / "cookbook.json"

KPI_CONFIG = {
    "p50": ("P50", "mm"),
    "p80": ("P80", "mm"),
    "oversize": ("Oversize", "%"),
    "toes": ("Toes", "%"),
    "digRate": ("Dig rate", "t/h"),
    "ppv": ("PPV", "mm/s"),
    "airblast": ("Airblast", "dB"),
    "flyrock": ("Flyrock", ""),
    "misfire": ("Misfire", ""),
    "dilution": ("Dilution", "%"),
    "cost": ("Coût", "€/t"),
}


def load_data():
    with DATA_FILE.open("r", encoding="utf-8") as file:
        return json.load(file)


def evaluate_kpi(key, value, targets):
    if key == "p50":
        low = targets.get("p50Min")
        high = targets.get("p50Max")
        if low is None and high is None:
            return None, "Objectif non défini"
        ok = (low is None or value >= low) and (high is None or value <= high)
        target = f"{low if low is not None else '—'} à {high if high is not None else '—'}"
    else:
        target_key = {
            "p80": "p80Max",
            "oversize": "oversizeMax",
            "toes": "toesMax",
            "digRate": "digRateMin",
            "ppv": "ppvMax",
            "airblast": "airblastMax",
            "flyrock": "flyrockMax",
            "misfire": "misfireMax",
            "dilution": "dilutionMax",
            "cost": "costMax",
        }.get(key)
        if not target_key or targets.get(target_key) is None:
            return None, "Objectif non défini"
        limit = targets[target_key]
        ok = value >= limit if key == "digRate" else value <= limit
        operator = "≥" if key == "digRate" else "≤"
        target = f"{operator} {limit}" if key == "digRate" else f"{operator} {limit}"
    return ok, target


@router.get("")
def get_performances():
    data = load_data()
    recipes = {r.get("id"): r for r in data.get("recipes", [])}
    horizons = {h.get("id"): h for h in data.get("horizons", [])}

    kpi_stats = {
        key: {"key": key, "label": label, "unit": unit,
              "total": 0, "conformes": 0, "nonConformes": 0}
        for key, (label, unit) in KPI_CONFIG.items()
    }

    tirs_result = []
    horizon_stats = {}

    for tir in data.get("blasts", []):
        recipe = recipes.get(tir.get("recipeId"), {})
        targets = recipe.get("kpiTargets", {})
        horizon = horizons.get(tir.get("horizonId"), {})
        if not horizon and recipe.get("horizonId"):
            horizon = horizons.get(recipe.get("horizonId"), {})

        kpis = []
        for key, value in (tir.get("results") or {}).items():
            if key not in KPI_CONFIG or value is None:
                continue
            conforme, target = evaluate_kpi(key, value, targets)
            if conforme is None:
                continue

            label, unit = KPI_CONFIG[key]
            kpis.append({
                "key": key,
                "label": label,
                "value": value,
                "unit": unit,
                "target": target,
                "conforme": conforme,
            })
            stat = kpi_stats[key]
            stat["total"] += 1
            if conforme:
                stat["conformes"] += 1
            else:
                stat["nonConformes"] += 1

        total = len(kpis)
        conformes = sum(1 for item in kpis if item["conforme"])
        taux = round(conformes / total * 100, 1) if total else None

        tirs_result.append({
            "id": tir.get("id"),
            "code": tir.get("code", "—"),
            "date": tir.get("date", ""),
            "site": tir.get("site", "—"),
            "zone": tir.get("zone", "—"),
            "status": tir.get("status", "—"),
            "horizon": horizon.get("name", "Horizon non renseigné"),
            "horizonCode": horizon.get("code", "—"),
            "recipe": recipe.get("code", "Recette non renseignée"),
            "kpiTotal": total,
            "conformes": conformes,
            "nonConformes": total - conformes,
            "taux": taux,
            "kpis": kpis,
        })

        horizon_id = horizon.get("id") or "unknown"
        if horizon_id not in horizon_stats:
            horizon_stats[horizon_id] = {
                "id": horizon_id,
                "name": horizon.get("name", "Horizon non renseigné"),
                "code": horizon.get("code", "—"),
                "total": 0,
                "conformes": 0,
                "nonConformes": 0,
            }
        horizon_stats[horizon_id]["total"] += total
        horizon_stats[horizon_id]["conformes"] += conformes
        horizon_stats[horizon_id]["nonConformes"] += total - conformes

    total_kpi = sum(item["total"] for item in kpi_stats.values())
    conformes_kpi = sum(item["conformes"] for item in kpi_stats.values())

    for stat in kpi_stats.values():
        stat["taux"] = round(stat["conformes"] / stat["total"] * 100, 1) if stat["total"] else None

    horizons_result = list(horizon_stats.values())
    for item in horizons_result:
        item["taux"] = round(item["conformes"] / item["total"] * 100, 1) if item["total"] else None

    return {
        "totalTirs": len(data.get("blasts", [])),
        "tirsAnalyses": sum(1 for tir in tirs_result if tir["kpiTotal"] > 0),
        "kpiTotal": total_kpi,
        "kpiConformes": conformes_kpi,
        "kpiNonConformes": total_kpi - conformes_kpi,
        "tauxGlobal": round(conformes_kpi / total_kpi * 100, 1) if total_kpi else 0,
        "kpis": list(kpi_stats.values()),
        "tirs": sorted(tirs_result, key=lambda x: x.get("date", ""), reverse=True),
        "horizons": sorted(horizons_result, key=lambda x: x["name"]),
    }
