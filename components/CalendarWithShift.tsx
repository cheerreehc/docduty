import Header from '@/components/ui/Header';
import { useDoctor } from '@/contexts/DoctorContext';
import { FontAwesome5 } from '@expo/vector-icons'; // เพิ่มตรง import ด้วย
import React, { useState } from 'react';
import {
  Button, Modal, SafeAreaView, ScrollView, StyleSheet, Text,
  TouchableOpacity, useWindowDimensions, View,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

const pastel = ['#FEE2E2','#E0F2FE','#DCFCE7','#EDE9FE','#FFF7CD'];

export default function CalendarWithShift() {
  const { shifts, setShifts, doctors } = useDoctor();

  const [selDate, setSelDate] = useState<string|null>(null);
  const [selDocs, setSelDocs] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);

  const { width } = useWindowDimensions();
  const isPad = width >= 768;
  const cellW = isPad ? 80 : 46;
  const cellH = isPad ? 82 : 58;

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
    setSelDate(day.dateString);
    setSelDocs(shifts[day.dateString] || []);
    setVisible(true);
  };

  const saveDocs = () => {
    if (selDate) setShifts(p => ({ ...p, [selDate]: selDocs }));
    setVisible(false);
  };

  const clearCurrentMonth = () => {
    console.log('🧹 clear pressed');
    setShifts(p => {
      const out: typeof p = {};
      Object.entries(p).forEach(([d, list]) => {
        if (!d.startsWith(viewMonth)) out[d] = list;
      });
      return out;
    });
  };

  const countByDoc = () => {
    const out: Record<string, number> = {};
    Object.entries(shifts).forEach(([date, arr]) => {
      if (date.startsWith(viewMonth)) {
        arr.forEach(n => out[n] = (out[n] || 0) + 1);
      }
    });
    return out;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16, alignItems: 'center' }} keyboardShouldPersistTaps="handled">
        {/* Month Selector + ปุ่มเดือนปัจจุบัน */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 1000, marginBottom: 12 }}>
          <TouchableOpacity onPress={goToCurrentMonth}>
            <Text style={{ fontSize: 14, color: '#1d4ed8' }}> เดือนปัจจุบัน</Text>
          </TouchableOpacity>
        </View>

        
        <View style={{ flexDirection: isPad ? 'row' : 'column', gap: isPad ? 40 : 20, width: '100%', maxWidth: 1000 }}>
          {/* Calendar */}
          <View style={{ flex: isPad ? 3 : undefined }}>
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
                      <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
                        📅 {thaiMonths[m]} {y}
                      </Text>
                    </TouchableOpacity>
                  );
                }} // END OF สำหรับเลือกเดือนผ่าน Modal
                // Custom ปุ่ม < > ใน lib
                renderArrow={(direction) => (
                    <View
                      style={{
                        backgroundColor: '#DBEAFE',
                        padding: 8,
                        borderColor: '#60A5FA',
                        
                        borderRadius: 8,
                      }}
                    >
                      <FontAwesome5
                        name={direction === 'left' ? 'chevron-left' : 'chevron-right'}
                        size={18}
                        color="#1D4ED8"
                      />
                    </View>
                  )}// END OF Custom ปุ่ม < > ใน libç

              style={{ width: isPad ? '100%' : width - 32 }}
              theme={{ textDayFontSize: isPad ? 18 : 14 }}
              dayComponent={({ date }) => {
                if (!date) return null;
                const names = shifts[date.dateString] || [];

                const todayStr = new Date().toISOString().split('T')[0];
                const isToday = date.dateString === todayStr;

                return (
                  <TouchableOpacity
                    onPress={() => onDayPress(date)}
                    style={{
                      width: cellW, height: cellH, margin: 2, alignItems: 'center',
                      justifyContent: 'center', borderRadius: 8, borderWidth: 0.8,
                      borderColor: isToday ? '#60A5FA' : '#ddd', // 🔵 เส้นกรอบฟ้าถ้าวันนี้
                      backgroundColor: isToday ? '#DBEAFE' : 'white', // 🔵 พื้นหลังฟ้าจาง
                    }}>
                    <Text style={{ fontWeight: 'bold', color: isToday ? '#1D4ED8' : '#000' }}> {date.day} </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 2, marginTop: 4 }}>
                      {names.map(n => (
                        <View key={n} style={{
                          backgroundColor: pastel[doctors.indexOf(n) % pastel.length],
                          paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10
                        }}>
                          <Text style={{ fontSize: 10 }}>{n}</Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {/* Summary */}
          <View style={{ flex: 1 }}>
            <View style={styles.rowHeader}>
              <Text style={styles.title}>สรุปเวรประจำเดือน</Text>
              <TouchableOpacity style={styles.btnClear} onPress={clearCurrentMonth}>
                <Text style={styles.btnText}>🧹 เคลียร์</Text>
              </TouchableOpacity>
            </View>

            {Object.entries(countByDoc()).map(([n, c]) => (
              <View key={n} style={styles.row}>
                <View style={[styles.pill, { backgroundColor: pastel[doctors.indexOf(n) % pastel.length] }]}>
                  <Text style={{ fontSize: 13 }}>{n}</Text>
                </View>
                <Text style={{ marginLeft: 8, fontSize: 13 }}>{c} วัน</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Modal เลือกหมอเวร */}
        <Modal visible={visible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>เลือกหมอเวร</Text>
              {doctors.map(n => (
                <TouchableOpacity key={n} onPress={() =>
                  setSelDocs(p => p.includes(n) ? p.filter(x => x !== n) : [...p, n])
                }>
                  <Text style={{
                    padding: 8, marginVertical: 4, borderRadius: 6,
                    backgroundColor: selDocs.includes(n) ? '#d0f0c0' : '#eee'
                  }}>
                    {selDocs.includes(n) ? '✅ ' : ''}{n}
                  </Text>
                </TouchableOpacity>
              ))}
              <Button title="บันทึก" onPress={saveDocs} />
              <Button title="ยกเลิก" onPress={() => setVisible(false)} color="gray" />
            </View>
          </View>
        </Modal>

        {/* Modal เลือกเดือน */}
        <Modal visible={monthModal} transparent animationType="fade">
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#00000066', padding: 20 }}>
            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
                เลือกเดือน
              </Text>
              {thaiMonths.map((m, i) => (
                <TouchableOpacity key={i} onPress={() => selectMonth(i)}>
                  <Text style={{
                    padding: 10, textAlign: 'center', fontSize: 16,
                    backgroundColor: i === parseInt(selectedMonth.split('-')[1]) - 1 ? '#cce5ff' : undefined
                  }}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
              <Button title="ปิด" onPress={() => setMonthModal(false)} color="gray" />
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold' },
  btnClear: { backgroundColor: '#EFEFEF', paddingHorizontal: 15, paddingVertical: 3, borderRadius: 16 },
  btnText: { fontSize: 14, fontWeight: 'bold', color: "gray" },

  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },

  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: '#00000088', paddingHorizontal: 20 },
  modalBox: { backgroundColor: 'white', padding: 22, borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
});
