function Alerts() {
  return (
    <section className="dashboard-section">
      <div className="section-header">
        <h3>Alertes</h3>
        <span>Voir tout</span>
      </div>

      <div className="alert-list">

        <div className="alert-item">
          <div>
            <strong>Position des trous conforme au plan</strong>
            <p>TIR-BG-2026-044</p>
          </div>

          <span className="alert-status">
            Conforme
          </span>
        </div>

        <div className="alert-item">
          <div>
            <strong>Vérification HSE</strong>
            <p>TIR-BG-2026-043</p>
          </div>

          <span className="alert-status">
            Conforme
          </span>
        </div>

      </div>
    </section>
  )
}

export default Alerts