import './App.css'

import { useState } from 'react'
import { useEffect } from 'react'
import heroImg from './assets/hero.png'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import StatCard from './components/StatCard'
import Alerts from './components/Alerts'
import RecentActivities from './components/RecentActivities'
import QuarterObjectives from './components/QuarterObjectives'
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
            value="42"
            description="+12 % vs mois précédent"
          />

          <StatCard
            title="Tirs clôturés"
            value="35"
          />

          <StatCard
            title="Réalisés prêts"
            value="8"
          />

          <StatCard
            title="Alertes"
            value="0"
          />

        </section>
          {/* Contenu du Dashboard */}
        <section className="dashboard-grid">

          <div>
            <Alerts />
            <RecentActivities />
          </div>

          <div>
            <QuarterObjectives />
          </div>

        </section>
      </main>

    </div>
  )
}

export default App



