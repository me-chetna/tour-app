import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface NavItem {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  route: string;
  isCenter?: boolean;
}

const navItems: NavItem[] = [
  { icon: 'home', label: 'Home', route: '/' },
  { icon: 'compass', label: 'Explore', route: '/states' },
  { icon: 'plus', label: 'Plan', route: '/states', isCenter: true },
  { icon: 'clock', label: 'Timeline', route: '/timeline' },
  { icon: 'package', label: 'Food Scan', route: '/food-scanner' },
];

export default function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route: string, label: string) => {
    if (label === 'Home') return pathname === '/';
    if (label === 'Explore') return pathname === '/states' || pathname.startsWith('/state-detail') || pathname.startsWith('/map-planner');
    if (label === 'Timeline') return pathname === '/timeline';
    if (label === 'Food Scan') return pathname === '/food-scanner';
    return false;
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {navItems.map((item) => {
          const active = isActive(item.route, item.label);

          if (item.isCenter) {
            return (
              <Pressable
                key={item.label}
                style={({ pressed }) => [
                  styles.centerButton,
                  pressed && styles.centerPressed,
                ]}
                onPress={() => router.push(item.route as any)}
              >
                <View style={styles.centerCircle}>
                  <Feather name={item.icon} size={22} color="#FFFFFF" />
                </View>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.navItem,
                pressed && styles.itemPressed,
              ]}
              onPress={() => router.push(item.route as any)}
            >
              <Feather
                name={item.icon}
                size={20}
                color={active ? '#D4654A' : '#8A7E74'}
              />
              <Text
                style={[
                  styles.navLabel,
                  active && styles.navLabelActive,
                ]}
              >
                {item.label}
              </Text>
              {active && <View style={styles.activeDot} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 8,
    boxShadow: '0px -2px 20px rgba(44, 36, 32, 0.08)',
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(44, 36, 32, 0.04)',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 56,
  },
  itemPressed: {
    opacity: 0.7,
  },
  navLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#8A7E74',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#D4654A',
    fontFamily: 'Inter_600SemiBold',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D4654A',
    marginTop: 4,
  },
  centerButton: {
    marginTop: -28,
    alignItems: 'center',
  },
  centerPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  centerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D4654A',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 16px rgba(212, 101, 74, 0.35)',
    elevation: 8,
    borderWidth: 4,
    borderColor: '#FDF6EE',
  },
});
