import { Header } from '@/components/ui/Header';
import { Doctor, useDoctor } from '@/contexts/DoctorContext';
import { useDutyType } from '@/contexts/DutyTypeContext';
import { useShift } from '@/contexts/ShiftContext';
import { FontAwesome5 } from '@expo/vector-icons'; // เพิ่มตรง import ด้วย
import React, { useState } from 'react';
import {
  Modal,
  ScrollView, StyleSheet, Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions, View
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const pastel = ['#FEE2E2','#E0F2FE','#DCFCE7','#EDE9FE','#FFF7CD'];


export default function CalendarWithShift() {
  
  const [selectedDutyType, setSelectedDutyType] = useState<string>(''); 
  const getDoctorsByIds = (ids: string[]): Doctor[] => {
  return ids.map(id => doctors.find(doc => doc.id === id)).filter(Boolean) as Doctor[];
};

  const [selDate, setSelDate] = useState<string|null>(null);
  const [selDocs, setSelDocs] = useState<Doctor[]>([]);
  const [visible, setVisible] = useState(false);
  const [openAccordions, setOpenAccordions] = useState<number[]>([]);


  const { width, height } = useWindowDimensions();
  const isPad = width >= 768;
  const cellW = isPad ? 80 : 46;
  const cellH = isPad ? 82 : 58;
  const isPortrait = height >= width;
  const maxNameLengthPortrait = 6;

  const { dutyTypes } = useDutyType();
  // console.log('✅ dutyTypes loaded:', dutyTypes);

  const { doctors } = useDoctor();
  const { shifts, setShifts, updateShiftForDay } = useShift();
  

  
  // สำหรับการเลือกเดือน 
  const now = new Date();
  const initMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [viewMonth, setViewMonth] = useState(initMonth);
  const [selectedMonth, setSelectedMonth] = useState(initMonth);

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ];

  const [monthModal, setMonthModal] = useState(false);
  const openMonthPicker = () => setMonthModal(true);
  const selectMonth = (monthIndex: number) => {
    const [year] = selectedMonth.split('-');
    const newMonth = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    setViewMonth(newMonth);
    setSelectedMonth(newMonth);
    setMonthModal(false);
  };
  // END OF สำหรับการเลือกเดือน 
  
  // กระโดดข้ามมาที่เดือนปัจจุบัน
  const goToCurrentMonth = () => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setViewMonth(thisMonth);
    setSelectedMonth(thisMonth);
  };
  // END OF กระโดดข้ามมาที่เดือนปัจจุบัน

  const onDayPress = (day: DateData) => {
    if (dutyTypes.length === 0) {
      console.warn('⚠️ ไม่มีประเภทเวร (dutyTypes) ให้เลือก');
      return;
    }

    const date = day.dateString;
    const type = dutyTypes[0];
    const selectedDoctors = shifts[date]?.[type] || [];

    setSelDate(date); // 👉 ตั้งค่า selDate แยกทีหลังได้
    setSelectedDutyType(type);
    setSelDocs(getDoctorsByIds(selectedDoctors));
    setOpenAccordions([]);
    setVisible(true);
    
  };


  const saveDocs = () => {
    if (selDate && selectedDutyType) {
      setShifts(p => ({
        ...p,
        [selDate]: {
          ...(p[selDate] || {}),
          [selectedDutyType]: selDocs.map(d => d.id),
        }
      }));
    setVisible(false);
  }
  };

  const shouldSuggestRotate = !isPad && Object.values(shifts).some(dutyMap => {
  const dutyTypesForDate = Object.values(dutyMap);
  const tooManyDoctors = dutyTypesForDate.some(ids => ids.length > 2);
  const tooManyTypes = dutyTypesForDate.length > 1;
    return tooManyDoctors || tooManyTypes;
  });


  const countByDoc = (): Record<string, { count: number; doctor: Doctor }> => {
    const out: Record<string, { count: number; doctor: Doctor }> = {};

    Object.entries(shifts).forEach(([date, dutyMap]) => {
      if (date.startsWith(viewMonth)) {
        Object.values(dutyMap).forEach((idArr) => {
          const docs = getDoctorsByIds(idArr);
          docs.forEach(doc => {
            const key = `${doc.firstName} ${doc.lastName} (${doc.year})`;
            if (!out[key]) {
              out[key] = { count: 1, doctor: doc };
            } else {
              out[key].count += 1;
            }
          });
        });
      }
    });

    return out;
  };



  const clearCurrentMonth = () => {
    setShifts(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(date => {
        if (date.startsWith(viewMonth)) {
          delete updated[date];
        }
      });
      return updated;
    });
  };

  const insets = useSafeAreaInsets();

  return (
    // <SafeAreaView style={{ flex: 1, backgroundColor: '#008191', borderBottomLeftRadius: 80,
    //       borderBottomRightRadius: 90,}}>
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>

      {/* Safe area เฉพาะด้านบน */}
      <View
        style={{
          height: insets.top + 5, 
          backgroundColor: '#008191',
          overflow: 'hidden',
          zIndex: 1,
        }}
      />

      <Header showGreeting={false} showToday={false} compact text = "ตารางเวร" logoSize={{ width: 80, height: 30 } }/>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16, alignItems: 'center' ,backgroundColor: '#fafafa' }} keyboardShouldPersistTaps="handled">
        {/* Month Selector + ปุ่มเดือนปัจจุบัน */}
        {/* <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 1000, marginBottom: 12 }}>
          <TouchableOpacity onPress={goToCurrentMonth}>
            <Text style={{ fontSize: 14, color: '#1d4ed8' }}> เดือนปัจจุบัน</Text>
          </TouchableOpacity>
        </View> */}

        
        <View style={{ flexDirection: isPad ? 'row' : 'column', gap: isPad ? 40 : 20, width: '100%', maxWidth: 1000 }}>
          
          {/* Calendar */}
          <View style={{ flex: isPad ? 3 : undefined }}>
            {shouldSuggestRotate && (
              <View style={{
                backgroundColor: '#FFF5CC',
                padding: 8,
                marginBottom: 10,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8
              }}>
                <FontAwesome5 name="sync-alt" size={14} color="#FF9900" />
                <Text style={{ fontSize: 12, color: '#B76E00', fontFamily: 'PKRound' }}>
                  มีข้อมูลเยอะในเดือนนี้ — แนะนำให้หมุนจอเป็นแนวนอนเพื่อดูทั้งหมด
                </Text>
              </View>
            )}

            <Calendar
                hideExtraDays={true} // ซ่อนวันที่อยู่นอกเดือน
                // สำหรับเลือกเดือนผ่าน Modal
                key={viewMonth}
                current={viewMonth + '-01'}
                onVisibleMonthsChange={(months) => {
                  const m = months[0];
                  const newMonth = `${m.year}-${String(m.month).padStart(2, '0')}`;
                  setViewMonth(newMonth);
                  setSelectedMonth(newMonth);
                }}
                renderHeader={(date) => {
                  // date: dayjs string หรือ Date object
                  const y = date.getFullYear();
                  const m = date.getMonth(); // 0-11
                  return (
                    <TouchableOpacity onPress={openMonthPicker}>
                      <Text style={{ fontFamily: 'PKRound', fontSize: 24, textAlign: 'center' }}> 
                        {thaiMonths[m]} {y}
                      </Text>
                    </TouchableOpacity>
                  );
                }} // END OF สำหรับเลือกเดือนผ่าน Modal
                // Custom ปุ่ม < > ใน lib
                renderArrow={(direction) => (
                    <View
                      style={{
                        backgroundColor: '#EEFEFF',
                        padding: 8,
                        borderColor: '#60A5FA',
                        
                        borderRadius: 8,
                      }}
                    >
                      <FontAwesome5
                        name={direction === 'left' ? 'chevron-left' : 'chevron-right'}
                        size={18}
                        color="#26C6DA"
                      />
                    </View>
                  )}// END OF Custom ปุ่ม < > ใน libç

              // style={{ width: isPad ? '100%' : width - 32 }}
              
              theme={{ textDayFontSize: isPad ? 18 : 14 }}
              dayComponent={({ date }) => {
                if (!date) return null;
                const todayStr = new Date().toISOString().split('T')[0];
                const isToday = date.dateString === todayStr;
                const allShifts = shifts[date.dateString] || {};

                const dutyTypeCount = Object.keys(allShifts).length;
                const doctorCount = Object.values(allShifts).reduce((sum, ids) => sum + ids.length, 0);
                const isTinyCell = !isPad && (dutyTypeCount > 1 || doctorCount > 2);
                const MAX_DOCTOR = isPad ? 3 : 2;

                return (
                  <TouchableOpacity
                    onPress={() => onDayPress(date)}
                    style={{
                      width: cellW,
                      height: cellH,
                      margin: 2,
                      borderRadius: 8,
                      borderWidth: 0.8,
                      borderColor: isToday ? '#26C6DA' : '#ddd',
                      backgroundColor: isToday ? '#EEFEFF' : 'white',
                      padding: 2,
                    }}
                  >
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', color: isToday ? '#26C6DA' : '#000' }}>
                      {date.day}
                    </Text>

                    <ScrollView style={{ marginTop: 2, maxHeight: cellH - 28 }}>
                      {dutyTypes
                      .filter(type => allShifts[type]?.length > 0) // ✅ กรอง dutyType ที่มีหมอจริง
                      .map(type => {
                        const idArr = allShifts[type];
                        const docs = getDoctorsByIds(idArr);
                        const shown = docs.slice(0, MAX_DOCTOR);
                        const hidden = docs.length - MAX_DOCTOR;

                        return (
                          <View
                            key={type}
                            style={{
                              flexDirection: 'row',
                              flexWrap: 'wrap',
                              alignItems: 'center',
                              marginBottom: 2,
                            }}
                          >
                            <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#555', marginRight: 4 }}>
                              {type}:
                            </Text>

                            {shown.map(doc => {
                            const pillColor = doc.color || '#EEE';
                            const showDot = isPortrait; // ✅ แนวตั้ง = dot เสมอ

                            return showDot ? (
                              <View
                                key={doc.id}
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: pillColor,
                                  marginRight: 4,
                                }}
                              />
                            ) : (
                              <View
                                key={doc.id}
                                style={{
                                  backgroundColor: pillColor,
                                  borderRadius: 10,
                                  paddingHorizontal: 6,
                                  paddingVertical: 2,
                                  maxWidth: 60,
                                  marginRight: 4,
                                }}
                              >
                                <Text
                                  numberOfLines={1}
                                  ellipsizeMode="tail"
                                  style={{ fontSize: 8, color: '#000' }}
                                >
                                  {doc.firstName}
                                </Text>
                              </View>
                            );
                          })}

                            {hidden > 0 && (
                              <Text style={{ fontSize: 8, color: '#999' }}>+{hidden}</Text>
                            )}
                          </View>
                        );
                      })}
                    </ScrollView>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {/* Summary */}
          <View style={{ flex: 1 }}>
            <View style={styles.rowHeader}>
            <Text style={{ fontFamily: 'PKRound', fontSize: 20, textAlign: 'center' }}>
              🩺 สรุปเวรประจำเดือน
            </Text>
              <TouchableOpacity style={styles.btnClear} onPress={clearCurrentMonth}>
                <Text style={{ fontFamily: 'PKRound', fontSize: 16, textAlign: 'center' }}> 🧹 เคลียร์ตาราง</Text>
              </TouchableOpacity>
            </View>

            {/* function สำหรับการนับเวรของหมอแต่ละคน */}
            {Object.entries(countByDoc()).length === 0 ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Text style={{ textAlign: 'left', fontSize: 14, color: '#555', fontStyle: "italic"}}>
                  📋 ยังไม่มีหมอที่ได้รับเวรในเดือนนี้
                </Text>
                <Text style={{ textAlign: 'left', fontSize: 14, marginTop: 6, color: '#555' }}>
                  👉🏻 คลิกวันที่ในปฏิทินเพื่อเพิ่มหมอเวรได้เลย
                </Text>
              </View>
            ) : (
              Object.entries(countByDoc()).map(([name, { count, doctor }]) => (
              <View key={name} style={styles.row}>
                  <View style={[styles.pill, { backgroundColor: doctor.color || '#EEE' }]}>
                    <Text style={{ fontSize: 13 }}>{name}</Text>
                  </View>
                  <Text style={{ marginLeft: 8, fontSize: 13 }}>{count} วัน</Text>
                </View>
              ))  
            )}
         </View>
         {/* End view of summary */}

        </View>
        {/* Modal เลือกหมอเวร */}
        <Modal visible={visible} transparent animationType="fade">
  <TouchableWithoutFeedback onPress={() => setVisible(false)}>
    <View style={styles.modalOverlay}>
      <TouchableWithoutFeedback onPress={() => {}}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>เลือกหมอเวร 🩺</Text>

          {!selDate ? null : (
  <View style={{ flexDirection: 'column', gap: 10 }}>
    {dutyTypes.map((type, index) => {
      const isOpen = openAccordions.includes(index);
      const selectedIds = shifts[selDate]?.[type] || [];

      // 🔒 สร้าง Set ของหมอที่เลือกไว้ในเวรอื่น
      const selectedInOtherTypes = new Set<string>();
      dutyTypes.forEach(t => {
        if (t !== type) {
          (shifts[selDate]?.[t] || []).forEach(id => selectedInOtherTypes.add(id));
        }
      });

      // 🧾 ชื่อหมอที่เลือกไว้ในประเภทนี้
      const selectedNames = getDoctorsByIds(selectedIds).map(doc => doc.firstName).join(', ');

      return (
        <View key={type}>
          {/* Accordion Header */}
          <TouchableOpacity
            onPress={() => {
              setOpenAccordions(prev =>
                prev.includes(index)
                  ? prev.filter(i => i !== index)
                  : [...prev, index]
              );
            }}
            style={{
              backgroundColor: '#26C6DA',
              padding: 10,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              {isOpen ? '▼' : '▶'} {type}
              {selectedNames ? ` : ${selectedNames}` : ''}
            </Text>
          </TouchableOpacity>

          {/* Accordion Content */}
          {isOpen && (
            <View style={{ marginTop: 6 }}>
              {doctors.map((doc, i) => {
                const isSelected = selectedIds.includes(doc.id);
                const isLocked = selectedInOtherTypes.has(doc.id);
                const bg = doc.color || pastel[i % pastel.length];

                return (
                  <TouchableOpacity
                    key={doc.id}
                    disabled={isLocked}
                    onPress={() => {
                    if (!selDate || isLocked) return;

                    const current = shifts[selDate]?.[type] || [];
                    const updated = isSelected
                      ? current.filter(id => id !== doc.id)
                      : [...current, doc.id];

                    if (updated.length === 0) {
                      // ✅ ลบ dutyType ออกจากวันนั้น ถ้าไม่มีหมอแล้ว
                      setShifts(prev => {
                        const copy = { ...prev };
                        if (copy[selDate]) {
                          delete copy[selDate][type];
                          if (Object.keys(copy[selDate]).length === 0) {
                            delete copy[selDate]; // ลบทั้งวันถ้าไม่มี dutyType เหลือเลย
                          }
                        }
                        return copy;
                      });
                    } else {
                      updateShiftForDay(selDate, type, updated);
                    }
                  }}

                    style={{
                      backgroundColor: isSelected
                        ? bg
                        : isLocked
                        ? '#ddd'
                        : '#eee',
                      padding: 10,
                      borderRadius: 8,
                      marginVertical: 4,
                      opacity: isLocked ? 0.6 : 1,
                    }}
                  >
                    <Text style={{ color: isLocked ? '#666' : '#000' }}>
                      {isSelected ? '✅ ' : ''}
                      {doc.firstName} {doc.lastName} ({doc.year})
                      {isLocked ? ' – ถูกเลือกในเวรอื่นแล้ว' : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      );
    })}
  </View>
)}




          <TouchableOpacity
            style={[styles.btnClear, { alignSelf: 'flex-start', backgroundColor: '#FFDDDD', marginTop: 16 }]}
            onPress={() => {
              if (selDate) {
                setShifts(prev => {
                  const copy = { ...prev };
                  delete copy[selDate];
                  return copy;
                });
              }
              setVisible(false);
            }}
          >
            <Text style={[styles.btnText, { color: '#F59090', fontSize: 12 }]}>🧹 เคลียร์เวรทั้งหมดวันนี้</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </View>
  </TouchableWithoutFeedback>
</Modal>


      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold', fontFamily: 'PKRound' },
  btnClear: { backgroundColor: '#EFEFEF', paddingHorizontal: 15, paddingVertical: 3, borderRadius: 16 },
  btnText: { fontSize: 14, fontWeight: 'bold', color: "gray" , fontFamily: 'PKRound'},

  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },

  modalOverlay: {
  flex: 1,
  justifyContent: 'center',
  backgroundColor: '#00000088',
  paddingHorizontal: 20,
},
  
modalBox: {
  backgroundColor: 'white',
  padding: 22,
  borderRadius: 10,
  maxWidth: 400,
  width: '100%',
  alignSelf: 'center',
},
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
});
