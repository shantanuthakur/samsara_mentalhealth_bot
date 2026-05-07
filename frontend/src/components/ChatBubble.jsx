import { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import monkIcon from '/monk.png'

/**
 * Professional ChatBubble with rich markdown rendering,
 * copy-to-clipboard, and polished visual formatting.
 */
export default function ChatBubble({ message, userProfile }) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })

  const getInitial = () => {
    if (userProfile?.name) return userProfile.name.charAt(0).toUpperCase()
    return '?'
  }

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = message.content
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [message.content])

  // Custom renderers for rich markdown display
  const markdownComponents = {
    // Headings with distinct styling
    h1: ({ children }) => <h3 className="md-heading md-h1">{children}</h3>,
    h2: ({ children }) => <h4 className="md-heading md-h2">{children}</h4>,
    h3: ({ children }) => <h5 className="md-heading md-h3">{children}</h5>,

    // Paragraphs
    p: ({ children }) => <p className="md-paragraph">{children}</p>,

    // Strong & emphasis
    strong: ({ children }) => <strong className="md-strong">{children}</strong>,
    em: ({ children }) => <em className="md-em">{children}</em>,

    // Lists
    ul: ({ children }) => <ul className="md-list md-ul">{children}</ul>,
    ol: ({ children }) => <ol className="md-list md-ol">{children}</ol>,
    li: ({ children }) => (
      <li className="md-list-item">
        <span className="md-list-bullet" aria-hidden="true" />
        <span className="md-list-content">{children}</span>
      </li>
    ),

    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="md-blockquote">
        <div className="md-blockquote-accent" />
        <div className="md-blockquote-content">{children}</div>
      </blockquote>
    ),

    // Inline code
    code: ({ inline, className, children }) => {
      if (inline) {
        return <code className="md-inline-code">{children}</code>
      }
      // Code blocks
      const language = className?.replace('language-', '') || ''
      return (
        <div className="md-code-block">
          {language && (
            <div className="md-code-header">
              <span className="md-code-lang">{language}</span>
              <button
                className="md-code-copy"
                onClick={() => {
                  navigator.clipboard.writeText(String(children).replace(/\n$/, ''))
                }}
                title="Copy code"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
          )}
          <pre className="md-code-pre">
            <code className={`md-code ${className || ''}`}>{children}</code>
          </pre>
        </div>
      )
    },

    // Links
    a: ({ href, children }) => (
      <a href={href} className="md-link" target="_blank" rel="noopener noreferrer">
        {children}
        <svg className="md-link-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>
    ),

    // Horizontal rule
    hr: () => <hr className="md-hr" />,

    // Tables
    table: ({ children }) => (
      <div className="md-table-wrap">
        <table className="md-table">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="md-thead">{children}</thead>,
    tbody: ({ children }) => <tbody className="md-tbody">{children}</tbody>,
    tr: ({ children }) => <tr className="md-tr">{children}</tr>,
    th: ({ children }) => <th className="md-th">{children}</th>,
    td: ({ children }) => <td className="md-td">{children}</td>,
  }

  return (
    <div className={`message message--${isUser ? 'user' : 'bot'}`}>
      {/* Avatar */}
      <div className="message-avatar">
        {isUser ? (
          <span className="message-avatar-initial">{getInitial()}</span>
        ) : (
          <img src={monkIcon} alt="Samsara" className="avatar-icon" />
        )}
      </div>

      {/* Message body */}
      <div className="message-body">
        {/* Sender label */}
        <div className="message-meta">
          <span className="message-sender">
            {isUser ? (userProfile?.name || 'You') : 'Mental Health AI'}
          </span>
          <span className="message-time">{time}</span>
        </div>

        {/* Content */}
        <div className="message-content">
          {isUser ? (
            <p className="md-paragraph">{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={markdownComponents}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Actions (bot messages only) */}
        {!isUser && message.content && (
          <div className="message-actions">
            <button
              className={`message-action-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
              title={copied ? 'Copied!' : 'Copy message'}
              aria-label="Copy message"
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
