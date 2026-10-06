import './App.css'

import { useState } from 'react'
import { useEffect } from 'react'
import heroImg from './assets/hero.png'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import StatCard from './components/StatCard'
import Alerts from './components/Alerts'
import RecentActivities from './components/RecentActivities'
//import QuarterObjectives from './components/QuarterObjectives'
//import CORSMiddleware from fastapi.middleware.cors

//app = FastAPI(title="CookBook API")
/*app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)*/
function App() {
  const [dashboard, setDashboard] = useState(null);
  useEffect(() => {
    fetch("http://127.0.0.1:8000/dashboard")
      .then((response) => response.json())
      .then((data) => {
        setDashboard(data);
      })
      .catch((error) => {
        console.error("Erreur :", error);
      });
  }, []);
  return (
     
    <div className="app">
    
      <Sidebar />

      <main className="main-content">

        <Header />

        <section className="dashboard">

          <StatCard
            title="Total tirs"
            value={dashboard ? dashboard.totalTirs : "..."}
            description={
              dashboard
                ? `${dashboard.evolutionTirs > 0 ? "+" : ""}${dashboard.evolutionTirs} % vs mois précédent`
                : ""
            }
          />

          <StatCard
            title="Tirs clôturés"
            value={dashboard ? dashboard.tirsClotures : "..."}
          />

          <StatCard
            title="Réalisés prêts"
            value={dashboard ? dashboard.readiness : "..."}
          />

          <StatCard
            title="Alertes"
            value={dashboard ? (dashboard.alertes?.length ?? 0) : "..."}
          />

        </section>
          {/* Contenu du Dashboard */}
        <section className="dashboard-grid">

          <div>
            <Alerts alertes={dashboard ? dashboard.alertes : []}/>
            <RecentActivities activities={dashboard?.activitesRecentes ?? []}/>
          </div>

          <div>
            <StatCard
              title="Performance KPI"
              value={dashboard ? `${dashboard.performanceKPI.taux} %` : "..."}
              description={
                dashboard
                  ? `${dashboard.performanceKPI.conformes} / ${dashboard.performanceKPI.total} KPI conformes`
                  : ""
            }
          />
          </div>

        </section>
      </main>

    </div>
  )
}

export default App



