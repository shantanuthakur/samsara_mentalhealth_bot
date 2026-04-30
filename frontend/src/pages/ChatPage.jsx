import { useState, useRef, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import ChatBubble from '../components/ChatBubble'
import monkIcon from '/monk.png'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const CHAT_HISTORY_KEY = 'samsara_chat_history'
const MAX_HISTORY = 8

export default function ChatPage({ userProfile, onOpenProfile }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
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

  const sendMessage = async () => {
    const trimmed = input.trim()
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

    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    // Build conversation history — last 8 messages for context
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

      const botMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, botMessage])

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        if (value) {
          const chunkValue = decoder.decode(value, { stream: true })
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
        content: `Welcome back, ${userProfile.name}! 🌿\n\nHow are you feeling right now? I'm here to listen. 💚`,
        timestamp: new Date().toISOString()
      }]
      setMessages(newGreeting)
    }, 300)
  }

  const getInitial = () => {
    if (userProfile?.name) return userProfile.name.charAt(0).toUpperCase()
    return '?'
  }

  return (
    <div className="app-layout">
      <Sidebar
        userProfile={userProfile}
        onNewChat={handleNewChat}
        onOpenProfile={onOpenProfile}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="chat-area">
        {/* Header */}
        <div className="chat-header">
          <img src={monkIcon} alt="Samsara" className="chat-header-icon" />
          <div>
            <h2>Samsara Mental Health AI</h2>
            <p className="chat-header-subtitle">Mental Health AI Advisor</p>
          </div>
          <div className="chat-header-avatar" onClick={() => setIsSidebarOpen(true)}>
            {getInitial()}
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 && !isTyping && (
            <div className="welcome-message">
              <img src={monkIcon} alt="Samsara" className="welcome-icon-img" />
              <h2>Welcome to Samsara Mental Health AI</h2>
              <p>A safe, private space for your thoughts and feelings. I'm here to listen — no judgment, just support.</p>
              <div style={{ 
                display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '28px', justifyContent: 'center', maxWidth: '460px' 
              }}>
                {[
                  "I'm feeling anxious lately 😟",
                  "I need help with stress 🌿",
                  "I can't sleep well 😴",
                  "I just want to talk 💬"
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(suggestion)
                      if (textareaRef.current) textareaRef.current.focus()
                    }}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '24px',
                      border: '1px solid var(--border-glass)',
                      background: 'rgba(255,253,250,0.8)',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-family)',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backdropFilter: 'blur(4px)',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'var(--bg-glass-hover)'
                      e.currentTarget.style.borderColor = 'var(--border-accent)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = 'var(--shadow-glow)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(255,253,250,0.8)'
                      e.currentTarget.style.borderColor = 'var(--border-glass)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    {suggestion}
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
        </div>
      </main>
    </div>
  )
}
