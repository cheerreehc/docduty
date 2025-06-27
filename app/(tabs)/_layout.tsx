import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome5 } from '@expo/vector-icons';



export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
        {/* 1️⃣ แท็บ “ตารางเวร” (ไฟล์ index.tsx) */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'ตารางเวร',
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="calendar-alt" size={20} color={color} />
            ),
          }}
        />

       {/* 2️⃣ แท็บ “รายชื่อหมอ” */}
        <Tabs.Screen
          name="doctor-list"
          options={{
            title: 'รายชื่อหมอ',
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="user-md" size={20} color={color} />
            ),
          }}
        />
      </Tabs>
  );
}
