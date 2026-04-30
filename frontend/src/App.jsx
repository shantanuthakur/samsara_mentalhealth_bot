import { useState, useEffect } from 'react'
import './App.css'
import Onboarding from './pages/Onboarding'
import ChatPage from './pages/ChatPage'

function App() {
  const [userProfile, setUserProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedProfile = localStorage.getItem('samsara_user_profile')
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile))
      } catch (e) {
        localStorage.removeItem('samsara_user_profile')
      }
    }
    setIsLoading(false)
  }, [])

  const handleProfileComplete = (profile) => {
    localStorage.setItem('samsara_user_profile', JSON.stringify(profile))
    setUserProfile(profile)
  }

  const handleLogout = () => {
    localStorage.removeItem('samsara_user_profile')
    setUserProfile(null)
  }

  if (isLoading) return null

  return (
    <>
      <div className="bg-ambient" />
      {!userProfile ? (
        <Onboarding onComplete={handleProfileComplete} />
      ) : (
        <ChatPage userProfile={userProfile} onLogout={handleLogout} />
      )}
    </>
  )
}

export default App
