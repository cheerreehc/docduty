import { Header } from '@/components/ui/Header';
import { SafeAreaView } from 'react-native';
import CalendarWithShift from '../../components/CalendarWithShift';



export default function Page() {

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <Header showGreeting={false} showToday={false} compact text = "ตารางเวร" logoSize={{ width: 120, height: 50 } }/>  
      <CalendarWithShift />
    </SafeAreaView>
  );
}
