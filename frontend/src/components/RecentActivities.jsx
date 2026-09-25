function RecentActivities() {
  return (
    <section className="dashboard-section">
      <div className="section-header">
        <h3>Activités récentes</h3>
        <span>Voir tout</span>
      </div>

      <div className="activity-list">

        <div className="activity-item">
          <div className="activity-icon">
            +
          </div>

          <div>
            <strong>Nouveau dossier créé</strong>
            <p>TIR-BG-2026-044</p>
          </div>

          <span>Il y a 10 min</span>
        </div>

        <div className="activity-item">
          <div className="activity-icon">
            ✓
          </div>

          <div>
            <strong>Tir clôturé</strong>
            <p>TIR-BG-2026-043</p>
          </div>

          <span>Il y a 1 h</span>
        </div>

        <div className="activity-item">
          <div className="activity-icon">
            ✓
          </div>

          <div>
            <strong>Contrôle terminé</strong>
            <p>TIR-BG-2026-042</p>
          </div>

          <span>Il y a 2 h</span>
        </div>

      </div>
    </section>
  )
}

export default RecentActivities