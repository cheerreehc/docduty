import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useShift } from './ShiftContext';

export type Doctor = {
  id: string; 
  firstName: string;
  lastName: string;
  year: string;
  icon?: string; 
  color?: string;
};

type DoctorContextType = {
  doctors: Doctor[];
  addDoctor: (n: Omit<Doctor, 'id'>) => void;
  removeDoctor: (n: Doctor) => void;
  clearAllDoctors: () => void;
  updateDoctor: (id: string, newDoctor: Omit<Doctor, 'id'>) => void;
};

const Ctx = createContext<DoctorContextType | undefined>(undefined);

export const DoctorProvider = ({ children }: { children: React.ReactNode }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [ready, setReady] = useState(false);

  const { shifts, setShifts } = useShift(); // ✅ ดึงจาก ShiftContext
  const { removeDoctorFromAllShifts } = useShift();

  // ── LOAD ──
  useEffect(() => {
    (async () => {
      try {
        const [[, d]] = await AsyncStorage.multiGet(['docduty-doctors']);
        if (d) setDoctors(JSON.parse(d) as Doctor[]);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // ── SAVE ──
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem('docduty-doctors', JSON.stringify(doctors)).catch((e) =>
      console.error('save error', e)
    );
  }, [doctors, ready]);

  // ── FUNCTIONS ──
  const addDoctor = (n: Omit<Doctor, 'id'>) => {
    const newDoctor: Doctor = { ...n, id: Date.now().toString() };
    setDoctors((prev) =>
      prev.find((d) => d.firstName === n.firstName && d.lastName === n.lastName && d.year === n.year)
        ? prev
        : [...prev, newDoctor]
    );
  };

  const updateDoctor = (id: string, newDoctor: Omit<Doctor, 'id'>) => {
    setDoctors((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, ...newDoctor } : doc
      )
    );
  };

  const removeDoctor = (n: Doctor) => {
    setDoctors((prev) => prev.filter((d) => d.id !== n.id));
    removeDoctorFromAllShifts(n.id);

    // ✅ ลบ doctor จาก shifts ทั้งหมด
    setShifts((prev) => {
      const out: typeof prev = {};
      Object.entries(prev).forEach(([date, duties]) => {
        const newDuties: typeof duties = {};
        Object.entries(duties).forEach(([type, ids]) => {
          const filtered = ids.filter((id) => id !== n.id);
          if (filtered.length > 0) newDuties[type] = filtered;
        });
        if (Object.keys(newDuties).length > 0) {
          out[date] = newDuties;
        }
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
    <Ctx.Provider value={{ doctors, addDoctor, removeDoctor, clearAllDoctors, updateDoctor }}>
      {children}
    </Ctx.Provider>
  );
};

export const useDoctor = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDoctor must be used within DoctorProvider');
  return ctx;
};
