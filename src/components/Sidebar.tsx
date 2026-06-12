import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

const SIDEBAR_WIDTH = 56;

type SidebarIconName = React.ComponentProps<typeof Feather>['name'];

interface SidebarItem {
  icon: SidebarIconName;
  route?: string;
  label: string;
}

const topItems: SidebarItem[] = [
  { icon: 'compass', route: '/', label: 'Explore' },
  { icon: 'map', route: '/map', label: 'Map' },
  { icon: 'clock', route: '/recent', label: 'Recent' },
  { icon: 'heart', route: '/favorites', label: 'Favorites' },
  { icon: 'plus', route: '/add', label: 'Add' },
];

const bottomItems: SidebarItem[] = [
  { icon: 'user', route: '/profile', label: 'Profile' },
  { icon: 'settings', route: '/settings', label: 'Settings' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handlePress = (route?: string) => {
    if (route) {
      router.push(route as any);
    }
  };

  const isActive = (route?: string) => {
    if (!route) return false;
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route);
  };

  const renderItem = (item: SidebarItem) => {
    const active = isActive(item.route);
    return (
      <Pressable
        key={item.label}
        style={({ pressed }) => [
          styles.iconButton,
          active && styles.iconButtonActive,
          pressed && styles.iconButtonPressed,
        ]}
        onPress={() => handlePress(item.route)}
        accessibilityLabel={item.label}
        accessibilityRole="button"
      >
        <Feather
          name={item.icon}
          size={20}
          color={active ? '#D4654A' : '#B8AFA8'}
        />
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>W</Text>
        </View>
      </View>

      {/* Top Navigation Icons */}
      <View style={styles.topIcons}>
        {topItems.map(renderItem)}
      </View>

      {/* Spacer pushes bottom icons down */}
      <View style={styles.spacer} />

      {/* Bottom Navigation Icons */}
      <View style={styles.bottomIcons}>
        {bottomItems.map(renderItem)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#3D3028',
    zIndex: 10,
    paddingTop: 50,
    paddingBottom: 30,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 28,
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D4654A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'PlayfairDisplay_700Bold',
    lineHeight: 22,
  },
  topIcons: {
    alignItems: 'center',
    gap: 4,
  },
  spacer: {
    flex: 1,
  },
  bottomIcons: {
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: {
    backgroundColor: 'rgba(212, 101, 74, 0.15)',
  },
  iconButtonPressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
});

export { SIDEBAR_WIDTH };
