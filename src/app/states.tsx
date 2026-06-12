import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import StateCard from '@/components/StateCard';
import BottomNavBar from '@/components/BottomNavBar';
import { states } from '@/data/states';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;

export default function StatesScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Top bar */}
      <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#2C2420" />
        </Pressable>
        <Text style={styles.topTitle}>Explore</Text>
        <Pressable style={styles.filterBtn}>
          <Feather name="sliders" size={18} color="#2C2420" />
        </Pressable>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.header}>
          <Text style={styles.stepLabel}>STEP 01</Text>
          <Text style={styles.heading}>Where do you want{'\n'}to wander?</Text>
          <Text style={styles.subtitle}>Tap a state to see its loved cities.</Text>
        </Animated.View>

        {/* State cards grid */}
        <View style={styles.grid}>
          {states.map((state, index) => (
            <Animated.View
              key={state.id}
              entering={FadeIn.delay(200 + index * 100).duration(600)}
            >
              <StateCard
                index={index}
                name={state.name}
                tagline={state.tagline}
                subtitle={state.subtitle}
                emoji={state.emoji}
                citiesReady={state.citiesReady}
                image={state.image}
                onPress={() =>
                  router.push({
                    pathname: '/state-detail',
                    params: { stateId: state.id },
                  })
                }
              />
            </Animated.View>
          ))}
        </View>

        {/* Footer */}
        <Animated.View entering={FadeInUp.delay(800).duration(600)} style={styles.footer}>
          <Text style={styles.footerText}>
            WANDER INDIA — A SLOW-TRAVEL PLANNER
          </Text>
        </Animated.View>

        {/* Bottom padding for nav bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF6EE',
  },
  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 42,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#FDF6EE',
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(44,36,32,0.06)',
  },
  topTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#2C2420',
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(44,36,32,0.06)',
  },
  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: CARD_GAP,
    paddingTop: 8,
    paddingBottom: 0,
  },
  header: {
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  stepLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#8A7E74',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heading: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 30,
    color: '#2C2420',
    lineHeight: 38,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#8A7E74',
    fontStyle: 'italic',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  footer: {
    marginTop: 24,
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#B8AFA8',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});
