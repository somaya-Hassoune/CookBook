from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI(title="CookBook API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_data():
    with open("data/cookbook.json", "r", encoding="utf-8") as file:
        return json.load(file)


@app.get("/")
def root():
    return {
        "message": "Bienvenue dans l'API CookBook"
    }


@app.get("/data")
def get_data():
    data = load_data()
    return data


@app.get("/dashboard")
def get_dashboard():
    data = load_data()

    tirs = data["blasts"]

    total_tirs = len(tirs)

    tirs_clotures = sum(
        1 for tir in tirs
        if tir.get("status") == "Clôturé"
    )

    readiness = sum(
        1 for tir in tirs
        if tir.get("readiness", {}).get("authorized") is True
    )
     # Détection des alertes
    alertes = []

    for tir in tirs:
        for controle in tir.get("qa", []):

            if (
                controle.get("critical") is True
                and controle.get("status") == "Non conforme"
            ):
                alertes.append({
                    "tir": tir.get("code"),
                    "label": controle.get("label"),
                    "status": controle.get("status"),
                    "measured": controle.get("measured"),
                    "comment": controle.get("comment"),
                    "action": controle.get("action")
                })
      # Activités récentes
    audit = data.get("audit", [])

    activites_recentes = sorted(
        audit,
        key=lambda activite: activite.get("date", ""),
        reverse=True
    )
    return {
        "totalTirs": total_tirs,
        "tirsClotures": tirs_clotures,
        "readiness": readiness,
        "alertes": alertes,
        "activitesRecentes": activites_recentes
    }