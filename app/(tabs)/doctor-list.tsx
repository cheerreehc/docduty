import React, { useState } from 'react';
import {
    Button,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDoctor } from '../../contexts/DoctorContext'; // 🔁 ปรับ path ให้ตรงโปรเจกต์คุณ

export default function DoctorListScreen() {
  const [doctorName, setDoctorName] = useState('');
  const { doctors, addDoctor, removeDoctor } = useDoctor();

  const handleAdd = () => {
    const name = doctorName.trim();
    if (!name) return;
    addDoctor(name);
    setDoctorName('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>รายชื่อหมอ</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="ใส่ชื่อหมอ"
          value={doctorName}
          onChangeText={setDoctorName}
        />
        <Button title="เพิ่ม" onPress={handleAdd} />
      </View>

      <FlatList
        data={doctors}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item, index }) => (
          <View style={styles.listItem}>
            <Text style={styles.doctorName}>{item}</Text>
            <TouchableOpacity onPress={() => removeDoctor(index)}>
              <Text style={styles.deleteText}>ลบ</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#888' }}>ยังไม่มีรายชื่อหมอ</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  doctorName: { fontSize: 16 },
  deleteText: { color: 'red' },
});
