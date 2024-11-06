// frontend/pages/login.js
import { useState } from 'react';
import axios from '../utils/axiosInstance'; // Updated import
import { useRouter } from 'next/router';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/login', { username, password }); // Updated endpoint
      localStorage.setItem('token', response.data.token);
      router.push('/events');
    } catch (error) {
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form className="bg-white p-6 rounded shadow-md" onSubmit={handleLogin}>
        <h2 className="text-2xl text-black mb-4">Login</h2>
        <div className="mb-4">
          <label className="text-black block mb-1">Username</label>
          <input
            type="text"
            className="w-full text-black border px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="text-black block mb-1">Password</label>
          <input
            type="password"
            className="w-full text-black border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-black py-2 rounded"
        >
          Login
        </button>
        <button
          type="button"
          className="w-full mt-2 bg-green-500 text-black py-2 rounded"
          onClick={() => router.push('/register')}
        >
          Register
        </button>
      </form>
    </div>
  );
}
