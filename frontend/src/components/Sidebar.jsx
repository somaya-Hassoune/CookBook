
import { NavLink } from 'react-router-dom'

function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Tirs', path: '/tirs' },
    { name: 'Dossiers', path: '/dossiers' },
    { name: 'Horizons', path: '/horizons' },
    { name: 'Zone Classification', path: '/zones' },
  ]

  return (
    <aside className="sidebar">
      <h1 className="logo">CookBook</h1>

      <nav>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? 'active' : ''
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
