import React, { useState, useEffect } from 'react';
import { User, ClassGroup, Absence } from '../types';
import { getClasses, addClass, addAbsence, getTeacherAbsences, sendAbsences } from '../services/storageService';
import { Button } from './Button';
import { Input } from './Input';
import { LogOut, PlusCircle, CheckCircle, Send, School, Clock, Calendar } from 'lucide-react';

interface TeacherDashboardProps {
  onLogout: () => void;
  currentUser: User;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onLogout, currentUser }) => {
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  
  // Absence Form State
  const [studentName, setStudentName] = useState('');
  const [absenceDate, setAbsenceDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [localAbsences, setLocalAbsences] = useState<Absence[]>([]);
  const [view, setView] = useState<'classes' | 'absences'>('classes');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setAbsenceDate(today);
  }, []);

  const loadData = () => {
    const loadedClasses = getClasses(currentUser.id);
    setClasses(loadedClasses);
    const loadedAbsences = getTeacherAbsences(currentUser.id);
    setLocalAbsences(loadedAbsences);

    // Auto-select first class if available and none selected
    if (loadedClasses.length > 0 && !selectedClassId) {
      setSelectedClassId(loadedClasses[0].id);
    }
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newClass: ClassGroup = {
      id: Date.now().toString(),
      name: newClassName.trim(),
      teacherId: currentUser.id
    };

    addClass(newClass);
    setNewClassName('');
    loadData();
    setSuccessMsg('Classe ajoutée avec succès !');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleAddAbsence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !studentName || !absenceDate || !startTime || !endTime) return;

    const selectedClass = classes.find(c => c.id === selectedClassId);
    if (!selectedClass) return;

    const absence: Absence = {
      id: Date.now().toString(),
      studentName,
      date: absenceDate,
      startTime,
      endTime,
      classId: selectedClass.id,
      className: selectedClass.name,
      teacherId: currentUser.id,
      teacherName: currentUser.fullName,
      status: 'draft',
      timestamp: Date.now()
    };

    addAbsence(absence);
    setStudentName('');
    // Keep date/time for convenience
    loadData();
    setSuccessMsg('Absence ajoutée à la liste (Brouillon).');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSendAbsences = () => {
    const drafts = localAbsences.filter(a => a.status === 'draft');
    if (drafts.length === 0) return;

    // Send immediately without confirm to streamline flow as requested
    const count = sendAbsences(currentUser.id);
    loadData();
    
    if (count > 0) {
      setSuccessMsg(`${count} absence(s) transmise(s) au surveillant avec succès !`);
      setTimeout(() => setSuccessMsg(null), 5000);
    }
  };

  const draftCount = localAbsences.filter(a => a.status === 'draft').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-indigo-600 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <School className="h-6 w-6" />
            <h1 className="text-lg font-bold">Espace Professeur</h1>
          </div>
          <button onClick={onLogout} className="text-white opacity-80 hover:opacity-100">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
        <p className="max-w-xl mx-auto text-xs text-indigo-200 mt-1">
          {currentUser.fullName}
        </p>
      </header>

      {successMsg && (
        <div className="fixed top-20 right-4 left-4 md:left-auto md:w-96 bg-green-600 text-white p-4 rounded-lg shadow-xl z-50 flex items-center animate-bounce">
          <CheckCircle className="h-6 w-6 mr-3" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      <main className="max-w-xl mx-auto p-4 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-gray-200 pb-2">
          <button 
            onClick={() => setView('classes')}
            className={`flex-1 pb-2 text-sm font-medium ${view === 'classes' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          >
            Mes Classes
          </button>
          <button 
            onClick={() => setView('absences')}
            className={`flex-1 pb-2 text-sm font-medium ${view === 'absences' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          >
            Saisir Absences
          </button>
        </div>

        {view === 'classes' && (
          <div className="space-y-6 animate-fade-in">
            {/* Add Class */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <PlusCircle className="h-5 w-5 mr-2 text-indigo-500" />
                Ajouter une classe
              </h3>
              <form onSubmit={handleAddClass} className="flex gap-2">
                <div className="flex-1">
                  <Input 
                    placeholder="Ex: 2BAC PC 1"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="mb-0" // override default margin
                  />
                </div>
                <Button type="submit">Ajouter</Button>
              </form>
            </div>

            {/* List Classes */}
            <div className="space-y-3">
              <h3 className="text-md font-semibold text-gray-700">Mes classes attribuées</h3>
              {classes.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Aucune classe ajoutée. Commencez par en ajouter une.</p>
              ) : (
                <div className="grid gap-3">
                  {classes.map(cls => (
                    <div key={cls.id} className="bg-white p-4 rounded-lg border-l-4 border-indigo-500 shadow-sm flex justify-between items-center">
                      <span className="font-medium text-gray-800">{cls.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'absences' && (
          <div className="space-y-6 animate-fade-in">
             {classes.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">Vous devez ajouter des classes avant de saisir des absences.</p>
                  <Button onClick={() => setView('classes')} variant="secondary">Aller aux classes</Button>
                </div>
             ) : (
               <>
                 {/* Form */}
                <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Nouvelle Absence</h3>
                  <form onSubmit={handleAddAbsence} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
                      <select 
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <Input 
                      label="Nom de l'élève"
                      placeholder="Nom et Prénom"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      required
                    />

                    <Input 
                      label="Date"
                      type="date"
                      value={absenceDate}
                      onChange={(e) => setAbsenceDate(e.target.value)}
                      required
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        label="De (Heure)"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                      />
                      <Input 
                        label="À (Heure)"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" fullWidth>Ajouter à la liste</Button>
                  </form>
                </div>

                {/* Drafts & Sent List */}
                <div className="space-y-4">
                  
                  {draftCount > 0 && (
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 flex flex-col items-center text-center space-y-3">
                      <p className="text-sm text-indigo-800 font-medium">Vous avez {draftCount} absence(s) en attente d'envoi.</p>
                      <Button onClick={handleSendAbsences} variant="success" fullWidth className="flex justify-center items-center shadow-md">
                        <Send className="w-5 h-5 mr-2" />
                        Envoyer les absences au surveillant
                      </Button>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-6">
                    <h3 className="text-md font-semibold text-gray-700">Historique récent</h3>
                  </div>

                  <div className="space-y-3">
                    {localAbsences.sort((a,b) => b.timestamp - a.timestamp).map(abs => (
                      <div key={abs.id} className={`bg-white p-3 rounded-lg border shadow-sm flex flex-col ${abs.status === 'sent' ? 'border-l-4 border-l-green-500 opacity-75' : 'border-l-4 border-l-orange-500'}`}>
                        <div className="flex justify-between items-start">
                           <div>
                              <span className="font-bold text-gray-800">{abs.studentName}</span>
                              <div className="text-xs text-gray-500 mt-1 flex items-center">
                                <School className="w-3 h-3 mr-1" /> {abs.className}
                              </div>
                           </div>
                           <span className={`text-xs px-2 py-1 rounded-full font-medium ${abs.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                             {abs.status === 'sent' ? 'Envoyé' : 'Brouillon'}
                           </span>
                        </div>
                        <div className="mt-2 flex items-center text-xs text-gray-600 space-x-3">
                           <span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> {abs.date.split('-').reverse().join('/')}</span>
                           <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {abs.startTime} - {abs.endTime}</span>
                        </div>
                      </div>
                    ))}
                    {localAbsences.length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-4">Aucune absence enregistrée.</p>
                    )}
                  </div>
                </div>
               </>
             )}
          </div>
        )}

      </main>
    </div>
  );
};
