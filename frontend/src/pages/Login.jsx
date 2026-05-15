import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Validate email format
  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return 'Email is required';
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return '';
  };

  // Validate password
  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    return '';
  };

  // Handle field blur for validation
  const handleEmailBlur = () => {
    const error = validateEmail(email);
    setErrors((prev) => ({ ...prev, email: error }));
  };

  const handlePasswordBlur = () => {
    const error = validatePassword(password);
    setErrors((prev) => ({ ...prev, password: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Validate all fields
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      });
      return;
    }

    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setServerError(result.error);
    }

    setIsLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const brandVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand */}
      <motion.div
        className="hidden md:flex md:w-1/2 bg-gradient-to-br from-charcoal via-gray-900 to-charcoal flex-col justify-center items-center p-8 relative overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={brandVariants}
      >
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-40 h-40 bg-amber opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-amber opacity-5 rounded-full blur-3xl"></div>

        <motion.div
          className="relative z-10 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-6xl font-playfair font-bold text-off-white mb-4"
            variants={itemVariants}
          >
            Noteflow
          </motion.h1>
          <motion.p
            className="text-xl text-amber font-lora"
            variants={itemVariants}
          >
            Capture your thoughts, organize your ideas
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Right Panel - Form */}
      <motion.div
        className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-charcoal"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <motion.div
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-4xl font-playfair font-bold text-off-white mb-2"
            variants={itemVariants}
          >
            Welcome Back
          </motion.h2>
          <motion.p
            className="text-gray-400 mb-8 font-lora"
            variants={itemVariants}
          >
            Sign in to your account to continue
          </motion.p>

          {serverError && (
            <motion.div
              className="mb-6 p-4 bg-red-900 bg-opacity-20 border border-red-500 rounded-lg text-red-300 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {serverError}
            </motion.div>
          )}

          <motion.form onSubmit={handleSubmit} className="space-y-5" variants={containerVariants}>
            {/* Email Field */}
            <motion.div variants={itemVariants}>
              <label className="block text-off-white mb-2 font-medium text-sm">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: '' }));
                  }
                }}
                onBlur={handleEmailBlur}
                className={`input-field transition-all duration-200 ${
                  errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-amber'
                }`}
                placeholder="your@email.com"
              />
              {errors.email && (
                <motion.p
                  className="text-red-400 text-sm mt-2"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <label className="block text-off-white mb-2 font-medium text-sm">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: '' }));
                  }
                }}
                onBlur={handlePasswordBlur}
                className={`input-field transition-all duration-200 ${
                  errors.password ? 'border-red-500 focus:border-red-500' : 'focus:border-amber'
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <motion.p
                  className="text-red-400 text-sm mt-2"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </motion.button>
          </motion.form>

          {/* Register Link */}
          <motion.p
            className="text-center text-gray-400 mt-8 font-lora"
            variants={itemVariants}
          >
            Don't have an account?{' '}
            <Link to="/register" className="text-amber hover:text-amber hover:underline transition-colors duration-200">
              Register here
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
