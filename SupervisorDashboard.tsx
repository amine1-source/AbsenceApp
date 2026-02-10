import React, { useState, useEffect } from 'react';
import { User, Absence, UserRole } from '../types';
import { getAbsences, deleteAbsence, deleteAllAbsences, getUsers, getAllClasses } from '../services/storageService';
import { Button } from './Button';
import { LogOut, Filter, Trash2, Calendar, User as UserIcon, BookOpen, RefreshCw } from 'lucide-react';

interface SupervisorDashboardProps {
  onLogout: () => void;
  currentUser: User;
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({ onLogout, currentUser }) => {
  const [absences, setAbsences] = useState<Absence[]>([]);
  
  // Data for filters
  const [teachersList, setTeachersList] = useState<User[]>([]);
  const [classesList, setClassesList] = useState<string[]>([]);

  // Filters state
  const [filterTeacher, setFilterTeacher] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    loadAbsences();
    loadFilterData();
  }, []);

  const loadFilterData = () => {
    // Load teachers
    const allUsers = getUsers();
    const teachers = allUsers.filter(u => u.role === UserRole.TEACHER);
    setTeachersList(teachers);

    // Load classes (unique names)
    const allClasses = getAllClasses();
    const uniqueClassNames = Array.from(new Set(allClasses.map(c => c.name))).sort();
    setClassesList(uniqueClassNames);
  };

  const loadAbsences = () => {
    // Only show absences that have been SENT by teachers
    const all = getAbsences().filter(a => a.status === 'sent');
    setAbsences(all);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette absence ?')) {
      // 1. Delete from storage
      deleteAbsence(id);
      // 2. Update UI immediately (Optimistic update)
      setAbsences(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm('ATTENTION: Voulez-vous supprimer TOUTES les absences reçues ? Cette action est irréversible.')) {
      // 1. Delete all sent absences from storage
      deleteAllAbsences();
      // 2. Clear UI immediately
      setAbsences([]);
    }
  };

  // Filter Logic
  const filteredAbsences = absences.filter(abs => {
    // Exact match for dropdowns
    const matchTeacher = filterTeacher ? abs.teacherName === filterTeacher : true;
    const matchClass = filterClass ? abs.className === filterClass : true;
    const matchDate = filterDate ? abs.date === filterDate : true;
    return matchTeacher && matchClass && matchDate;
  });

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <header className="bg-purple-700 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <h1 className="text-xl font-bold">Espace Surveillant</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              type="button" 
              onClick={loadAbsences} 
              className="text-white hover:text-purple-200 p-2" 
              title="Rafraîchir"
            >
               <RefreshCw className="h-5 w-5" />
            </button>
            <button 
              type="button" 
              onClick={onLogout} 
              className="text-white hover:text-purple-200"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
        <p className="max-w-4xl mx-auto text-xs text-purple-200 mt-1">
          {currentUser.fullName}
        </p>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        
        {/* Stats Card */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
           <div>
             <h2 className="text-lg font-semibold text-gray-800">Total Absences Reçues</h2>
             <p className="text-3xl font-bold text-purple-600">{absences.length}</p>
           </div>
           {absences.length > 0 && (
             <Button 
               type="button" 
               variant="danger" 
               onClick={handleDeleteAll} 
               className="text-xs"
             >
               <Trash2 className="w-4 h-4 mr-1 inline" /> Tout supprimer
             </Button>
           )}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
            <Filter className="w-4 h-4 mr-2" /> Filtrage
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* Teacher Filter Dropdown */}
             <div>
               <label className="text-xs font-medium text-gray-500 mb-1 block">Par Professeur</label>
               <div className="relative">
                 <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                 <select 
                    value={filterTeacher}
                    onChange={(e) => setFilterTeacher(e.target.value)}
                    className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500 bg-white appearance-none"
                 >
                   <option value="">Tous les professeurs</option>
                   {teachersList.map(t => (
                     <option key={t.id} value={t.fullName}>{t.fullName}</option>
                   ))}
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
               </div>
             </div>

             {/* Class Filter Dropdown */}
             <div>
               <label className="text-xs font-medium text-gray-500 mb-1 block">Par Classe</label>
               <div className="relative">
                 <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                 <select 
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500 bg-white appearance-none"
                 >
                   <option value="">Toutes les classes</option>
                   {classesList.map((clsName, idx) => (
                     <option key={idx} value={clsName}>{clsName}</option>
                   ))}
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
               </div>
             </div>

             {/* Date Filter */}
             <div>
               <label className="text-xs font-medium text-gray-500 mb-1 block">Par Date</label>
               <div className="relative">
                 <input 
                    type="date" 
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
                 />
               </div>
             </div>
          </div>
          {(filterTeacher || filterClass || filterDate) && (
            <button 
              type="button"
              onClick={() => { setFilterTeacher(''); setFilterClass(''); setFilterDate(''); }}
              className="text-xs text-purple-600 mt-2 hover:underline"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>

        {/* Absences Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
           <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
             <div className="flex justify-between items-center">
               <h3 className="font-semibold text-gray-700">Liste des absences ({filteredAbsences.length})</h3>
               <button 
                 type="button"
                 onClick={loadAbsences} 
                 className="text-xs text-purple-600 hover:underline flex items-center"
               >
                 <RefreshCw className="w-3 h-3 mr-1" /> Actualiser
               </button>
             </div>
           </div>
           
           {/* Mobile View (Cards) */}
           <div className="md:hidden">
             {filteredAbsences.length === 0 ? (
               <p className="p-4 text-center text-gray-500 text-sm">Aucune absence trouvée.</p>
             ) : (
               <div className="divide-y divide-gray-100">
                 {filteredAbsences.map(abs => (
                   <div key={abs.id} className="p-4 hover:bg-gray-50">
                     <div className="flex justify-between items-start mb-2">
                       <span className="font-bold text-gray-800">{abs.studentName}</span>
                       <button 
                         type="button"
                         onClick={() => handleDelete(abs.id)} 
                         className="text-red-500 p-2 -mr-2"
                         aria-label="Supprimer"
                       >
                         <Trash2 className="w-5 h-5" />
                       </button>
                     </div>
                     <div className="grid grid-cols-2 gap-y-1 text-sm text-gray-600">
                       <div className="flex items-center"><UserIcon className="w-3 h-3 mr-1"/> {abs.teacherName}</div>
                       <div className="flex items-center"><BookOpen className="w-3 h-3 mr-1"/> {abs.className}</div>
                       <div className="flex items-center col-span-2"><Calendar className="w-3 h-3 mr-1"/> {abs.date.split('-').reverse().join('/')} ({abs.startTime} - {abs.endTime})</div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>

           {/* Desktop View (Table) */}
           <div className="hidden md:block overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Élève</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classe</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Professeur</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Heure</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {filteredAbsences.map(abs => (
                   <tr key={abs.id} className="hover:bg-gray-50">
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{abs.studentName}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{abs.className}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{abs.teacherName}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                       {abs.date.split('-').reverse().join('/')} <span className="text-gray-400">|</span> {abs.startTime} - {abs.endTime}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                       <button 
                         type="button"
                         onClick={() => handleDelete(abs.id)} 
                         className="text-red-600 hover:text-red-900"
                       >
                         Supprimer
                       </button>
                     </td>
                   </tr>
                 ))}
                 {filteredAbsences.length === 0 && (
                   <tr>
                     <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">Aucune absence ne correspond aux critères.</td>
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
