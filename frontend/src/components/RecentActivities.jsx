import { useState } from 'react'

function RecentActivities({ activities = [] }) {
  const [showAll, setShowAll] = useState(false)

  const activitiesToDisplay = showAll
    ? activities
    : activities.slice(0, 5)

  return (
    <section className="dashboard-section">

      <div className="section-header">
        <h3>Activités récentes</h3>

        {activities.length > 5 && (
          <button
            className="view-all"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Réduire" : "Voir tout"}
          </button>
        )}
      </div>

      <div className="activity-list">

        {activities.length === 0 ? (
          <p>Aucune activité récente.</p>
        ) : (
          activitiesToDisplay.map((activite) => (
            <div className="activity-item" key={activite.id}>

              <div className="activity-icon">
                ✓
              </div>

              <div>
                <strong>
                  {activite.action || "Activité"}
                </strong>

                <p>
                  {activite.object || ""}
                </p>

                <small>
                  {activite.detail || ""}
                </small>
              </div>

              <span>
                {new Date(activite.date).toLocaleString("fr-FR")}
              </span>

            </div>
          ))
        )}

      </div>

    </section>
  )
}

export default RecentActivities



