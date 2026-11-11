import { useEffect, useMemo, useState } from 'react'
import './Performances.css'

const API_URL = 'http://127.0.0.1:8000/performances'

function formatValue(value, unit) {
  if (value === null || value === undefined) return '—'
  return `${value} ${unit || ''}`.trim()
}

function Rate({ value }) {
  if (value === null || value === undefined) return <span className="perf-muted">Non calculable</span>
  const good = value >= 80
  return (
    <span className={`perf-rate ${good ? 'good' : 'warning'}`}>
      {value} %
    </span>
  )
}

export default function Performances() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedTir, setSelectedTir] = useState(null)

  useEffect(() => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) throw new Error('Impossible de récupérer les performances.')
        return response.json()
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filteredTirs = useMemo(() => {
    if (!data) return []
    const term = search.toLowerCase().trim()
    if (!term) return data.tirs
    return data.tirs.filter((tir) =>
      [tir.code, tir.horizon, tir.horizonCode, tir.recipe, tir.site, tir.zone]
        .join(' ')
        .toLowerCase()
        .includes(term)
    )
  }, [data, search])

  if (loading) return <div className="performances-page"><p>Chargement des performances…</p></div>
  if (error) return <div className="performances-page"><div className="perf-error">{error} Vérifie que le backend FastAPI est lancé.</div></div>
  if (!data) return null

  return (
    <div className="performances-page">
      <div className="perf-heading">
        <div>
          <p className="perf-eyebrow">ANALYSE & SUIVI</p>
          <h1>Performances</h1>
          <p className="perf-subtitle">Suivi des résultats réels et conformité aux objectifs des recettes.</p>
        </div>
        <div className="perf-updated">Données issues de cookbook.json</div>
      </div>

      <section className="perf-summary">
        <article className="perf-summary-card main">
          <span className="perf-card-label">Conformité globale</span>
          <strong>{data.tauxGlobal} %</strong>
          <div className="perf-progress"><span style={{ width: `${data.tauxGlobal}%` }} /></div>
          <small>{data.kpiConformes} KPI conformes sur {data.kpiTotal} évalués</small>
        </article>
        <article className="perf-summary-card">
          <span className="perf-card-label">Tirs analysés</span>
          <strong>{data.tirsAnalyses}</strong>
          <small>Sur {data.totalTirs} tirs enregistrés</small>
        </article>
        <article className="perf-summary-card">
          <span className="perf-card-label">KPI conformes</span>
          <strong className="perf-green">{data.kpiConformes}</strong>
          <small>Résultats dans les objectifs</small>
        </article>
        <article className="perf-summary-card">
          <span className="perf-card-label">KPI non conformes</span>
          <strong className="perf-red">{data.kpiNonConformes}</strong>
          <small>Résultats hors objectifs</small>
        </article>
      </section>

      <section className="perf-panel">
        <div className="perf-section-heading">
          <div><h2>Conformité par indicateur</h2><p>Chaque résultat est comparé à la cible de sa propre recette.</p></div>
        </div>
        <div className="perf-kpi-grid">
          {data.kpis.filter((kpi) => kpi.total > 0).map((kpi) => (
            <article className="perf-kpi-card" key={kpi.key}>
              <div className="perf-kpi-top"><strong>{kpi.label}</strong><Rate value={kpi.taux} /></div>
              <div className="perf-kpi-bar"><span style={{ width: `${kpi.taux ?? 0}%` }} /></div>
              <div className="perf-kpi-bottom">
                <span>{kpi.conformes}/{kpi.total} conformes</span>
                <span>{kpi.nonConformes} non conformes</span>
              </div>
            </article>
          ))}
          {data.kpis.every((kpi) => kpi.total === 0) && <p className="perf-empty">Aucun résultat KPI exploitable pour le moment.</p>}
        </div>
      </section>

      <section className="perf-panel">
        <div className="perf-section-heading">
          <div><h2>Performances par horizon</h2><p>Conformité cumulée des KPI des tirs associés à chaque horizon.</p></div>
        </div>
        <div className="perf-horizon-grid">
          {data.horizons.map((horizon) => (
            <article className="perf-horizon-card" key={horizon.id}>
              <div><span>{horizon.code}</span><Rate value={horizon.taux} /></div>
              <h3>{horizon.name}</h3>
              <div className="perf-progress"><span style={{ width: `${horizon.taux ?? 0}%` }} /></div>
              <small>{horizon.conformes} conformes · {horizon.nonConformes} non conformes · {horizon.total} évalués</small>
            </article>
          ))}
          {data.horizons.length === 0 && <p className="perf-empty">Aucune donnée par horizon disponible.</p>}
        </div>
      </section>

      <section className="perf-panel">
        <div className="perf-section-heading perf-table-heading">
          <div><h2>Résultats par tir</h2><p>Ouvre un tir pour consulter le détail de ses indicateurs.</p></div>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un tir, horizon, recette…" />
        </div>
        <div className="perf-table-wrap">
          <table className="perf-table">
            <thead><tr><th>Tir</th><th>Date</th><th>Horizon</th><th>Recette</th><th>KPI évalués</th><th>Conformité</th><th>Détail</th></tr></thead>
            <tbody>
              {filteredTirs.map((tir) => (
                <tr key={tir.id || tir.code}>
                  <td><strong>{tir.code}</strong><small>{tir.site} · {tir.zone}</small></td>
                  <td>{tir.date || '—'}</td>
                  <td>{tir.horizon}</td>
                  <td>{tir.recipe}</td>
                  <td>{tir.kpiTotal}</td>
                  <td><Rate value={tir.taux} /></td>
                  <td><button className="perf-detail-button" onClick={() => setSelectedTir(tir)}>Voir</button></td>
                </tr>
              ))}
              {filteredTirs.length === 0 && <tr><td colSpan="7" className="perf-empty">Aucun tir correspondant.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {selectedTir && (
        <div className="perf-modal-backdrop" onClick={() => setSelectedTir(null)}>
          <section className="perf-modal" onClick={(event) => event.stopPropagation()}>
            <div className="perf-modal-heading">
              <div><span>DÉTAIL DES RÉSULTATS</span><h2>{selectedTir.code}</h2><p>{selectedTir.horizon} · {selectedTir.recipe}</p></div>
              <button onClick={() => setSelectedTir(null)} aria-label="Fermer">×</button>
            </div>
            {selectedTir.kpis.length ? (
              <div className="perf-detail-list">
                {selectedTir.kpis.map((kpi) => (
                  <div className="perf-detail-row" key={kpi.key}>
                    <div><strong>{kpi.label}</strong><small>Objectif : {kpi.target} {kpi.unit}</small></div>
                    <strong>{formatValue(kpi.value, kpi.unit)}</strong>
                    <span className={`perf-status ${kpi.conforme ? 'ok' : 'ko'}`}>{kpi.conforme ? 'Conforme' : 'Non conforme'}</span>
                  </div>
                ))}
              </div>
            ) : <p className="perf-empty">Aucun KPI avec résultat et objectif disponible pour ce tir.</p>}
          </section>
        </div>
      )}
    </div>
  )
}
