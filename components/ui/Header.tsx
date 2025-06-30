import dayjs from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import updateLocale from 'dayjs/plugin/updateLocale';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

dayjs.extend(buddhistEra);
dayjs.extend(updateLocale);
dayjs.locale('th');

dayjs.updateLocale('th', {
  formats: {
    BBBB: 'BBBB', // fake เพื่อให้ไม่ error
    LLLL: 'D MMMM BBBB',
  },
  // 👇 ใช้จริงคือฟังก์ชันด้านล่าง
  yearFormat: 'BBBB',
});

type HeaderProps = {
  showGreeting?: boolean;
  showToday?: boolean;
  logoSize?: { width: number; height: number }; 
  showText?: boolean;
  text?: String;
  compact?: boolean; 
};

export const Header: React.FC<HeaderProps> = ({ showGreeting = true , showToday = true , logoSize = { width: 200, height: 70 } , showText = true, text = 'under logo text', compact = false}) => {
  const formattedDate = dayjs()
  .locale('th')
  .format('D MMMM ') + (dayjs().year() + 543);

  return (
    <View style={[styles.header, compact && styles.compactHeader]}>
       {/* 🧠 โลโก้ + ข้อความ รวมเป็นบรรทัดเดียว */}
       {showText && (
        <View style={styles.rowTextLogo}>
          <Image
            source={require('../../assets/images/docduty-logo.png')}
            style={{ ...styles.logoInline, width: logoSize.width, height: logoSize.height }}
          />
          <Text style={styles.text}>{text}</Text>
        </View>
      )}
       {showToday && (
        <Text style={styles.date}>{formattedDate}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#C3FAFF',
    borderBottomLeftRadius: 62,
    borderBottomRightRadius: 62,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 200,
    height: 70,
    resizeMode: 'contain',
    marginBottom: 5,
  },
  rowTextLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoInline: {
    resizeMode: 'contain',
  },
  compactHeader: {
    paddingVertical: 10,    
    paddingHorizontal: 10,   
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    
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
    text: {
    fontSize: 24,
    fontFamily: 'PKRound',
    color: '#008191',
  },
});
