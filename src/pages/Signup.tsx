import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Facebook } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    areaCode: '+507'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  // Array of area codes (can be fetched from an API in the future)
  const [areaCodes] = useState([
    { code: '+507', country: 'PA', flag: '🇵🇦' },
    { code: '+1', country: 'US', flag: '🇺🇸' },
    { code: '+52', country: 'MX', flag: '🇲🇽' },
    { code: '+54', country: 'AR', flag: '🇦🇷' },
    // Add more area codes as needed
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      const fullPhoneNumber = `${formData.areaCode}${formData.phone}`;
      await signUp(formData.email, formData.password, {
        name: formData.name,
        phone: fullPhoneNumber,
        role: formData.role
      });
      navigate('/');
    } catch (err) {
      setError('Failed to create an account');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 pb-12 flex flex-col bg-gray-50">
      <div className="flex-grow flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 py-8">
          <div className="bg-white shadow-lg rounded-lg px-8 py-10">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Create Your Account
            </h2>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Using</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6168 0 3.1013.5558 4.27 1.4847l3.283-3.283C17.5913 1.7117 14.8947.5 12 .5 7.8633.5 4.1931 2.7191 2.2362 6.0229l3.8222 2.9709C7.052 6.4274 9.3371 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12c0-.8547-.0777-1.6788-.2206-2.4788l-11.2794.0041v4.6271h6.4562c-.2771 1.4938-1.1167 2.7583-2.3788 3.6084l3.8088 2.9708c2.2225-2.0625 3.6138-5.0959 3.6138-8.7316z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M6.0584 14.4938l-3.8222 2.9708C3.7663 21.2809 7.4365 23.5 12 23.5c2.8947 0 5.5913-1.2117 7.553-3.2809l-3.8087-2.9708c-1.0563.7083-2.4087 1.1271-3.7443 1.1271-2.6629 0-4.948-1.4274-5.9416-3.8816z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23.5c4.5635 0 8.2337-2.2191 10.1906-5.5229l-3.8088-2.9708c-1.0479 1.7604-2.9791 2.9687-5.1635 2.9687-2.6629 0-4.948-1.4274-5.9416-3.8816L2.2362 17.977C4.1931 21.2809 7.8633 23.5 12 23.5z"
                    />
                  </svg>
                  <span className="ml-2">Google</span>
                </button>

                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-[#1877F2] text-sm font-medium text-white hover:bg-[#1874EA]"
                >
                  <Facebook className="h-5 w-5" />
                  <span className="ml-2">Facebook</span>
                </button>
              </div>
            </div>
            
            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or manually</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <User className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 relative flex">
                  <select
                    name="areaCode"
                    value={formData.areaCode}
                    onChange={handleChange}
                    className="appearance-none block px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {areaCodes.map(({ code, country, flag }) => (
                      <option key={code} value={code}>
                        {flag} {country} ({code})
                      </option>
                    ))}
                  </select>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div hidden>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  I want to
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="student">Learn as a Student</option>
                  <option value="instructor">Teach as an Instructor</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}