import monkIcon from '/monk.png'

export default function Sidebar({ userProfile, onNewChat, isOpen, onClose }) {
  const getInitial = () => {
    if (userProfile?.name) return userProfile.name.charAt(0).toUpperCase()
    return '?'
  }

  return (
    <>
      {/* Overlay to close sidebar */}
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={onClose}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 40,
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <img src={monkIcon} alt="Samsara" className="sidebar-brand-img" />
          <div className="sidebar-brand-text">
            <h1>Samsara Mental Health AI</h1>
            <p>Mental Health AI</p>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

      {/* New Chat Button */}
      <button className="sidebar-btn" onClick={onNewChat}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New Conversation
      </button>

      {/* User Profile Card */}
      <div className="sidebar-profile">
        <div className="sidebar-profile-header" style={{ marginBottom: 0 }}>
          <div className="sidebar-profile-avatar">{getInitial()}</div>
          <div>
            <div className="sidebar-profile-name">{userProfile?.name || 'New User'}</div>
            <div className="sidebar-profile-meta" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
              {userProfile?.name ? 'Active now' : 'Getting to know you...'}
            </div>
          </div>
        </div>
      </div>
    </aside>
    </>
  )
}
