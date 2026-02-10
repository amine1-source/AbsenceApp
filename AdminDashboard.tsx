import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { addUser, getUsers, deleteUser } from '../services/storageService';
import { Button } from './Button';
import { Input } from './Input';
import { UserPlus, LogOut, Shield, Trash2 } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
  currentUser: User;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    fullName: '',
    role: UserRole.TEACHER
  });
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(getUsers());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!newUser.username || !newUser.password || !newUser.fullName) {
      setMsg({ type: 'error', text: 'Veuillez remplir tous les champs.' });
      return;
    }

    try {
      const userToAdd: User = {
        id: Date.now().toString(),
        username: newUser.username,
        password: newUser.password,
        fullName: newUser.fullName,
        role: newUser.role
      };
      addUser(userToAdd);
      setMsg({ type: 'success', text: 'Utilisateur ajouté avec succès.' });
      setNewUser({ username: '', password: '', fullName: '', role: UserRole.TEACHER });
      loadUsers();
    } catch (error) {
      setMsg({ type: 'error', text: (error as Error).message });
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userName}" ?`)) {
      try {
        deleteUser(userId);
        loadUsers();
        setMsg({ type: 'success', text: 'Utilisateur supprimé avec succès.' });
      } catch (error) {
        setMsg({ type: 'error', text: "Erreur lors de la suppression." });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="bg-indigo-700 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <h1 className="text-xl font-bold">Espace Administrateur</h1>
          </div>
          <button onClick={onLogout} className="text-white hover:text-indigo-200">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        
        {/* Welcome */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Bienvenue, {currentUser.fullName}</h2>
          <p className="text-gray-600 mt-1">Gérez les comptes des enseignants et des surveillants généraux. Les données sont sauvegardées automatiquement.</p>
        </div>

        {/* Add User Form */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <UserPlus className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-800">Ajouter un utilisateur</h3>
          </div>

          {msg && (
            <div className={`p-3 mb-4 rounded-md text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type d'utilisateur</label>
              <select 
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value as UserRole})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value={UserRole.TEACHER}>Enseignant</option>
                <option value={UserRole.SUPERVISOR}>Surveillant Général</option>
              </select>
            </div>

            <Input 
              label="Nom Complet" 
              placeholder="Ex: Mohammed Alami"
              value={newUser.fullName}
              onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
            />

            <Input 
              label="Nom d'utilisateur" 
              placeholder="Nom de connexion"
              value={newUser.username}
              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
            />

            <Input 
              label="Mot de passe" 
              type="password"
              placeholder="Mot de passe"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
            />

            <Button type="submit" fullWidth>Créer le compte</Button>
          </form>
        </div>

        {/* User List */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Utilisateurs existants</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identifiant</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.filter(u => u.username !== 'admin').map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === UserRole.TEACHER ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        {user.role === UserRole.TEACHER ? 'Enseignant' : 'Surveillant'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleDeleteUser(user.id, user.fullName)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Supprimer l'utilisateur"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {users.filter(u => u.username !== 'admin').length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Aucun utilisateur créé pour le moment.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};
