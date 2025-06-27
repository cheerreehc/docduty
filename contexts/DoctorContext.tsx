import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Doctor = {
  firstName: string;
  lastName: string;
  year: string;
  icon?: string; 
};

type ShiftMap = { [date: string]: Doctor[] };

type DoctorContextType = {
  doctors: Doctor[];
  addDoctor: (n: Doctor) => void;
  removeDoctor: (n: Doctor) => void;
  clearAllDoctors: () => void;
  updateDoctor: (index: number, newDoctor: Doctor) => void; 
  shifts: ShiftMap;
  setShifts: React.Dispatch<React.SetStateAction<ShiftMap>>;
};

const Ctx = createContext<DoctorContextType | undefined>(undefined);

export const DoctorProvider = ({ children }: { children: React.ReactNode }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [shifts, setShifts] = useState<ShiftMap>({});
  const [ready, setReady] = useState(false);

  /* ── LOAD ── */
  useEffect(() => {
    (async () => {
      try {
        const [[, d], [, s]] = await AsyncStorage.multiGet([
          'docduty-doctors',
          'docduty-shifts',
        ]);
        if (d) setDoctors(JSON.parse(d) as Doctor[]);
        if (s) setShifts(JSON.parse(s));
      } finally {
        setReady(true);
      }
    })();
  }, []);

  /* ── SAVE ── */
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.multiSet([
      ['docduty-doctors', JSON.stringify(doctors)],
      ['docduty-shifts', JSON.stringify(shifts)],
    ]).catch((e) => console.error('save error', e));
  }, [doctors, shifts, ready]);

  /* ── Helpers ── */
  const sameDoctor = (a: Doctor, b: Doctor) =>
    a.firstName === b.firstName &&
    a.lastName === b.lastName &&
    a.year === b.year;

  const addDoctor = (n: Doctor) =>
  setDoctors((prev) =>
    prev.find(
      (d) =>
        d.firstName === n.firstName &&
        d.lastName === n.lastName &&
        d.year === n.year
    )
      ? prev
      : [...prev, n]
  );

  const updateDoctor = (index: number, newDoctor: Doctor) => {
    setDoctors((prev) => {
      const updated = [...prev];
      updated[index] = newDoctor;
      return updated;
    });
  };


  const removeDoctor = (n: Doctor) => {
  setDoctors((prev) =>
    prev.filter(
      (d) =>
        d.firstName !== n.firstName ||
        d.lastName !== n.lastName ||
        d.year !== n.year
    )
  );
    setShifts((prev) => {
      const out: ShiftMap = {};
      Object.entries(prev).forEach(([date, list]) => {
        const filtered = list.filter(
          (d) =>
            d.firstName !== n.firstName ||
            d.lastName !== n.lastName ||
            d.year !== n.year
        );
        if (filtered.length > 0) out[date] = filtered;
      });
      return out;
    });
  };

  const clearAllDoctors = () => {
    setDoctors([]);
    setShifts({});
  };

  if (!ready) return null;

  return (
    <Ctx.Provider
      value={{ doctors, addDoctor, removeDoctor, clearAllDoctors, updateDoctor, shifts, setShifts }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useDoctor = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDoctor must be used within DoctorProvider');
  return ctx;
};
