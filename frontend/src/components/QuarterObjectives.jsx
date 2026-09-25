function QuarterObjectives() {
  return (
    <section className="dashboard-section">

      <div className="section-header">
        <h3>Objectifs du trimestre</h3>
      </div>

      <div className="objective">

        <div className="objective-info">
          <strong>Tirs réalisés</strong>

          <span>35 / 50</span>
        </div>

        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: '70%' }}
          ></div>
        </div>

        <p>70 % de l'objectif atteint</p>

      </div>

      <div className="objective">

        <div className="objective-info">
          <strong>Dossiers clôturés</strong>

          <span>35 / 40</span>
        </div>

        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: '87.5%' }}
          ></div>
        </div>

        <p>87,5 % de l'objectif atteint</p>

      </div>

    </section>
  )
}

export default QuarterObjectives