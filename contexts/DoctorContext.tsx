import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type ShiftMap = { [date: string]: string[] };

type DoctorContextType = {
  doctors: string[];
  addDoctor: (n: string) => void;
  removeDoctor: (n: string) => void;
  clearAllDoctors: () => void;
  shifts: ShiftMap;
  setShifts: React.Dispatch<React.SetStateAction<ShiftMap>>;
};

const Ctx = createContext<DoctorContextType | undefined>(undefined);

export const DoctorProvider = ({ children }: { children: React.ReactNode }) => {
  const [doctors, setDoctors] = useState<string[]>([]);
  const [shifts , setShifts ] = useState<ShiftMap>({});
  const [ready  , setReady  ] = useState(false);

  /* ── LOAD once ── */
  useEffect(() => {
    (async () => {
      try {
        const [[,d], [,s]] = await AsyncStorage.multiGet([
          'docduty-doctors',
          'docduty-shifts',
        ]);
        if (d) setDoctors(JSON.parse(d));
        if (s) setShifts(JSON.parse(s));
      } finally {
        setReady(true);
      }
    })();
  }, []);

  /* ── SAVE when data changes ── */
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.multiSet([
      ['docduty-doctors', JSON.stringify(doctors)],
      ['docduty-shifts' , JSON.stringify(shifts )],
    ]).catch((e)=>console.error('save error',e));
  }, [doctors, shifts, ready]);

  /* helpers */
  const addDoctor = (n: string) =>
    setDoctors((p) => (p.includes(n) ? p : [...p, n.trim()]));

  const removeDoctor = (n: string) => {
    setDoctors((p) => p.filter((x) => x !== n));
    setShifts((p) => {
      const out: ShiftMap = {};
      Object.entries(p).forEach(([d, list]) => {
        const left = list.filter((x) => x !== n);
        if (left.length) out[d] = left;
      });
      return out;
    });
  };

  const clearAllDoctors = () => { setDoctors([]); setShifts({}); };

  if (!ready) return null;        // รอโหลดก่อน

  return (
    <Ctx.Provider value={{ doctors, addDoctor, removeDoctor, clearAllDoctors, shifts, setShifts }}>
      {children}
    </Ctx.Provider>
  );
};

export const useDoctor = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDoctor must be used within DoctorProvider');
  return ctx;
};
