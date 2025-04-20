import React, { createContext, useState } from 'react';

export const MedicationContext = createContext();

const initialMedications = [
  { id: '1', name: 'Ибупрофен', tabletCount: 2, tabletDosage: 200, times: [new Date(2025, 3, 18, 10, 0)], completed: false },
  { id: '2', name: 'Парацетамол', tabletCount: 1, tabletDosage: 500, times: [new Date(2025, 3, 18, 12, 30)], completed: false },
  { id: '3', name: 'Аспирин', tabletCount: 1, tabletDosage: 100, times: [new Date(2025, 3, 18, 8, 0)], completed: false },
  { id: '4', name: 'Витамин C', tabletCount: 1, tabletDosage: 1000, times: [new Date(2025, 3, 18, 18, 0), new Date(2025, 3, 18, 20, 0)], completed: false },
  { id: '5', name: 'Лоратадин', tabletCount: 1, tabletDosage: 10, times: [new Date(2025, 3, 19, 9, 0)], completed: false },
  { id: '6', name: 'Омепразол', tabletCount: 1, tabletDosage: 20, times: [new Date(2025, 3, 20, 7, 0)], completed: true },
];

export const MedicationProvider = ({ children }) => {
  const [medications, setMedications] = useState(initialMedications);

  const addMedication = (medication) => {
    setMedications([...medications, { ...medication, id: Math.random().toString() }]);
  };

  const updateMedication = (id, updated) => {
    setMedications(medications.map((med) => (med.id === id ? { ...med, ...updated } : med)));
  };

  const deleteMedication = (id) => {
    setMedications(medications.filter((med) => med.id !== id));
  };

  const markAsTaken = (id) => {
    setMedications(medications.map((med) => (med.id === id ? { ...med, completed: true } : med)));
  };

  return (
    <MedicationContext.Provider value={{ medications, addMedication, updateMedication, deleteMedication, markAsTaken }}>
      {children}
    </MedicationContext.Provider>
  );
};