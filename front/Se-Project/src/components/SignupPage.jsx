import { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaBriefcase, FaGraduationCap, FaUserTie } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/SignupStyling.css';

function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    occupation: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const occupationOptions = [
    { value: 'full-time', label: 'Full-time Employee', icon: <FaUserTie /> },
    { value: 'part-time', label: 'Part-time Employee', icon: <FaBriefcase /> },
    { value: 'student', label: 'Student', icon: <FaGraduationCap /> },
    { value: 'freelancer', label: 'Freelancer', icon: <FaUser /> }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit called with:', formData);
    setErrors({});

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.occupation) {
      console.log('Missing fields:', formData);
      setErrors({ apiError: 'All fields are required' });
      return;
    }

    if (!validateEmail(formData.email)) {
      console.log('Invalid email:', formData.email);
      setErrors({ email: 'Please enter a valid email' });
      return;
    }

    // if (formData.password.length < 8) {
    //   console.log('Invalid password length:', formData.password);
    //   setErrors({ password: 'Password must be at least 8 characters' });
    //   return;
    // }

    try {
      setIsLoading(true);
      const jobType = formData.occupation === 'full-time' ? 'FullTime' :
                      formData.occupation === 'part-time' ? 'PartTime' :
                      formData.occupation;

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        jobType: jobType
      };

      const headers = { 'Content-Type': 'application/json' };
      console.log('Sending fetch request with payload:', payload);

      const response = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = `Signup failed: ${response.status} ${response.statusText}`;

        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.errors
            ? Object.values(errorData.errors).flat().join('; ')
            : errorData.message || errorMessage;
        } else {
          const text = await response.text();
          errorMessage = text || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        await response.json();
      }

      console.log('Signup successful, redirecting to login');
      alert('Signup successful!');
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Signup error:', err);
      setErrors({ apiError: err.message || 'Signup failed. Please check your network or server configuration.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">
            <span className="money-icon">💰</span>
            <h1>Budget Track</h1>
          </div>
          <h2>Create Your Account</h2>
          <p>Start managing your finances today</p>
        </div>

        {errors.apiError && (
          <div className="error-message">
            {errors.apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="name-fields">
            <div className="form-group">
              <label htmlFor="firstName" className="input-label">
                <FaUser className="input-icon" />
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`form-input ${errors.firstName ? 'input-error' : ''}`}
                placeholder="First Name"
              />
              {errors.firstName && <span className="error-text">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="input-label">
                <FaUser className="input-icon" />
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`form-input ${errors.lastName ? 'input-error' : ''}`}
                placeholder="Last Name"
              />
              {errors.lastName && <span className="error-text">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="input-label">
              <FaEnvelope className="input-icon" />
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="your@email.com"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="input-label">
              <FaLock className="input-icon" />
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="input-label">
              <FaBriefcase className="input-icon" />
              Occupation
            </label>
            <div className="occupation-options">
              {occupationOptions.map((option) => (
                <div 
                  key={option.value}
                  className={`occupation-option ${formData.occupation === option.value ? 'selected' : ''}`}
                  onClick={() => handleChange({
                    target: {
                      name: 'occupation',
                      value: option.value
                    }
                  })}
                >
                  <span className="occupation-icon">{option.icon}</span>
                  {option.label}
                </div>
              ))}
            </div>
            {errors.occupation && <span className="error-text">{errors.occupation}</span>}
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
            {!isLoading && <FaArrowRight className="button-icon" />}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/" className="auth-link">Log in</Link></p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;