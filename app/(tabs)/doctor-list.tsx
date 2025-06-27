import { Header } from '@/components/ui/Header';
import { useDoctor } from '@/contexts/DoctorContext';
import React, { useState } from 'react';
import {
  Button,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions
} from 'react-native';

export default function DoctorListScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [year, setYear] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const { doctors, addDoctor, updateDoctor, removeDoctor } = useDoctor();
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [icon, setIcon] = useState('👨🏻‍⚕️');

  const handleAdd = () => {
    const trimmed = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      year: year.trim(),
      icon: icon || '👨🏻‍⚕️',
    };

    if (!trimmed.firstName || !trimmed.lastName || !trimmed.year) return;

    if (editIndex !== null) {
      updateDoctor(editIndex, trimmed);
      setEditIndex(null); // รีเซตโหมดแก้ไข
    } else {
      const exists = doctors.some(
        d =>
          d.firstName === trimmed.firstName &&
          d.lastName === trimmed.lastName &&
          d.year === trimmed.year
      );
      if (exists) return;

      addDoctor(trimmed);
    }

    setFirstName('');
    setLastName('');
    setYear('');
    setModalVisible(false); // ปิด modal หลังเพิ่ม/แก้ไข
  };


  const { width } = useWindowDimensions();
  const isPad = width >= 768;
  const contentWidth = Math.min(width * 0.9, 600); // 90% max 600px


  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header showGreeting={false} showToday={false} compact text = "รายชื่อหมอ" logoSize={{ width: 120, height: 50 } }/>  
          <Modal visible={modalVisible} animationType="fade" transparent>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={{ flex: 1 }}
            >
              <TouchableWithoutFeedback onPress={() => {
                Keyboard.dismiss();
                setModalVisible(false);
                setEditIndex(null);
                setFirstName('');
                setLastName('');
                setYear('');
              }}>
                <View style={styles.modalBackdrop}>
                  <TouchableWithoutFeedback onPress={() => {}}>
                    <View style={styles.modalContainer}>
                      <Text style={{ fontFamily: 'PKRound', fontSize: 24, textAlign: 'center' }}>เพิ่มหมอใหม่</Text>

                      <View style={styles.formGroup}>
                        <Text style={styles.label}>Icon</Text>
                        <View style={styles.emojiRow}>
                          {['👨🏻‍⚕️', '👩🏻‍⚕️', '🧑🏻‍⚕️'].map(emo => (
                            <TouchableOpacity
                              key={emo}
                              style={[
                                styles.emojiButton,
                                icon === emo && styles.emojiSelected,
                              ]}
                              onPress={() => setIcon(emo)}
                            >
                              <Text style={{ fontSize: 24 }}>{emo}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.label}>ชื่อ</Text>
                        <TextInput
                          style={styles.inputFull}
                          value={firstName}
                          onChangeText={setFirstName}
                          placeholder="กรอกชื่อ"
                        />
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.label}>นามสกุล</Text>
                        <TextInput
                          style={styles.inputFull}
                          value={lastName}
                          onChangeText={setLastName}
                          placeholder="กรอกนามสกุล"
                        />
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.label}>ชั้นปี (EX : Intern,R1,R2,R3,Staff)</Text>
                        <TextInput
                          style={styles.inputFull}
                          value={year}
                          onChangeText={setYear}
                          inputMode='text'
                          autoCorrect={false}
                          placeholder="กรอกชั้นปี เช่น Intern,R1,R2,R3,Staff"
                        />
                      </View>

                      <View style={styles.modalButtonRow}>
                        <Button title="ยกเลิก" color="#888" onPress={() => {
                          setModalVisible(false);
                          setEditIndex(null);
                          setFirstName('');
                          setLastName('');
                          setYear('');
                        }} />
                        <Button
                          title={editIndex !== null ? 'บันทึก' : 'เพิ่ม'}
                          onPress={handleAdd}
                        />
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </Modal>

        <FlatList
          ListHeaderComponent={
            <View style={[styles.center, { marginBottom: 8 }]}>
              <View style={[styles.headerRow, { width: contentWidth }]}>
                <Text style={{ fontFamily: 'PKRound', fontSize: 24, textAlign: 'center' }}>รายชื่อหมอ</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={{ fontFamily: 'PKRound', fontSize: 14, textAlign: 'center' }}>➕ เพิ่มหมอ</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          contentContainerStyle={{ alignItems: 'center', paddingBottom: 40, paddingTop: 20 }}
          data={doctors}
          keyExtractor={(item, index) =>
            `${item.firstName}-${item.lastName}-${item.year}-${index}`
          }
          renderItem={({ item, index }) => (
            <View style={[styles.card, { width: contentWidth }]}>
              <Text style={styles.doctorName}>
                {item.icon || '👨🏻‍⚕️'} {item.firstName} {item.lastName} ({item.year})
              </Text>
              <Text style={styles.cardSubtitle}>ชั้นปี: {item.year}</Text>

              <View style={styles.cardButtons}>
                <TouchableOpacity
                  onPress={() => {
                    setFirstName(item.firstName);
                    setLastName(item.lastName);
                    setYear(item.year);
                    setEditIndex(index);
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.editText}>แก้ไข</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => removeDoctor(item)}>
                  <Text style={styles.deleteText}>ลบ</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          ListEmptyComponent={
            <Text style={{ color: '#888', fontStyle: 'italic', marginTop: 16 }}>
              📋 ยังไม่มีรายชื่อหมอ
            </Text>
          }
        />

      
    </View>
    
    
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  container: {
    paddingVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'PKRound'
  },
  inputGroup: {
    gap: 12,
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    fontSize: 16,
  },
  yearInput: {
    flex: 0.5,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  doctorName: {
    fontSize: 16,
  },
  deleteText: {
    color: '#d11a2a',
    fontWeight: '500',
  },
  modalBackdrop: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.3)',
  justifyContent: 'center',
  alignItems: 'center',
},
// modalTitle: {
//   fontSize: 18,
//   fontWeight: 'bold',
//   marginBottom: 12,
//   textAlign: 'center',
//   fontFamily: 'PKRound'
// },
formGroup: {
  marginBottom: 16,
},
label: {
  fontSize: 16,
  fontWeight: '500',
  marginBottom: 6,
  color: '#333',
  fontFamily: 'PKRound'
},
inputFull: {
  borderWidth: 1,
  borderColor: '#ccc',
  paddingVertical: 10,
  paddingHorizontal: 14,
  borderRadius: 8,
  fontSize: 14,
  backgroundColor: '#fff',
},
modalContainer: {
  backgroundColor: '#fff',
  padding: 24,
  borderRadius: 12,
  width: '90%', // 🔧 เปลี่ยนจาก '85%' เพื่อไม่ให้กว้างเกินบน iPad
  maxWidth: 500, // ✅ จำกัดขนาด max กรณี iPad
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5,
},
modalButtonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 24,
  fontFamily: 'PKRound',
},
card: {
  width: '100%',
  backgroundColor: '#f9f9f9',
  padding: 16,
  borderRadius: 12,
  marginBottom: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 2,
},
cardTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 4,
},
cardSubtitle: {
  fontSize: 14,
  color: '#666',
  marginBottom: 8,
},
cardButtons: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  gap: 16,
},
editText: {
  color: '#1e90ff',
  fontWeight: '500',
},

headerRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 12,
},

addButton: {
  backgroundColor: '#EFEFEF',
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 8,
},

addButtonText: {
  color: '#000',
  fontSize: 14,
  fontWeight: '500',
},
emojiRow: {
  flexDirection: 'row',
  gap: 12,
  marginTop: 4,
},
emojiButton: {
  padding: 18,
  borderRadius: 40,
  backgroundColor: '#eee',
},
emojiSelected: {
  backgroundColor: '#cce5ff',
},

});
