import { useDoctor } from '@/contexts/DoctorContext';
import { useShift } from '@/contexts/ShiftContext';
import { FontAwesome5 } from '@expo/vector-icons';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const router = useRouter();

dayjs.locale('th');
const formattedDate = dayjs().format('dddd ที่ D MMMM BBBB');

export default function HomeScreen() {
  const { doctors } = useDoctor();
  const { shifts } = useShift();

  const todayKey = dayjs().format('YYYY-MM-DD');
  const todayShifts = shifts[todayKey] || {};

  const dutyList: { name: string; emoji: string; dutyType: string }[] = [];

  Object.entries(todayShifts).forEach(([dutyType, doctorIdArr]) => {
    doctorIdArr.forEach((id) => {
      const found = doctors.find((d) => d.id === id);
      if (found) {
        dutyList.push({
          name: `${found.firstName} (${found.year})`,
          emoji: found.icon || '🧑‍⚕️',
          dutyType,
        });
      }
    });
  });

  return (
    <View style={styles.container}>
      {/* ✅ โลโก้ด้านบนสุด */}
      <View style={styles.logoBox}>
        <Image
          source={require('@/assets/images/docduty-logo.png')}
          style={styles.logo}
        />
        <Text style={styles.welcome}>👋 สวัสดีคุณหมอ!</Text>
        <Text style={styles.date}>📅 {formattedDate}</Text>
      </View>

      {/* ✅ เนื้อหาหลัก */}
      <ScrollView contentContainerStyle={styles.mainContent} showsVerticalScrollIndicator={false}>
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>ขอให้เวรไม่เยินในวันนี้ ...</Text>
          <FlatList
            data={dutyList}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.emoji}>{item.emoji}</Text>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.dutyType}>{item.dutyType}</Text>
              </View>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardListContainer}
          />

          <Text style={styles.sectionTitle}>วันนี้ทำอะไรดี?</Text>
          <View style={styles.buttonGrid}>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.actionButton}>
                <FontAwesome5 name="calendar-alt" size={24} color="#007A8D" style={styles.icon} />
                <Text style={styles.buttonText}>ดูตารางเวร</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.actionButton}>
                <FontAwesome5 name="user-md" size={24} color="#007A8D" style={styles.icon} />
                <Text style={styles.buttonText}>รายชื่อหมอ</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/ExportPreviewScreen')}>
                <FontAwesome5 name="file-export" size={24} color="#007A8D" style={styles.icon} />
                <Text style={styles.buttonText}>ส่งออกตารางเดือนนี้</Text>
              </TouchableOpacity>
              
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.actionButton}>
                <FontAwesome5 name="comment-dots" size={24} color="#007A8D" style={styles.icon} />
                <Text style={styles.buttonText}>แจ้งปัญหา/แนะนำฟีเจอร์</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <FontAwesome5 name="cogs" size={24} color="#007A8D" style={styles.icon} />
                <Text style={styles.buttonText}>ตั้งค่า</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ✅ Footer */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>เวอร์ชัน {Constants.expoConfig?.version || '1.0.0'}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  logoBox: {
    paddingTop: 48,
    paddingBottom: 16,
    alignItems: 'center',
    backgroundColor: '#C3FAFF',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: 160,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  welcome: {
    fontSize: 24,
    fontFamily: 'PKRound',
    color: '#008191',
  },
  date: {
    fontSize: 18,
    fontFamily: 'PKRound',
    color: '#26C6DA',
  },
  mainContent: {
    flex: 1,
    paddingBottom: 100,
  },
  cardSection: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'PKRound',
    color: '#008191',
    marginBottom: 12,
  },
  cardListContainer: {
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
  },
  card: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginRight: 12,
    width: 110,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 0.5,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontFamily: 'PKRound',
    color: '#333',
    textAlign: 'center',
  },
  dutyType: {
    fontSize: 13,
    fontFamily: 'PKRound',
    color: '#999',
    marginTop: 4,
  },
  buttonGrid: {
    gap: 16,
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#008191',
  },
  icon: {
    marginBottom: 6,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'PKRound',
    color: '#007A8D',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#F8FAFC',
  },
  versionText: {
    fontSize: 13,
    fontFamily: 'PKRound',
    color: '#999',
  },
});
