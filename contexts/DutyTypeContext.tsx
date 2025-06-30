import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useShift } from './ShiftContext';

/* ───── TYPE ───── */
type DutyTypeContextType = {
  dutyTypes: string[];
  addDutyType: (duty: string) => void;
  removeDutyType: (index: number) => void;
  updateDutyType: (index: number, newName: string) => void;
  clearAllDutyTypes: () => void;
};

const Ctx = createContext<DutyTypeContextType | undefined>(undefined);

/* ───── PROVIDER ───── */
export const DutyTypeProvider = ({ children }: { children: React.ReactNode }) => {
  const [dutyTypes, setDutyTypes] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  // ─── LOAD ───
  useEffect(() => {
    AsyncStorage.getItem('docduty-dutyTypes')
      .then((json) => {
        if (json) setDutyTypes(JSON.parse(json));
      })
      .finally(() => setReady(true));
  }, []);

  // ─── SAVE ───
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem('docduty-dutyTypes', JSON.stringify(dutyTypes)).catch((e) =>
      console.error('Failed to save dutyTypes', e)
    );
  }, [dutyTypes, ready]);

  // ─── METHODS ───
  const addDutyType = (duty: string) => {
    const trimmed = duty.trim();
    if (!ready || !trimmed || dutyTypes.includes(trimmed)) return; // ✅ ตรวจ ready ก่อน
     console.log('🆕 เพิ่ม duty type:', trimmed);
    setDutyTypes((prev) => [...prev, trimmed]);
  };


  const removeDutyType = (index: number) => {
    setDutyTypes((prev) => prev.filter((_, i) => i !== index));
  };

  const { renameDutyType } = useShift();

  const updateDutyType = (index: number, newName: string) => {
    setDutyTypes((prev) => {
      const copy = [...prev];
      const oldName = copy[index];
      const trimmed = newName.trim();
      if (!trimmed || oldName === trimmed) return prev;

      renameDutyType(oldName, trimmed); // ✅ sync ไปยัง shifts ด้วย
      copy[index] = trimmed;
      return copy;
    });
  };


  const clearAllDutyTypes = () => setDutyTypes([]);

  if (!ready) return null;

  return (
    <Ctx.Provider
      value={{
        dutyTypes: ready ? dutyTypes : [], // ✅ ส่ง [] ไปก่อนถ้ายังโหลดไม่เสร็จ
        addDutyType,
        removeDutyType,
        updateDutyType,
        clearAllDutyTypes,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

/* ───── HOOK ───── */
export const useDutyType = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDutyType must be used within DutyTypeProvider');
  return ctx;
};
