import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type DoctorContextType = {
  doctors: string[];
  addDoctor: (name: string) => void;
  removeDoctor: (index: number) => void;
};

const DoctorContext = createContext<DoctorContextType>({
  doctors: [],
  addDoctor: () => {},
  removeDoctor: () => {},
});

export const useDoctor = () => useContext(DoctorContext);

export const DoctorProvider = ({ children }: { children: React.ReactNode }) => {
  const [doctors, setDoctors] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await AsyncStorage.getItem('docduty-doctors');
      if (data) setDoctors(JSON.parse(data));
    };
    load();
  }, []);

  const sync = async (newList: string[]) => {
    setDoctors(newList);
    await AsyncStorage.setItem('docduty-doctors', JSON.stringify(newList));
  };

  const addDoctor = (name: string) => {
    const updated = [...doctors, name];
    sync(updated);
  };

  const removeDoctor = (index: number) => {
    const updated = [...doctors];
    updated.splice(index, 1);
    sync(updated);
  };

  return (
    <DoctorContext.Provider value={{ doctors, addDoctor, removeDoctor }}>
      {children}
    </DoctorContext.Provider>
  );
};
