
import { useState } from 'react'

function RecentActivities({ activites }) {
  const [showAll, setShowAll] = useState(false)

  const activitiesToDisplay = showAll
    ? activites
    : activites.slice(0, 5)

  return (
    <section className="dashboard-section">

      <div className="section-header">
        <h3>Activités récentes</h3>

        {activites.length > 5 && (
          <button
            className="view-all"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Réduire" : "Voir tout"}
          </button>
        )}
      </div>

      <div className="activity-list">

        {activites.length === 0 ? (
          <p>Aucune activité récente.</p>
        ) : (
          activitiesToDisplay.map((activite, index) => (
            <div className="activity-item" key={index}>

              <div className="activity-icon">
                ✓
              </div>

              <div>
                <strong>
                  {activite.action || activite.type || "Activité"}
                </strong>

                <p>
                  {activite.tir ||
                    activite.blast ||
                    activite.code ||
                    ""}
                </p>
              </div>

              <span>
                {activite.date || ""}
              </span>

            </div>
          ))
        )}

      </div>

    </section>
  )
}

export default RecentActivities



