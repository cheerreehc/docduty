import dayjs from 'dayjs';
import 'dayjs/locale/th';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

dayjs.locale('th');

type HeaderProps = {
  showGreeting?: boolean;
  showToday?: boolean;
  logoSize?: { width: number; height: number }; 
  showText?: boolean;
  text?: String;
  compact?: boolean; 
};

export const Header: React.FC<HeaderProps> = ({ showGreeting = true , showToday = true , logoSize = { width: 200, height: 70 } , showText = true, text = 'under logo text', compact = false}) => {
  const formattedDate = dayjs().format('D MMMM BBBB');

  return (
    <View style={[styles.header, compact && styles.compactHeader]}>
      <Image
        source={require('../../assets/images/docduty-logo.png')}
         style={{ ...styles.logo, width: logoSize.width, height: logoSize.height }}
      />
      {showGreeting && (
        <Text style={styles.welcome}>👋 สวัสดีคุณหมอ!</Text>
      )}
      {showToday && (
        <Text style={styles.date}>📅 {formattedDate}</Text>
      )}
      {showText && (
        <Text style={styles.text}>{text}</Text>
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
