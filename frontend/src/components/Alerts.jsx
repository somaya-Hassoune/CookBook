import { useState } from 'react'

function Alerts({ alertes }) {
  const [showAll, setShowAll] = useState(false)

  const alertesToDisplay = showAll
    ? alertes
    : alertes.slice(0, 5)
  return (
    <section className="dashboard-section">
      <div className="section-header">
        <h3>Alertes</h3>
        {alertes.length > 5 && (
      <button
        className="view-all"
        onClick={() => setShowAll(!showAll)}
      >
        {showAll ? "Réduire" : "Voir tout"}
      </button>
    )}
      </div>

      <div className="alert-list">

        {alertes.length === 0 ? (
          <p>Aucune alerte actuellement.</p>
        ) : (
          alertesToDisplay.map((alerte, index) => (
            <div className="alert-item" key={index}>

              <div>
                <strong>{alerte.label}</strong>
                <p>{alerte.tir}</p>
              </div>

              <span className="alert-status">
                {alerte.status}
              </span>

            </div>
          ))
        )}

      </div>
    </section>
  )
}

export default Alerts

