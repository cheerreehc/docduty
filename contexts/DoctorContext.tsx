import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';


export type Doctor = {
  id: string; 
  firstName: string;
  lastName: string;
  year: string;
  icon?: string; 
  color?: string;
};

type ShiftByDate = {
  [date: string]: {
    [dutyType: string]: string[]; // เช่น 'ICU': ['docId1', 'docId2']
  };
}

type DoctorContextType = {
  doctors: Doctor[];
  addDoctor: (n: Omit<Doctor, 'id'>) => void; // ✅ ไม่ต้องส่ง id มา
  removeDoctor: (n: Doctor) => void;
  clearAllDoctors: () => void;
  updateDoctor: (id: string, newDoctor: Omit<Doctor, 'id'>) => void;
  shifts: ShiftByDate;
  setShifts: React.Dispatch<React.SetStateAction<ShiftByDate>>;
};

const Ctx = createContext<DoctorContextType | undefined>(undefined);

export const DoctorProvider = ({ children }: { children: React.ReactNode }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [shifts, setShifts] = useState<ShiftByDate>({});
  const [ready, setReady] = useState(false);

  /* ── LOAD ── */
  useEffect(() => {
    (async () => {
      try {
        const [[, d], [, s]] = await AsyncStorage.multiGet([
          'docduty-doctors',
          'docduty-shifts-v2', // ✅ เปลี่ยน key เพื่อแยกจากโครงสร้างเก่า
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
      ['docduty-shifts-v2', JSON.stringify(shifts)],
    ]).catch((e) => console.error('save error', e));
  }, [doctors, shifts, ready]);

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
    setShifts((prev) => {
      const out: ShiftByDate = {};
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
