import { Header } from '@/components/ui/Header';
import { useDutyType } from '@/contexts/DutyTypeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function setting() {
  const {dutyTypes, addDutyType, removeDutyType, updateDutyType } = useDutyType();
  const [newDuty, setNewDuty] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width * 0.9, 600);

  const saveDutyTypes = async (types: string[]) => {
    await AsyncStorage.setItem('docduty-dutyTypes', JSON.stringify(types));
  };

  const handleAdd = () => {
    const trimmed = newDuty.trim();
    if (!trimmed) return;

    if (editIndex !== null) {
      updateDutyType(editIndex, trimmed);
      setEditIndex(null);
    } else {
      addDutyType(trimmed);
    }

    setNewDuty('');
    setModalVisible(false);
  };


  const handleEdit = (index: number) => {
    setNewDuty(dutyTypes[index]);
    setEditIndex(index);
    setModalVisible(true);
  };

  const handleDelete = (index: number) => {
    removeDutyType(index); // ✅ เรียกผ่าน context
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ height: insets.top + 5, backgroundColor: '#008191' }} />
      <Header showGreeting={false} showToday={false} compact text="ประเภทเวร" logoSize={{ width: 80, height: 30 }} />

      <Modal visible={modalVisible} animationType="fade" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalBackdrop}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                  <Text style={{ fontFamily: 'PKRound', fontSize: 24, textAlign: 'center' }}>
                    {editIndex !== null ? 'แก้ไขประเภทเวร' : 'เพิ่มประเภทเวร'}
                  </Text>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>ชื่อเวร</Text>
                    <TextInput
                      style={styles.inputFull}
                      value={newDuty}
                      onChangeText={setNewDuty}
                      placeholder="เช่น ICU, Ward, ER"
                    />
                  </View>

                  <View style={styles.modalButtonRow}>
                    <Button title="ยกเลิก" color="#888" onPress={() => {
                      setModalVisible(false);
                      setEditIndex(null);
                      setNewDuty('');
                    }} />
                    <Button title="บันทึก" onPress={handleAdd} />
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
              <Text style={{ fontFamily: 'PKRound', fontSize: 24, textAlign: 'center' }}>ประเภทเวร</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.addButtonText}>➕ เพิ่ม</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 40, paddingTop: 20 }}
        data={dutyTypes}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item, index }) => (
          <View style={[styles.card, { width: contentWidth }]}>
            <Text style={styles.doctorName}>{item}</Text>
            <View style={styles.cardButtons}>
              <TouchableOpacity onPress={() => handleEdit(index)}>
                <Text style={styles.editText}>แก้ไข</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(index)}>
                <Text style={styles.deleteText}>ลบ</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: '#888', fontStyle: 'italic', marginTop: 16 }}>
            📋 ยังไม่มีประเภทเวร
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
}

});
