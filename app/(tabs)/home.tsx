import { Header } from '@/components/ui/Header';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import { StyleSheet, View } from 'react-native';

dayjs.locale('th');

export default function HomeScreen() {

  return (
    <View style={styles.container}>
       <Header showGreeting={true} showToday={true} showText = {false} logoSize={{ width: 120, height: 50 } }/>  
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
});
