import { useState, useEffect } from 'react'
import './App.css'
import ChatPage from './pages/ChatPage'
import ProfileModal from './components/ProfileModal'

function App() {
  const [userProfile, setUserProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  useEffect(() => {
    const savedProfile = localStorage.getItem('samsara_user_profile')
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile))
      } catch (e) {
        localStorage.removeItem('samsara_user_profile')
      }
    } else {
      // No profile found — force the modal open
      setIsProfileModalOpen(true)
    }
    setIsLoading(false)
  }, [])

  const handleProfileComplete = (profile) => {
    localStorage.setItem('samsara_user_profile', JSON.stringify(profile))
    setUserProfile(profile)
    setIsProfileModalOpen(false)
  }

  if (isLoading) return null

  return (
    <>
      <div className="bg-ambient" />

      <ChatPage
        userProfile={userProfile}
        onSave={handleProfileComplete}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Force-open profile modal when no profile exists */}
      {isProfileModalOpen && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => {
            if (userProfile) setIsProfileModalOpen(false)
          }}
          userProfile={userProfile}
          onSave={handleProfileComplete}
          required={!userProfile}
        />
      )}
    </>
  )
}

export default App
