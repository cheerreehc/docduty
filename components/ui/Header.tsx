import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

export default function Header() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>DocDuty - จัดตารางเวร</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: '#f8f8f8',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // ป้องกันชน Status Bar
  },
  header: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444',
  },
});
