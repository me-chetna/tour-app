import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Sidebar, { SIDEBAR_WIDTH } from '@/components/Sidebar';

interface ScreenLayoutProps {
  children: React.ReactNode;
}

export default function ScreenLayout({ children }: ScreenLayoutProps) {
  return (
    <View style={styles.root}>
      <Sidebar />
      <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'bottom']}>
        <View style={styles.content}>
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FDF6EE',
  },
  safeArea: {
    flex: 1,
    paddingLeft: SIDEBAR_WIDTH,
  },
  content: {
    flex: 1,
  },
});
