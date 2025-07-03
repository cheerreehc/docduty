import { Feather } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useRef } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const sampleData = [
  { ward: 'นันทพร', icu: 'พันธาณต์', activity: '' },
  { ward: 'กิตติชัย', icu: 'ชลสวัสดิ์', activity: '' },
  { ward: 'พันธาณต์', icu: 'บุ๋วมี', activity: 'Journal club R1' },
  { ward: 'วิศรา', icu: 'พิชญา', activity: '' },
  { ward: 'พิชญา', icu: 'กิจติชัย', activity: '' },
  { ward: 'คณโชติ', icu: 'ศิริรัตน์', activity: '' },
  { ward: 'ภูเก็ต', icu: 'กานต์มณี', activity: '' },
];

export default function ExportTableScreen() {
  const viewRef = useRef(null);

  const handleExportAndShare = async () => {
    try {
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });

      const fileUri = FileSystem.documentDirectory + 'schedule.png';
      await FileSystem.moveAsync({ from: uri, to: fileUri });

      await Sharing.shareAsync(fileUri);
    } catch (error) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถแชร์ตารางได้');
      console.log('Error sharing image:', error);
    }
  };

  const handleExportAndSave = async () => {
    try {
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });

      const fileUri = FileSystem.documentDirectory + 'schedule.png';
      await FileSystem.moveAsync({ from: uri, to: fileUri });

      Alert.alert('บันทึกสำเร็จ', 'ไฟล์ถูกบันทึกใน Documents ของแอปแล้ว');
    } catch (error) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกตารางได้');
      console.log('Error saving image:', error);
    }
  };

  return (
    <ScrollView horizontal>
      <ScrollView>
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={handleExportAndSave} style={styles.iconButton}>
            <Feather name="camera" size={20} color="#008191" />
            <Text style={styles.iconLabel}>บันทึก</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleExportAndShare} style={styles.iconButton}>
            <Feather name="share" size={20} color="#008191" />
            <Text style={styles.iconLabel}>แชร์</Text>
          </TouchableOpacity>
        </View>

        <View ref={viewRef} style={styles.tableWrapper}>
          {/* Header Row */}
          <View style={styles.row}>
            <Text style={styles.headerCell}>Day</Text>
            {daysOfWeek.map((day) => (
              <Text key={day} style={styles.headerCell}>{day}</Text>
            ))}
          </View>

          {/* Ward Row */}
          <View style={styles.row}>
            <Text style={styles.labelCell}>Ward</Text>
            {sampleData.map((item, idx) => (
              <Text key={idx} style={styles.wardCell}>{item.ward}</Text>
            ))}
          </View>

          {/* ICU Row */}
          <View style={styles.row}>
            <Text style={styles.labelCell}>ICU/RCU</Text>
            {sampleData.map((item, idx) => (
              <Text key={idx} style={styles.icuCell}>{item.icu}</Text>
            ))}
          </View>

          {/* Activity Row */}
          <View style={styles.row}>
            <Text style={styles.labelCell}>Activity</Text>
            {sampleData.map((item, idx) => (
              <Text key={idx} style={styles.activityCell}>{item.activity}</Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
    gap: 12,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  iconLabel: {
    fontSize: 14,
    color: '#008191',
    fontWeight: '600',
  },
  tableWrapper: {
    padding: 10,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    backgroundColor: '#444',
    color: 'white',
    textAlign: 'center',
    padding: 10,
  },
  labelCell: {
    flex: 1,
    fontWeight: 'bold',
    backgroundColor: '#fcd34d',
    textAlign: 'center',
    padding: 10,
  },
  wardCell: {
    flex: 1,
    backgroundColor: '#fff8dc',
    textAlign: 'center',
    padding: 10,
  },
  icuCell: {
    flex: 1,
    backgroundColor: '#e0f2fe',
    textAlign: 'center',
    padding: 10,
  },
  activityCell: {
    flex: 1,
    backgroundColor: '#fce7f3',
    textAlign: 'center',
    padding: 10,
  },
});
