import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome5 } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {

  const colorScheme = useColorScheme();

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
      tabBarActiveTintColor: '#00B7D9',
      tabBarInactiveTintColor: '#A0A0A0',
      headerShown: false,
      tabBarButton: HapticTab,
      tabBarBackground: TabBarBackground,
      tabBarLabelStyle: {
        fontFamily: 'PKRound',
        fontSize: 14,
        marginTop: -2
      },
      tabBarStyle: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowOffset: { width: 0, height: -10 },
        shadowRadius: 10,
        elevation: 10,
        borderTopWidth: 0,
        marginTop: 5,
        overflow: 'hidden',
      },
      
    }}>
      
        {/* แท็บ หน้าแรก (ไฟล์ home.tsx) */}
        <Tabs.Screen
          name="home"
          options={{
            title: 'หน้าแรก',
            tabBarIcon: TabIcon('grin-wink'),
          }}
        />

        {/* แท็บ “ตารางเวร” (ไฟล์ calendarWithShift.tsx) */}
        <Tabs.Screen
          name="CalendarWithShift"
          options={{
            title: 'ตารางเวร',
            tabBarIcon: TabIcon('calendar-alt'),
          }}
        />

        {/* แท็บ “รายชื่อหมอ” */}
        <Tabs.Screen
          name="doctor-list"
          options={{
            title: 'รายชื่อหมอ',
            tabBarIcon: TabIcon('user-md'),
          }}
        />

        {/* แท็บ “ตั้งค่า” */}
        <Tabs.Screen
          name="setting"
          options={{
            title: 'ตั้งค่า',
            tabBarIcon: TabIcon('cogs'),
          }}
        />

        <Tabs.Screen
          name="index"
          options={{ href: null }}
        />

      </Tabs>
  )
  
}

const TabIcon = (iconName: string) => ({ color }: any) => (
  <FontAwesome5 name={iconName} size={20}  color={color} />
);




