from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

with open("data/cookbook.json", "r", encoding="utf-8") as f:
    data = json.load(f)


@app.get("/")
def root():
    return {"message": "CookBook API fonctionne"}


@app.get("/dashboard")
def dashboard():

    tirs = data.get("blasts", [])

    total_tirs = len(tirs)

    tirs_clotures = [
        tir for tir in tirs
        if tir.get("status") == "Clôturé"
    ]

    readiness = [
        tir for tir in tirs
        if tir.get("readiness", {}).get("authorized") is True
    ]

      # =========================
    # PERFORMANCE KPI
    # =========================

    recipes_by_id = {
        recipe.get("id"): recipe
        for recipe in data.get("recipes", [])
    }

    kpi_total = 0
    kpi_conformes = 0

    for tir in tirs:

        results = tir.get("results", {})

        if not results:
            continue

        recipe = recipes_by_id.get(tir.get("recipeId"))

        if not recipe:
            continue

        targets = recipe.get("kpiTargets", {})

        for kpi, value in results.items():

            if value is None:
                continue

            conforme = True

            if kpi == "p50":
                conforme = (
                    targets.get("p50Min", float("-inf"))
                    <= value
                    <= targets.get("p50Max", float("inf"))
                )

            elif kpi == "p80":
                conforme = value <= targets.get(
                    "p80Max", float("inf")
                )

            elif kpi == "oversize":
                conforme = value <= targets.get(
                    "oversizeMax", float("inf")
                )

            elif kpi == "toes":
                conforme = value <= targets.get(
                    "toesMax", float("inf")
                )

            elif kpi == "digRate":
                conforme = value >= targets.get(
                    "digRateMin", float("-inf")
                )

            elif kpi == "ppv":
                conforme = value <= targets.get(
                    "ppvMax", float("inf")
                )

            elif kpi == "airblast":
                conforme = value <= targets.get(
                    "airblastMax", float("inf")
                )

            elif kpi == "flyrock":
                conforme = value <= targets.get(
                    "flyrockMax", float("inf")
                )

            elif kpi == "misfire":
                conforme = value <= targets.get(
                    "misfireMax", float("inf")
                )

            elif kpi == "dilution":
                conforme = value <= targets.get(
                    "dilutionMax", float("inf")
                )

            elif kpi == "cost":
                conforme = value <= targets.get(
                    "costMax", float("inf")
                )

            else:
                continue

            kpi_total += 1

            if conforme:
                kpi_conformes += 1

    taux_kpi = (
        round((kpi_conformes / kpi_total) * 100, 1)
        if kpi_total > 0
        else 0
    )
        # =========================
    # ALERTES
    # =========================

    alertes = []

    for tir in tirs:
        for qa in tir.get("qa", []):
            if qa.get("status") == "Non conforme":
                alertes.append({
                    "label": qa.get("label", "Anomalie QA/QC"),
                    "tir": tir.get("code", ""),
                    "status": qa.get("status", ""),
                    "measured": qa.get("measured", ""),
                    "action": qa.get("action", ""),
                    "critical": qa.get("critical", False)
                })

    # =========================
    # ACTIVITÉS RÉCENTES
    # =========================

    activites_recentes = sorted(
    data.get("audit", []),
    key=lambda x: x.get("date", ""),
    reverse=True
)
    return {
        "totalTirs": total_tirs,
        "tirsClotures": len(tirs_clotures),
        "readiness": len(readiness),
        "performanceKPI": {
            "total": kpi_total,
            "conformes": kpi_conformes,
            "taux": taux_kpi
        },
        "alertes": alertes,
        "activitesRecentes": activites_recentes,
    }