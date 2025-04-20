import React, { createContext, useState } from 'react';

export const MedicationContext = createContext();

export const MedicationProvider = ({ children }) => {
  const [medications, setMedications] = useState([
    {
      id: '1',
      name: 'Парацетамол',
      tabletCount: 2,
      tabletDosage: 500,
      times: [
        new Date(2025, 3, 20, 8, 0),
        new Date(2025, 3, 20, 20, 0),
      ],
    },
    {
      id: '2',
      name: 'Ибупрофен',
      tabletCount: 1,
      tabletDosage: 400,
      times: [
        new Date(2025, 3, 21, 12, 0),
      ],
    },
  ]);

  const [stocks, setStocks] = useState([
    {
      id: '1',
      name: 'Парацетамол',
      tabletDosage: 500,
      tabletCount: 20,
    },
    {
      id: '2',
      name: 'Ибупрофен',
      tabletDosage: 400,
      tabletCount: 15,
    },
    {
      id: '3',
      name: 'Аспирин',
      tabletDosage: 100,
      tabletCount: 50,
    },
  ]);

  const addMedication = (medication) => {
    setMedications([...medications, medication]);
  };

  const updateMedication = (id, updatedMedication) => {
    setMedications(
      medications.map((med) => (med.id === id ? updatedMedication : med))
    );
  };

  const deleteMedication = (id) => {
    setMedications(medications.filter((med) => med.id !== id));
  };

  const addStock = (stock) => {
    setStocks([...stocks, stock]);
  };

  const updateStock = (id, updatedStock) => {
    setStocks(stocks.map((stock) => (stock.id === id ? updatedStock : stock)));
  };

  const deleteStock = (id) => {
    setStocks(stocks.filter((stock) => stock.id !== id));
  };

  return (
    <MedicationContext.Provider
      value={{
        medications,
        addMedication,
        updateMedication,
        deleteMedication,
        stocks,
        addStock,
        updateStock,
        deleteStock,
      }}
    >
      {children}
    </MedicationContext.Provider>
  );
};