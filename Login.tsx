import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { loginUser } from '../services/storageService';
import { Button } from './Button';
import { Input } from './Input';
import { School } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.TEACHER);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const user = loginUser(username, password, role);
    if (user) {
      onLogin(user);
    } else {
      setError('Nom d\'utilisateur ou mot de passe incorrect.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        
        {/* Branding Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-100 p-4 rounded-full mb-4">
            <School className="h-12 w-12 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Absence Manager</h1>
          <p className="text-xs text-gray-500 mt-2 font-medium tracking-wide uppercase">Developed by Amine OUCHKIR</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type d'utilisateur</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole(UserRole.TEACHER)}
                className={`text-xs sm:text-sm py-2 px-1 rounded-md border transition-colors ${role === UserRole.TEACHER ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
              >
                Enseignant
              </button>
              <button
                type="button"
                onClick={() => setRole(UserRole.SUPERVISOR)}
                className={`text-xs sm:text-sm py-2 px-1 rounded-md border transition-colors ${role === UserRole.SUPERVISOR ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
              >
                Surveillant
              </button>
              <button
                type="button"
                onClick={() => setRole(UserRole.ADMIN)}
                className={`text-xs sm:text-sm py-2 px-1 rounded-md border transition-colors ${role === UserRole.ADMIN ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
              >
                Admin
              </button>
            </div>
          </div>

          <Input 
            label="Nom d'utilisateur" 
            placeholder="Entrez votre nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <Input 
            label="Mot de passe" 
            type="password"
            placeholder="Entrez votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" fullWidth className="py-3 shadow-md">
            Se connecter
          </Button>
        </form>
      </div>
      
      <p className="mt-8 text-center text-xs text-gray-400">
        © 2026 - Maroc
      </p>
    </div>
  );
};
