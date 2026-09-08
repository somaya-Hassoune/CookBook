import './App.css'

function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          Cook<span>Book</span>
        </div>

        <nav className="navigation">
          <a href="#dashboard">Dashboard</a>
          <a href="#drilling">Drilling</a>
          <a href="#blasting">Blasting</a>
          <a href="#reports">Reports</a>
        </nav>

        <div className="user-section">
          <span className="user-name">User</span>
          <button className="logout-button">Logout</button>
        </div>
      </header>

      <main className="main-content">
        <section className="welcome-section">
          <p className="welcome-label">COOKBOOK</p>
          <h1>Welcome to CookBook</h1>
          <p className="welcome-text">
            Drill & Blast monitoring and analysis platform
          </p>
        </section>

        <section className="dashboard-cards">
          <div className="card">
            <h2>Drilling</h2>
            <p>Monitor drilling operations and performance.</p>
          </div>

          <div className="card">
            <h2>Blasting</h2>
            <p>Analyze blasting operations and results.</p>
          </div>

          <div className="card">
            <h2>Reports</h2>
            <p>View and generate operational reports.</p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App