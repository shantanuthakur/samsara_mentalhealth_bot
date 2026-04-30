import { useState, useRef, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import ChatBubble from '../components/ChatBubble'
import monkIcon from '/monk.png'

const API_URL = 'http://localhost:4000'
const CHAT_HISTORY_KEY = 'samsara_chat_history'
const MAX_HISTORY = 8

export default function ChatPage({ userProfile, onLogout }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
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
    if (!hasSentGreeting.current && userProfile && messages.length === 0) {
      hasSentGreeting.current = true
      const greeting = {
        role: 'assistant',
        content: `Hello ${userProfile.name}! 🌿 Welcome to Samsara. I'm your compassionate mental health companion, here to listen and support you.\n\nHow are you feeling today? Take your time — there's no rush. 💚`,
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

      const data = await res.json()
      const botMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, botMessage])
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

  return (
    <div className="app-layout">
      <Sidebar
        userProfile={userProfile}
        onNewChat={handleNewChat}
        onLogout={onLogout}
      />

      <main className="chat-area">
        {/* Header */}
        <div className="chat-header">
          <img src={monkIcon} alt="Samsara" className="chat-header-icon" />
          <div>
            <h2>Samsara — Mental Health Companion</h2>
            <p className="chat-header-subtitle">Powered by AI • Not a substitute for professional help</p>
          </div>
          <div className="chat-header-dot" />
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 && !isTyping && (
            <div className="welcome-message">
              <img src={monkIcon} alt="Samsara" className="welcome-icon-img" />
              <h2>Welcome to Samsara</h2>
              <p>A safe space for your thoughts and feelings. Start by saying hello, or share what's on your mind.</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <ChatBubble
              key={idx}
              message={msg}
              userProfile={userProfile}
            />
          ))}

          {isTyping && (
            <div className="typing-indicator">
              <div className="message-avatar">
                <img src={monkIcon} alt="Samsara" className="avatar-icon" />
              </div>
              <div className="typing-dots">
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
          <p className="chat-disclaimer">
            Samsara is an AI companion and does not replace professional mental health care.
          </p>
        </div>
      </main>
    </div>
  )
}
