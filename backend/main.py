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

    kpi_total = 0
    kpi_conformes = 0

    for tir in tirs:
        results = tir.get("results", {})
        targets = tir.get("kpiTargets", {})

        for kpi, value in results.items():

            if value is None or kpi not in targets:
                continue

            target = targets[kpi]
            conforme = True

            if "Min" in kpi:
                if value < target:
                    conforme = False

            elif kpi == "p50":
                if value < targets.get("p50Min", value):
                    conforme = False
                if value > targets.get("p50Max", value):
                    conforme = False

            elif kpi == "p80":
                if value > targets.get("p80Max", value):
                    conforme = False

            elif kpi == "digRate":
                if value < targets.get("digRateMin", value):
                    conforme = False

            else:
                if value > target:
                    conforme = False

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