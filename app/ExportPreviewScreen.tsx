import { useDoctor } from '@/contexts/DoctorContext';
import { useShift } from '@/contexts/ShiftContext';
import { Feather } from '@expo/vector-icons';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';

dayjs.locale('th');

const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function ExportCalendar() {
  const { shifts } = useShift();
  const { doctors } = useDoctor();
  const today = dayjs();
  const year = today.year();
  const month = today.month(); // 0-indexed
  const shotRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [exportUri, setExportUri] = useState<string | null>(null);

  const firstDay = dayjs().startOf('month');
  const lastDay = dayjs().endOf('month');
  const daysInMonth = lastDay.date();
  const startDay = firstDay.day(); // 0 = Sunday

  const [isModalVisible, setModalVisible] = useState(false);



  const calendarDays = [];
  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(dayjs(new Date(year, month, i)));
  }

  const getDoctorById = (id: string) => doctors.find((d) => d.id === id);

  // Capture image หลังจาก ViewShot render เสร็จ
  useEffect(() => {
    const generateExportImage = async () => {
      if (!shotRef.current) return;
      try {
        const uri = await captureRef(shotRef.current, {
          format: 'png',
          quality: 1,
          width: 1200,
          height: 850,
          result: 'tmpfile',
        });
        setExportUri(uri);
      } catch (err) {
        console.error('Capture failed', err);
        Alert.alert('ผิดพลาด', 'ไม่สามารถสร้างภาพตารางเวรได้');
      }
    };

    if (isReady) {
      generateExportImage();
    }
  }, [isReady]);

  const handleSave = async () => {
    if (!exportUri) return;
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('ไม่ได้รับสิทธิ์', 'โปรดอนุญาตการเข้าถึงรูปภาพ');
      return;
    }
    try {
      await MediaLibrary.createAssetAsync(exportUri);
      Alert.alert('บันทึกสำเร็จ', 'บันทึกรูปภาพตารางเวรเรียบร้อยแล้ว');
    } catch (err) {
      console.error(err);
      Alert.alert('ผิดพลาด', 'ไม่สามารถบันทึกรูปภาพได้');
    }
  };

  const handleShare = async () => {
    if (!exportUri) return;
    try {
      await Sharing.shareAsync(exportUri);
    } catch (err) {
      console.error(err);
      Alert.alert('ผิดพลาด', 'ไม่สามารถแชร์รูปภาพได้');
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>
          ตารางเวรเดือน {today.format('MMMM BBBB')}
        </Text>
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={handleSave}>
            <Feather name="download" size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={{ marginLeft: 18 }}>
            <Feather name="share" size={22} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.previewLabel}>ภาพตัวอย่างจากภาพที่ export จริง</Text>

      {exportUri ? (
        <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image
            source={{ uri: exportUri }}
            style={{ width: 300, height: 212, borderRadius: 8 }}
            resizeMode="contain"
            />
            <Text style={{ textAlign: 'center', color: '#666', marginTop: 6 }}>
            แตะที่ภาพเพื่อดูแบบเต็มจอ
            </Text>
        </TouchableOpacity>
        ) : (
        <Text style={{ marginTop: 20 }}>กำลังสร้างภาพตารางเวร...</Text>
        )}

    <Modal visible={isModalVisible} transparent={true}>
  <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
    <TouchableOpacity
      onPress={() => setModalVisible(false)}
      style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }}
    >
      <Feather name="x" size={30} color="#fff" />
    </TouchableOpacity>

    {exportUri && (
      <Image
        source={{ uri: exportUri }}
        style={{ width: '90%', height: undefined, aspectRatio: 1200 / 850 }}
        resizeMode="contain"
      />
    )}
  </View>
</Modal>



      {/* ViewShot: ซ่อนไว้แต่ render จริง + onLayout */}
      <ViewShot
        ref={shotRef}
        style={styles.hiddenShot}
        onLayout={() => setIsReady(true)}
        options={{ format: 'png', quality: 1 }}
      >
        <View style={{ padding: 20 }}>
          <Text style={styles.exportTitle}>
            ตารางเวรเดือน {today.format('MMMM BBBB')}
          </Text>

          <View style={styles.gridWrap}>
            {daysOfWeek.map((day) => (
              <Text key={day} style={styles.dayHeader}>
                {day}
              </Text>
            ))}

            {calendarDays.map((date, index) => {
              if (!date)
                return <View key={index} style={styles.dayCell} />;
              const dateKey = date.format('YYYY-MM-DD');
              const duties = shifts[dateKey] || {};

              return (
                <View key={index} style={styles.dayCell}>
                  <Text style={styles.dateText}>{date.date()}</Text>
                  {Object.entries(duties).map(([type, ids]) => (
                    <View key={type} style={styles.dutyRow}>
                      <Text style={styles.dutyTypeLabel}>{type}: </Text>
                      {ids.map((id) => {
                        const doc = getDoctorById(id);
                        if (!doc) return null;
                        return (
                          <Text
                            key={id}
                            style={[
                              styles.badgeInline,
                              { backgroundColor: doc.color || '#ccc' },
                            ]}
                          >
                            {doc.icon} {doc.firstName}
                          </Text>
                        );
                      })}
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        </View>
      </ViewShot>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'PKRound',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewLabel: {
    marginTop: 12,
    fontFamily: 'PKRound',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  exportImage: {
    width: '100%',
    aspectRatio: 1200 / 850,
    marginTop: 8,
  },
  hiddenShot: {
    width: 1200,
    height: 850,
    opacity: 0.01, // ✅ ซ่อนแต่ render จริง
    backgroundColor: '#fff',
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: -1,
  },
  exportTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'PKRound',
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 1200,
  },
  dayHeader: {
    width: 1200 / 7,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#008191',
    paddingBottom: 10,
    fontFamily: 'PKRound',
  },
  dayCell: {
    width: 1200 / 7,
    borderWidth: 0.5,
    borderColor: '#ddd',
    minHeight: 110,
    padding: 6,
  },
  dateText: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'right',
    fontFamily: 'PKRound',
  },
  dutyTypeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 4,
    fontFamily: 'PKRound',
  },
  badgeInline: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 4,
    marginBottom: 2,
    fontSize: 12,
    color: '#000',
    fontFamily: 'PKRound',
  },
  dutyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
});
