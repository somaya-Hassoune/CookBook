function StatCard({ title, value, description }) {
  return (
    <div className="card">
      <h3>{title}</h3>

      <p>{value}</p>

      {description && (
        <span>{description}</span>
      )}
    </div>
  )
}

export default StatCard