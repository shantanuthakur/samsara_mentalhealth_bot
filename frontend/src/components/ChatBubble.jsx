import ReactMarkdown from 'react-markdown'
import monkIcon from '/monk.png'

export default function ChatBubble({ message, userProfile }) {
  const isUser = message.role === 'user'
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })

  const getInitial = () => {
    if (userProfile?.name) return userProfile.name.charAt(0).toUpperCase()
    return '?'
  }

  return (
    <div className={`message message--${isUser ? 'user' : 'bot'}`}>
      <div className="message-avatar">
        {isUser ? getInitial() : <img src={monkIcon} alt="Samsara" className="avatar-icon" />}
      </div>
      <div className="message-content">
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <ReactMarkdown>{message.content}</ReactMarkdown>
        )}
        <span className="message-time">{time}</span>
      </div>
    </div>
  )
}
