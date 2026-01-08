// FILE: components/Sign-in.tsx (No changes needed here, it uses 'export default')

"use client"; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client'; 

export default function SignInForm() {
  const [email, setEmail] = useState('test@ossean.in'); 
  const [password, setPassword] = useState('devpass123'); 
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
        const result = await authClient.signIn.email({
            email,
            password,
        });

        if (result && result.error) {
            setError(`Login failed: ${result.error.message || "Check your credentials or server logs."}`);
            console.error("Client login attempt failed with server error:", result.error);
        } else {
            // Success! Redirects to the home page.
            router.push('/home'); 
        }
    } catch (e) {
        console.error("Network or Unexpected Error during Sign In:", e);
        setError("An unexpected error occurred. Please check server logs.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h1 className="text-3xl font-bold mb-6">Login / Sign Up</h1>
      
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-6 bg-gray-800 rounded-lg shadow-md">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        {/* Email Input */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 mt-1 text-black bg-white border border-gray-600 rounded-md focus:outline-none"
            required
            placeholder="test@ossean.in"
          />
        </div>
        
        {/* Password Input */}
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 mt-1 text-black bg-white border border-gray-600 rounded-md focus:outline-none"
            required
            placeholder="devpass123"
          />
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}