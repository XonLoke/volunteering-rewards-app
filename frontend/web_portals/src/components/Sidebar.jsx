import { NavLink, useLocation } from 'react-router-dom';

export default function Sidebar({ items, brand }) {
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        {brand || (
          <>
            Volunteering <span>Rewards</span>
          </>
        )}
      </div>
      <nav className="sidebar-nav">
        {items.map((item, idx) => {
          if (item.section) {
            return (
              <div className="nav-section" key={idx}>
                <div className="nav-section-label">{item.section}</div>
                {item.children?.map((child, cIdx) => (
                  <NavLink
                    to={child.path}
                    key={cIdx}
                    className={({ isActive: active }) =>
                      `nav-item${active ? ' active' : ''}`
                    }
                    end={child.path === '/' || child.exact}
                  >
                    {child.icon && <span className="nav-icon">{child.icon}</span>}
                    <span>{child.label}</span>
                    {child.badge && <span className="badge">{child.badge}</span>}
                  </NavLink>
                ))}
              </div>
            );
          }
          return (
            <NavLink
              to={item.path}
              key={idx}
              className={({ isActive: active }) =>
                `nav-item${active ? ' active' : ''}`
              }
              end={item.exact}
            >
              {item.icon && <span className="nav-icon">{item.icon}</span>}
              <span>{item.label}</span>
              {item.badge && <span className="badge">{item.badge}</span>}
            </NavLink>
          );
        })}
      </nav>
      <div className="sidebar-footer">Volunteering Rewards v1.0</div>
    </aside>
  );
}
