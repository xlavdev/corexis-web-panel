import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import SiteFooter from '../components/layout/SiteFooter';

function Field({ id, label, type = 'text', value, onChange, required }) {
  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder=" "
        autoComplete="on"
        className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-[#121212] appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
      />
      <label
        htmlFor={id}
        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-custom-back px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
      >
        {label}
      </label>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password
      });
      if (res.data.success) {
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#09090d] text-white min-h-screen flex flex-col">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-blue-500/5 rounded-full blur-3xl animate-spin-slow" />
      </div>

      <section className="flex items-center justify-center min-h-screen relative z-10 py-10">
        <div className="bg-custom-back rounded-xl p-4 md:p-10 w-full max-w-lg flex flex-col justify-center mx-2">
          {/* Logo Banner */}
          <div className="flex justify-center mb-3">
            <Link to="/">
              <span className="text-3xl font-bold tracking-tight text-white">COREXIS</span>
            </Link>
          </div>
          <h3 className="mb-8 text-sm md:text-lg text-center font-normal text-gray-300">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:underline">
              Log in
            </Link>
          </h3>

          <form className="space-y-4 md:space-y-6 flex-1" onSubmit={handleSubmit}>
            {error && <div className="text-sm text-red-500 text-center">{error}</div>}
            {success && <div className="text-sm text-green-500 text-center">{success}</div>}

            <Field
              id="username"
              label="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
            <Field
              id="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Field
              id="password"
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <Field
              id="confirmpassword"
              label="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-white">I Agree To:</span>
              </div>
              <ul className="w-full text-sm font-medium rounded-lg bg-custom-back-1 text-white divide-y divide-[#121212]">
                <li className="w-full">
                  <div className="flex items-center pl-3">
                    <input
                      id="wontshareCB"
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded focus:ring-blue-600 bg-[#09090d] border-[#121212]"
                    />
                    <label htmlFor="wontshareCB" className="w-full py-3 ml-2 text-sm font-medium text-gray-300">
                      Not share my account
                    </label>
                  </div>
                </li>
                <li className="w-full">
                  <div className="flex items-center pl-3">
                    <input
                      id="wontdisputeCB"
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded focus:ring-blue-600 bg-[#09090d] border-[#121212]"
                    />
                    <label htmlFor="wontdisputeCB" className="w-full py-3 ml-2 text-sm font-medium text-gray-300">
                      Not make any disputes (contact support)
                    </label>
                  </div>
                </li>
                <li className="w-full">
                  <div className="flex items-center pl-3">
                    <input
                      id="tosCB"
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded focus:ring-blue-600 bg-[#09090d] border-[#121212]"
                    />
                    <label htmlFor="tosCB" className="w-full py-3 ml-2 text-sm font-medium text-gray-300">
                      Follow{' '}
                      <a href="https://keyauth.cc/terms/" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                        Terms and Conditions
                      </a>
                    </label>
                  </div>
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer text-white hover:bg-blue-700 focus:ring-0 focus:outline-none transition duration-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center items-center mb-3 w-full bg-custom-back-1 disabled:opacity-50"
            >
              <span className="inline-flex">
                {loading ? 'Creating account...' : 'Register'}
                <svg
                  className="w-3.5 h-3.5 ml-2 mt-1"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 5h12m0 0L9 1m4 4L9 9"
                  />
                </svg>
              </span>
            </button>

            <div className="flex items-center my-6 lg:my-8 sm:mx-auto">
              <hr className="flex-grow border-gray-700" />
              <span className="mx-4 text-gray-400">or</span>
              <hr className="flex-grow border-gray-700" />
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-4 my-6 -mt-3 -mb-3">
            <a
              href="https://keyauth.cc/api-php/discordOAuth/?a=login"
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center justify-center text-center bg-custom-back-1 px-4 py-4 rounded-xl w-[92px] shadow-md hover:shadow-lg transition hover:scale-105 cursor-pointer"
            >
              <svg viewBox="0 0 256 199" width="25" height="25" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
                <path d="M216.856 16.597A208.502 208.502 0 0 0 164.042 0c-2.275 4.113-4.933 9.645-6.766 14.046-19.692-2.961-39.203-2.961-58.533 0-1.832-4.4-4.55-9.933-6.846-14.046a207.809 207.809 0 0 0-52.855 16.638C5.618 67.147-3.443 116.4 1.087 164.956c22.169 16.555 43.653 26.612 64.775 33.193A161.094 161.094 0 0 0 79.735 175.3a136.413 136.413 0 0 1-21.846-10.632 108.636 108.636 0 0 0 5.356-4.237c42.122 19.702 87.89 19.702 129.51 0a131.66 131.66 0 0 0 5.355 4.237 136.07 136.07 0 0 1-21.886 10.653c4.006 8.02 8.638 15.67 13.873 22.848 21.142-6.58 42.646-16.637 64.815-33.213 5.316-56.288-9.08-105.09-38.056-148.36ZM85.474 135.095c-12.645 0-23.015-11.805-23.015-26.18s10.149-26.2 23.015-26.2c12.867 0 23.236 11.804 23.015 26.2.02 14.375-10.148 26.18-23.015 26.18Zm85.051 0c-12.645 0-23.014-11.805-23.014-26.18s10.148-26.2 23.014-26.2c12.867 0 23.236 11.804 23.015 26.2 0 14.375-10.148 26.18-23.015 26.18Z" fill="#5865F2" />
              </svg>
            </a>

            <a
              href="https://appleid.apple.com/auth/authorize?client_id=cc.keyauth.dash&redirect_uri=https%3A%2F%2Fkeyauth.cc%2Fapi-php%2FappleOAuth%2F&response_type=code%20id_token&scope=email&response_mode=form_post"
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center justify-center text-center bg-custom-back-1 px-4 py-4 rounded-xl w-[92px] shadow-md hover:shadow-lg transition hover:scale-105 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 814 1000">
                <path fill="#fff" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
              </svg>
            </a>

            <button
              type="button"
              className="flex flex-col items-center justify-center text-center bg-custom-back-1 px-4 py-4 rounded-xl w-[92px] shadow-md hover:shadow-lg transition hover:scale-105 cursor-pointer"
            >
              <svg width="25" height="25" viewBox="0 0 256 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
                <path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4" />
                <path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853" />
                <path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05" />
                <path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335" />
              </svg>
            </button>

            <button
              type="button"
              className="flex flex-col items-center justify-center text-center bg-custom-back-1 px-4 py-4 rounded-xl w-[92px] shadow-md hover:shadow-lg transition hover:scale-105 cursor-pointer"
            >
              <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" width="25" height="25" preserveAspectRatio="xMidYMid">
                <defs>
                  <linearGradient id="tg-a-reg" x1="50%" x2="50%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#2AABEE" />
                    <stop offset="100%" stopColor="#229ED9" />
                  </linearGradient>
                </defs>
                <path fill="url(#tg-a-reg)" d="M128 0C94.06 0 61.48 13.494 37.5 37.49A128.038 128.038 0 0 0 0 128c0 33.934 13.5 66.514 37.5 90.51C61.48 242.506 94.06 256 128 256s66.52-13.494 90.5-37.49c24-23.996 37.5-56.576 37.5-90.51 0-33.934-13.5-66.514-37.5-90.51C194.52 13.494 161.94 0 128 0Z" />
                <path fill="#FFF" d="M57.94 126.648c37.32-16.256 62.2-26.974 74.64-32.152 35.56-14.786 42.94-17.354 47.76-17.441 1.06-.017 3.42.245 4.96 1.49 1.28 1.05 1.64 2.47 1.82 3.467.16.996.38 3.266.2 5.038-1.92 20.24-10.26 69.356-14.5 92.026-1.78 9.592-5.32 12.808-8.74 13.122-7.44.684-13.08-4.912-20.28-9.63-11.26-7.386-17.62-11.982-28.56-19.188-12.64-8.328-4.44-12.906 2.76-20.386 1.88-1.958 34.64-31.748 35.26-34.45.08-.338.16-1.598-.6-2.262-.74-.666-1.84-.438-2.64-.258-1.14.256-19.12 12.152-54 35.686-5.1 3.508-9.72 5.218-13.88 5.128-4.56-.098-13.36-2.584-19.9-4.708-8-2.606-14.38-3.984-13.82-8.41.28-2.304 3.46-4.662 9.52-7.072Z" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
