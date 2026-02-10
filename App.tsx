import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { SupervisorDashboard } from './components/SupervisorDashboard';
import { User, UserRole } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);

  // Check for existing session (optional, for demo we keep it simple in state, 
  // but let's allow a refresh to logout for security in this context unless we use sessionStorage)
  useEffect(() => {
    // We could load from sessionStorage here if we wanted persistence across refresh
    // For now, refresh logs you out as per standard simple secure app behavior
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="font-sans antialiased text-gray-900 bg-gray-100 min-h-screen">
      {user.role === UserRole.ADMIN && (
        <AdminDashboard currentUser={user} onLogout={handleLogout} />
      )}
      {user.role === UserRole.TEACHER && (
        <TeacherDashboard currentUser={user} onLogout={handleLogout} />
      )}
      {user.role === UserRole.SUPERVISOR && (
        <SupervisorDashboard currentUser={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
