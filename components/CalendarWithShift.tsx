import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useDoctor } from '../contexts/DoctorContext';

// 👇 เพิ่ม type สำหรับ state
type MarkingData = {
  selected: boolean;
  marked: boolean;
  dotColor: string;
  customStyles: {
    container: object;
    text: object;
  };
  name: string;
};

export default function CalendarWithShift() {
  // const [selected, setSelected] = useState<Record<string, MarkingData>>({});
  const [selected, setSelected] = useState<Record<string, { names: string[] }>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [inputName, setInputName] = useState('');
  const [markedDates, setMarkedDates] = useState<{ [date: string]: string[] }>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const { doctors } = useDoctor(); 

    useEffect(() => {
    const loadData = async () => {
      const data = await AsyncStorage.getItem('docduty-shifts');
      if (data) {
        setSelected(JSON.parse(data));
      }
    };
    loadData();
  }, []);


  const handleDayPress = (day: DateData) => {
  setSelectedDate(day.dateString);
  setSelectedDoctors(markedDates[day.dateString] || []);
  setModalVisible(true);
  };

  const handleSaveDoctors = () => {
    if (selectedDate) {
      setMarkedDates((prev) => ({
        ...prev,
        [selectedDate]: selectedDoctors,
      }));
    }
    setModalVisible(false);
  };

  const saveName = async () => {
    setSelected((prev) => {
      const existing = prev[currentDate]?.names || [];
      const updated = {
        ...prev,
        [currentDate]: {
          names: [...existing, inputName.trim()]
        }
      };

      AsyncStorage.setItem('docduty-shifts', JSON.stringify(updated));
      return updated;
    });

    setModalVisible(false);
    setInputName('');
  };


  const openModal = (date: string) => {
    console.log('เปิด modal วันที่:', date);
      setCurrentDate(date);
      setInputName('');
      setModalVisible(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Calendar
            onDayPress={handleDayPress}
            dayComponent={({ date, onPress}) => {
              if (!date) return null; // ป้องกัน null
              const doctorNames = markedDates[date.dateString] || [];
              return (
                <TouchableOpacity onPress={() => handleDayPress(date)} style={{ alignItems: 'center' }}>
                  <Text>{date.day}</Text>
                  {doctorNames.map((name, idx) => (
                    <Text key={idx} style={{ fontSize: 10, color: 'blue' }}>
                      {name}
                    </Text>
                  ))}
                </TouchableOpacity>
              );
            }}
          />

          <Text style={styles.title}>รายชื่อเวร</Text>

        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#00000099' }}>
            <View style={{ backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 10 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>เลือกหมอเวร</Text>
              {doctors.map((name) => (
                <TouchableOpacity
                  key={name}
                  onPress={() => {
                    setSelectedDoctors((prev) =>
                      prev.includes(name)
                        ? prev.filter((n) => n !== name)
                        : [...prev, name]
                    );
                  }}
                >
                  <Text style={{ padding: 8, backgroundColor: selectedDoctors.includes(name) ? '#d0f0c0' : '#eee', marginVertical: 4, borderRadius: 6 }}>
                    {selectedDoctors.includes(name) ? '✅ ' : ''}{name}
                  </Text>
                </TouchableOpacity>
              ))}
              <Button title="บันทึก" onPress={handleSaveDoctors} />
              <Button title="ยกเลิก" onPress={() => setModalVisible(false)} color="gray" />
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
}

const pastelColors = ['#FEE2E2', '#E0F2FE', '#DCFCE7', '#EDE9FE', '#FFF7CD'];

const getColorByIndex = (index: number) => pastelColors[index % pastelColors.length];

const CustomDayCell = ({
  date,
  names,
  onPress
}: {
  date: string;
  names: string[];
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.dayCell}>
      <Text style={styles.dayNumber}>{date.split('-')[2]}</Text>
      <View style={styles.pillContainer}>
        {names.slice(0, 2).map((name, index) => (
          <View
            key={index}
            style={[styles.pill, { backgroundColor: getColorByIndex(index) }]}
          >
            <Text style={styles.pillText}>{name}</Text>
          </View>
        ))}
        {names.length > 2 && (
          <Text style={styles.moreText}>+{names.length - 2}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // 🌙 พื้นหลังมืดตอนเปิด Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#00000099',
    paddingHorizontal: 20,
  },

  // 📦 กล่อง modal สีขาว
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 4,
  },

  // 📝 หัวข้อ modal
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },

  // 🧾 ช่องกรอกชื่อ
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 20,
  },

  // 🔘 ปุ่มบันทึก/ยกเลิก
  btnGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // 📅 กล่องวันในปฏิทิน
  dayCell: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    minHeight: 60,
    borderWidth: 0.5,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#fff',
  },

  // 🔢 เลขวันที่
  dayNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  // 👤 ชื่อหมอ
  nameText: {
    fontSize: 11,
    color: '#333',
    lineHeight: 14,
  },

  // ➕ ตัวบอกจำนวนที่เหลือ
  moreText: {
    fontSize: 10,
    color: '#888',
  },

  title: {
  fontSize: 18,
  fontWeight: 'bold',
  marginTop: 20,
  marginBottom: 10
  },
  pillContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  marginTop: 4,
  gap: 2,
},
pill: {
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 10,
  backgroundColor: '#eee',
},
pillText: {
  fontSize: 10,
  color: '#333',
}

});



