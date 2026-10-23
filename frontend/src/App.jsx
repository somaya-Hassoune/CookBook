

import './App.css'
import { useState, useEffect } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'

import Sidebar from './components/Sidebar'
import Header from './components/Header'
import StatCard from './components/StatCard'
import Alerts from './components/Alerts'
import RecentActivities from './components/RecentActivities'

// Mise en page commune
function Layout() {
  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <Header />
        <Outlet />
      </main>
    </div>
  )
}

// Page Dashboard
function Dashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/dashboard')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erreur API')
        }
        return response.json()
      })
      .then((data) => {
        setDashboard(data)
        setError(false)
      })
      .catch((err) => {
        console.error('Erreur :', err)
        setError(true)
      })
  }, [])

  if (error) {
    return <p>Impossible de charger les données. Vérifie que FastAPI est lancé.</p>
  }

  return (
    <>
      <section className="dashboard">
        <StatCard
          title="Total tirs"
          value={dashboard ? dashboard.totalTirs : '...'}
          description={
            dashboard
              ? `${dashboard.evolutionTirs > 0 ? '+' : ''}${dashboard.evolutionTirs} % vs mois précédent`
              : ''
          }
        />

        <StatCard
          title="Tirs clôturés"
          value={dashboard ? dashboard.tirsClotures : '...'}
        />

        <StatCard
          title="Réalisés prêts"
          value={dashboard ? dashboard.readiness : '...'}
        />

        <StatCard
          title="Alertes"
          value={dashboard ? (dashboard.alertes?.length ?? 0) : '...'}
        />
      </section>

      <section className="dashboard-grid">
        <div>
          <Alerts alertes={dashboard?.alertes ?? []} />

          <RecentActivities
            activities={dashboard?.activitesRecentes ?? []}
          />
        </div>

        <div>
          <StatCard
            title="Performance KPI"
            value={
              dashboard
                ? `${dashboard.performanceKPI.taux} %`
                : '...'
            }
            description={
              dashboard
                ? `${dashboard.performanceKPI.conformes} / ${dashboard.performanceKPI.total} KPI conformes`
                : ''
            }
          />
        </div>
      </section>
    </>
  )
}

// Pages temporaires
function PlaceholderPage({ title, description }) {
  return (
    <section className="dashboard-section">
      <h2>{title}</h2>
      <p>{description}</p>
      <p>Cette page sera développée dans la prochaine étape.</p>
    </section>
  )
}

// Routes de l'application
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />

        <Route
          path="/tirs"
          element={
            <PlaceholderPage
              title="Gestion des tirs"
              description="Consulte et suis les tirs de forage et de minage."
            />
          }
        />

        <Route
          path="/dossiers"
          element={
            <PlaceholderPage
              title="Dossiers"
              description="Retrouve les dossiers et les documents du projet."
            />
          }
        />

        <Route
          path="/horizons"
          element={
            <PlaceholderPage
              title="Horizons"
              description="Consulte les horizons, les niveaux et les zones."
            />
          }
        />

        <Route
          path="/zones"
          element={
            <PlaceholderPage
              title="Zone Classification et Pattern Design"
              description="Espace consacré à la classification des zones et au pattern design."
            />
          }
        />
      </Route>
    </Routes>
  )
}

export default App



