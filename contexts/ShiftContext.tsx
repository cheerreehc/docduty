import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type ShiftByDate = {
  [date: string]: {
    [dutyType: string]: string[]; // eg. 'ICU': ['docId1', 'docId2']
  };
};

type ShiftContextType = {
  shifts: ShiftByDate;
  setShifts: React.Dispatch<React.SetStateAction<ShiftByDate>>;
  clearAllShifts: () => void;
  renameDutyType: (oldName: string, newName: string) => void;
  removeDoctorFromAllShifts: (doctorId: string) => void;
  updateShiftForDay: (date: string, dutyType: string, doctorIds: string[]) => void;
};

const Ctx = createContext<ShiftContextType | undefined>(undefined);

export const ShiftProvider = ({ children }: { children: React.ReactNode }) => {
  const [shifts, setShifts] = useState<ShiftByDate>({});
  const [ready, setReady] = useState(false);

  // ── LOAD ──
  useEffect(() => {
    AsyncStorage.getItem('docduty-shifts-v2')
      .then((json) => {
        if (json) setShifts(JSON.parse(json));
      })
      .finally(() => setReady(true));
  }, []);

  // ── SAVE ──
  useEffect(() => {
    if (ready) {
      AsyncStorage.setItem('docduty-shifts-v2', JSON.stringify(shifts)).catch(e =>
        console.error('Error saving shifts:', e)
      );
    }
  }, [shifts, ready]);

  // ── ACTIONS ──
  const clearAllShifts = () => setShifts({});

  const renameDutyType = (oldName: string, newName: string) => {
    if (!oldName || !newName || oldName === newName) return;
    setShifts(prev => {
      const updated: ShiftByDate = {};
      for (const [date, duties] of Object.entries(prev)) {
        const newDuties: typeof duties = {};
        for (const [type, ids] of Object.entries(duties)) {
          newDuties[type === oldName ? newName : type] = ids;
        }
        updated[date] = newDuties;
      }
      return updated;
    });
  };

  const removeDoctorFromAllShifts = (doctorId: string) => {
    setShifts(prev => {
      const updated: ShiftByDate = {};
      for (const [date, duties] of Object.entries(prev)) {
        const newDuties: typeof duties = {};
        for (const [type, ids] of Object.entries(duties)) {
          const filtered = ids.filter(id => id !== doctorId);
          if (filtered.length > 0) newDuties[type] = filtered;
        }
        if (Object.keys(newDuties).length > 0) {
          updated[date] = newDuties;
        }
      }
      return updated;
    });
  };

  const updateShiftForDay = (date: string, dutyType: string, doctorIds: string[]) => {
    setShifts((prev) => {
      const newDayShift = { ...(prev[date] || {}) };

      if (doctorIds.length > 0) {
        newDayShift[dutyType] = doctorIds;
      } else {
        delete newDayShift[dutyType];
      }

      if (Object.keys(newDayShift).length === 0) {
        const updated = { ...prev };
        delete updated[date];
        return updated;
      }

      return {
        ...prev,
        [date]: newDayShift,
      };
    });
  };

  if (!ready) return null;

  return (
    <Ctx.Provider
      value={{
        shifts,
        setShifts,
        clearAllShifts,
        renameDutyType,
        removeDoctorFromAllShifts,
        updateShiftForDay,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useShift = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useShift must be used within ShiftProvider');
  return ctx;
};
