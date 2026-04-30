import { useState } from 'react'
import monkIcon from '/monk.png'

export default function Onboarding({ onComplete }) {
  const [form, setForm] = useState({ name: '', age: '', gender: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.age || form.age < 10 || form.age > 120) newErrors.age = 'Enter a valid age (10-120)'
    if (!form.gender) newErrors.gender = 'Please select your gender'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onComplete({ ...form, age: parseInt(form.age, 10) })
    }
  }

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <div className="onboarding-logo">
          <img src={monkIcon} alt="Samsara" className="onboarding-logo-img" />
          <h1>Samsara</h1>
        </div>
        <p className="onboarding-subtitle">
          Your compassionate mental health companion.<br />
          Let's get to know you a little better.
        </p>

        <form className="onboarding-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Your Name <span className="required">*</span></label>
            <input
              id="name"
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter your name"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              autoFocus
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="age">Age <span className="required">*</span></label>
            <input
              id="age"
              type="number"
              className={`form-input ${errors.age ? 'error' : ''}`}
              placeholder="Enter your age"
              value={form.age}
              onChange={(e) => handleChange('age', e.target.value)}
              min="10"
              max="120"
            />
            {errors.age && <span className="form-error">{errors.age}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender <span className="required">*</span></label>
            <select
              id="gender"
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
            {errors.gender && <span className="form-error">{errors.gender}</span>}
          </div>

          <button type="submit" className="form-submit-btn">
            Begin Your Journey ✨
          </button>
        </form>
      </div>
    </div>
  )
}
