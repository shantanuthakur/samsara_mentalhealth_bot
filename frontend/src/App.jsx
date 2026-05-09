import { useState, useEffect } from 'react'
import './App.css'
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

  const handleProfileUpdate = (profile) => {
    const merged = { ...(userProfile || {}), ...profile }
    localStorage.setItem('samsara_user_profile', JSON.stringify(merged))
    setUserProfile(merged)
  }

  if (isLoading) return null

  return (
    <>
      <div className="bg-ambient" />

      <ChatPage
        userProfile={userProfile}
        onProfileUpdate={handleProfileUpdate}
      />
    </>
  )
}

export default App
