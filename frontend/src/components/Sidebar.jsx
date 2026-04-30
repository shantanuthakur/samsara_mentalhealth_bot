import monkIcon from '/monk.png'

export default function Sidebar({ userProfile, onNewChat, onLogout }) {
  const getInitial = () => {
    if (userProfile?.name) return userProfile.name.charAt(0).toUpperCase()
    return '?'
  }

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <img src={monkIcon} alt="Samsara" className="sidebar-brand-img" />
        <div className="sidebar-brand-text">
          <h1>Samsara</h1>
          <p>Mental Health AI</p>
        </div>
      </div>

      {/* New Chat Button */}
      <button className="sidebar-btn" onClick={onNewChat}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New Conversation
      </button>

      {/* Logout Button */}
      <button className="sidebar-btn" onClick={onLogout} style={{ marginTop: '4px' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Switch Profile
      </button>

      {/* User Profile Card */}
      <div className="sidebar-profile">
        <div className="sidebar-profile-header">
          <div className="sidebar-profile-avatar">{getInitial()}</div>
          <div>
            <div className="sidebar-profile-name">{userProfile?.name || 'User'}</div>
            <div className="sidebar-profile-meta">Active now</div>
          </div>
        </div>
        <div className="sidebar-profile-details">
          <div className="sidebar-profile-detail">
            <span>Age</span>
            <span>{userProfile?.age || '—'}</span>
          </div>
          <div className="sidebar-profile-detail">
            <span>Gender</span>
            <span>{userProfile?.gender || '—'}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
