import { useState, useEffect } from 'react'
import monkIcon from '/monk.png'

export default function ProfileModal({ isOpen, onClose, userProfile, onSave, required }) {
  const [form, setForm] = useState({ name: '', age: '', gender: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (userProfile) {
      setForm({
        name: userProfile.name || '',
        age: userProfile.age || '',
        gender: userProfile.gender || ''
      })
    }
  }, [userProfile, isOpen])

  if (!isOpen) return null

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.age || form.age < 10 || form.age > 120) newErrors.age = 'Enter a valid age (10–120)'
    if (!form.gender) newErrors.gender = 'Please select your gender'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSave({ ...form, age: parseInt(form.age, 10) })
      onClose()
    }
  }

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  return (
    <div className="modal-overlay" onClick={!required ? onClose : undefined}>
      <div className="modal-container profile-modal" onClick={e => e.stopPropagation()}>

        {/* Close button */}
        {!required && (
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        {/* Guru Hero */}
        <div className="profile-modal-hero">
          <div className="profile-modal-guru-ring">
            <img src={monkIcon} alt="AI Guru" className="profile-modal-guru-img" />
          </div>
          <div className="profile-modal-guru-glow" />
        </div>

        <h2 className="modal-title">
          {required ? 'Welcome to Samsara 🌿' : 'Your Profile'}
        </h2>
        <p className="modal-subtitle">
          {required
            ? 'Tell me a little about yourself so I can support you better.'
            : 'Update your details to personalize your experience.'}
        </p>

        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="form-group">
            <label htmlFor="profile-name">
              <span className="form-label-icon">👤</span>
              Your Name <span className="required">*</span>
            </label>
            <input
              id="profile-name"
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter your name"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              autoFocus={required}
            />
            {errors.name && <span className="form-error">⚠ {errors.name}</span>}
          </div>

          {/* Age */}
          <div className="form-group">
            <label htmlFor="profile-age">
              <span className="form-label-icon">🎂</span>
              Age <span className="required">*</span>
            </label>
            <input
              id="profile-age"
              type="number"
              className={`form-input ${errors.age ? 'error' : ''}`}
              placeholder="Enter your age"
              value={form.age}
              onChange={(e) => handleChange('age', e.target.value)}
              min="10"
              max="120"
            />
            {errors.age && <span className="form-error">⚠ {errors.age}</span>}
          </div>

          {/* Gender */}
          <div className="form-group">
            <label htmlFor="profile-gender">
              <span className="form-label-icon">🌸</span>
              Gender <span className="required">*</span>
            </label>
            <select
              id="profile-gender"
              className={`form-input ${errors.gender ? 'error' : ''}`}
              value={form.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            {errors.gender && <span className="form-error">⚠ {errors.gender}</span>}
          </div>

          <button type="submit" id="profile-save-btn" className="form-submit-btn">
            {required ? 'Begin Your Journey ✨' : 'Save Profile'}
          </button>
        </form>

        {/* Profile summary card (shown when editing, not required) */}
        {!required && userProfile?.name && (
          <div className="profile-summary-card">
            <div className="profile-summary-avatar">{userProfile.name.charAt(0).toUpperCase()}</div>
            <div>
              <div className="profile-summary-name">{userProfile.name}</div>
              <div className="profile-summary-meta">
                {userProfile.age && `Age ${userProfile.age}`}
                {userProfile.age && userProfile.gender && ' · '}
                {userProfile.gender}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
