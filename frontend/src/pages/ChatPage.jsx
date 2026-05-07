import { useState, useRef, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import ChatBubble from '../components/ChatBubble'
import ProfileModal from '../components/ProfileModal'
import monkIcon from '/monk.png'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const CHAT_HISTORY_KEY = 'samsara_chat_history'
const MAX_HISTORY = 8

// Suggestion cards for the welcome screen
const WELCOME_SUGGESTIONS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    iconColor: '#C4956A',
    iconBg: 'rgba(196,149,106,0.12)',
    text: "I'm feeling anxious today.\nCan you help me calm down?"
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4"/>
        <path d="M12 8h.01"/>
      </svg>
    ),
    iconColor: '#9D6B33',
    iconBg: 'rgba(157,107,51,0.12)',
    text: "What are some techniques\nto manage stress?"
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    ),
    iconColor: '#8C5D30',
    iconBg: 'rgba(140,93,48,0.12)',
    text: "I need someone to talk to\nabout my day."
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/>
      </svg>
    ),
    iconColor: '#B58452',
    iconBg: 'rgba(181,132,82,0.12)',
    text: "Can you suggest some\nself-care activities?"
  },
]

export default function ChatPage({ userProfile, onSave }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const hasSentGreeting = useRef(false)

  // Load chat history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(CHAT_HISTORY_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.length > 0) {
          setMessages(parsed)
          hasSentGreeting.current = true
          return
        }
      } catch (e) {
        localStorage.removeItem(CHAT_HISTORY_KEY)
      }
    }
  }, [])

  // Send initial greeting if no saved history
  useEffect(() => {
    if (!hasSentGreeting.current && messages.length === 0) {
      hasSentGreeting.current = true
      const namePart = userProfile?.name ? ` ${userProfile.name}` : ''
      const greeting = {
        role: 'assistant',
        content: `Hello${namePart}! 🌿 Welcome to Samsara Mental Health AI. I'm your compassionate mental health companion, here to listen and support you.\n\nHow are you feeling today? Take your time — there's no rush. 💚`,
        timestamp: new Date().toISOString()
      }
      setMessages([greeting])
    }
  }, [userProfile, messages.length])

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages))
    }
  }, [messages])

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])


  const sendMessageDirect = async (messageText) => {
    const trimmed = messageText.trim()
    if (!trimmed || isTyping) return

    const userMessage = {
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString()
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsTyping(true)

    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const history = updatedMessages.slice(-MAX_HISTORY).map(m => ({
      role: m.role,
      content: m.content
    }))

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          user_profile: userProfile,
          conversation_history: history
        })
      })

      if (!res.ok) throw new Error('Server error')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let isFirstChunk = true

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        if (value) {
          const chunkValue = decoder.decode(value, { stream: true })

          if (isFirstChunk) {
            // Hide typing dots and add bot message with first chunk
            setIsTyping(false)
            isFirstChunk = false
            const botMessage = {
              role: 'assistant',
              content: chunkValue,
              timestamp: new Date().toISOString()
            }
            setMessages(prev => [...prev, botMessage])
          } else {
            // Append subsequent chunks to the last message
            setMessages(prev => {
              const newMessages = [...prev]
              newMessages[newMessages.length - 1] = {
                ...newMessages[newMessages.length - 1],
                content: newMessages[newMessages.length - 1].content + chunkValue
              }
              return newMessages
            })
          }
        }
      }
    } catch (err) {
      const errorMessage = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please make sure the backend server is running on port 4000 and try again. 🌿",
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || isTyping) return
    sendMessageDirect(trimmed)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleTextareaInput = (e) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const handleNewChat = () => {
    setMessages([])
    localStorage.removeItem(CHAT_HISTORY_KEY)
    hasSentGreeting.current = false
    setTimeout(() => {
      hasSentGreeting.current = true
      const newGreeting = [{
        role: 'assistant',
        content: `Welcome back, ${userProfile?.name || 'friend'}! 🌿\n\nHow are you feeling right now? I'm here to listen. 💚`,
        timestamp: new Date().toISOString()
      }]
      setMessages(newGreeting)
    }, 300)
  }

  const getInitial = () => {
    if (userProfile?.name) return userProfile.name.charAt(0).toUpperCase()
    return '?'
  }

  // Determine if we show the welcome screen (no messages yet, not typing)
  const showWelcome = messages.length === 0 && !isTyping

  return (
    <div className="app-layout">
      <Sidebar
        userProfile={userProfile}
        onNewChat={handleNewChat}
        onOpenProfile={() => setIsProfileOpen(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="chat-area">
        {/* Header */}
        <div className="chat-header">
          {/* Hamburger for sidebar */}
          <button
            id="open-sidebar-btn"
            className="chat-header-menu-btn"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="chat-header-guru-wrap">
            <div className="chat-header-guru-ring">
              <img src={monkIcon} alt="AI Guru" className="chat-header-guru-img" />
            </div>
          </div>
          <div className="chat-header-info">
            <h2 className="chat-header-title">Mental Health Bot</h2>
            <p className="chat-header-subtitle">
              Your supportive companion
            </p>
          </div>

          {/* Right side icons */}
          <div className="chat-header-actions">
            {/* New Chat */}
            <button
              className="chat-header-icon-btn"
              onClick={handleNewChat}
              title="New Chat"
              aria-label="New Chat"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <line x1="12" y1="8" x2="12" y2="14"/>
                <line x1="9" y1="11" x2="15" y2="11"/>
              </svg>
            </button>

            {/* Profile */}
            <button
              id="open-profile-btn"
              className="chat-header-icon-btn"
              onClick={() => setIsProfileOpen(true)}
              title="View Profile"
              aria-label="Profile"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages / Welcome */}
        <div className="chat-messages">
          {showWelcome && (
            <div className="welcome-screen">
              {/* Avatar Circle with "MH" text */}
              <div className="welcome-avatar-wrap">
                <div className="welcome-avatar-ring">
                  <span className="welcome-avatar-text">MH</span>
                </div>
                <div className="welcome-avatar-glow" />
              </div>

              {/* Welcome Text */}
              <h1 className="welcome-title">Welcome to Mental Health Bot</h1>
              <p className="welcome-subtitle">
                I'm here to listen and support you. Feel free to share what's on your mind, or choose one of the suggestions below.
              </p>

              {/* Suggestion Cards Grid */}
              <div className="welcome-cards-grid">
                {WELCOME_SUGGESTIONS.map((card, i) => (
                  <button
                    key={i}
                    className="welcome-card"
                    onClick={() => {
                      const cleanText = card.text.replace('\n', ' ')
                      sendMessageDirect(cleanText)
                    }}
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div className="welcome-card-icon" style={{ color: card.iconColor, background: card.iconBg }}>
                      {card.icon}
                    </div>
                    <span className="welcome-card-text">
                      {card.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <ChatBubble
              key={idx}
              message={msg}
              userProfile={userProfile}
            />
          ))}


          {/* Typing indicator */}
          {isTyping && (
            <div className="typing-indicator-wrap">
              <div className="typing-guru-avatar">
                <img src={monkIcon} alt="Samsara" className="avatar-icon" />
              </div>
              <div className="typing-bubble">
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-area">
          <div className="chat-input-container">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind..."
              rows={1}
              disabled={isTyping}
            />
            <button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <p className="chat-disclaimer">Samsara is an AI companion, not a medical professional.</p>
        </div>
      </main>

      {/* Profile Modal — only Name, Age, Gender */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        onSave={(profile) => {
          onSave(profile)
          setIsProfileOpen(false)
        }}
        required={false}
      />
    </div>
  )
}
