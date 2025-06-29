import dayjs from 'dayjs';
import 'dayjs/locale/th';
import { Image, StyleSheet, Text, View } from 'react-native';

dayjs.locale('th');
const formattedDate = dayjs().format('D MMMM BBBB');

export default function HomeScreen() {

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

      {/* ✅ พื้นที่ content ด้านล่าง */}
      <View style={styles.content}>
        {/* TODO: ใส่เนื้อหาของหน้า home ที่นี่ */}
      </View>
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
  title: {
    fontSize: 24,
    fontFamily: 'PKRound',
    color: '#008191',
  },
  content: {
    flex: 1,
    padding: 20,
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
});
