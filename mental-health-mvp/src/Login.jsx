import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    setError('');
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Login / Sign Up</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded"
        />
        {error && <div className="text-red-500 mb-3 text-sm">{error}</div>}
        <div className="flex gap-2 mb-3">
          <button
            onClick={handleSignUp}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex-1"
            disabled={loading}
            type="button"
          >
            Sign Up
          </button>
          <button
            onClick={handleLogin}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex-1"
            disabled={loading}
            type="button"
          >
            Login
          </button>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full mb-3"
          disabled={loading}
          type="button"
        >
          Continue with Google
        </button>
        <button
          onClick={handleLogout}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 w-full"
          disabled={loading}
          type="button"
        >
          Logout
        </button>
      </form>
    </div>
  );
}

export default Login;
