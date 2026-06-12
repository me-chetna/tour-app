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
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeIn, SlideInRight } from 'react-native-reanimated';
import CityCard from '@/components/CityCard';
import BottomNavBar from '@/components/BottomNavBar';
import { states } from '@/data/states';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_HEIGHT * 0.40;

export default function StateDetailScreen() {
  const { stateId } = useLocalSearchParams<{ stateId: string }>();
  const state = states.find((s) => s.id === stateId);

  if (!state) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 40, fontFamily: 'Inter_400Regular' }}>State not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero banner */}
        <View style={styles.heroBanner}>
          <Image
            source={state.image}
            style={styles.heroImage}
            contentFit="cover"
            transition={400}
          />
          <LinearGradient
            colors={[
              'rgba(44,36,32,0.2)',
              'rgba(44,36,32,0.05)',
              'rgba(44,36,32,0.5)',
              'rgba(44,36,32,0.85)',
            ]}
            locations={[0, 0.25, 0.6, 1]}
            style={styles.heroGradient}
          />

          {/* Top row: back + share */}
          <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.topRow}>
            <Pressable style={styles.backCircle} onPress={() => router.back()}>
              <Feather name="arrow-left" size={18} color="#FFFFFF" />
            </Pressable>
            <View style={styles.topActions}>
              <Pressable style={styles.actionCircle}>
                <Feather name="heart" size={16} color="#FFFFFF" />
              </Pressable>
              <Pressable style={styles.actionCircle}>
                <Feather name="share-2" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          </Animated.View>

          {/* State info overlay */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            style={styles.heroInfo}
          >
            <Text style={styles.heroStep}>STEP 02 · {state.tagline}</Text>
            <Text style={styles.heroName}>{state.name}</Text>
            <Text style={styles.heroSubtitle}>{state.subtitle}</Text>
            <View style={styles.heroPills}>
              <View style={styles.pill}>
                <Feather name="map-pin" size={11} color="#D4654A" />
                <Text style={styles.pillText}>
                  {state.citiesReady} {state.citiesReady === 1 ? 'city' : 'cities'}
                </Text>
              </View>
              <View style={styles.pill}>
                <Feather name="calendar" size={11} color="#D4654A" />
                <Text style={styles.pillText}>2-5 day plans</Text>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Cities section */}
        <View style={styles.citiesSection}>
          <Animated.View entering={FadeInUp.delay(500).duration(600)}>
            <Text style={styles.citiesHeading}>Pick a city to plan</Text>
            <Text style={styles.citiesSubtext}>
              We've curated maps and starter itineraries for each.
            </Text>
          </Animated.View>

          {state.cities.map((city, index) => (
            <Animated.View
              key={city.id}
              entering={SlideInRight.delay(600 + index * 150).duration(500)}
            >
              <CityCard
                index={index}
                name={city.name}
                description={city.description}
                curatedSpots={city.curatedSpots}
                starterPlan={city.starterPlan}
                image={city.image}
                onPress={() => {
                  router.push({
                    pathname: '/map-planner',
                    params: { cityId: city.id },
                  });
                }}
              />
            </Animated.View>
          ))}
        </View>

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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  // Hero
  heroBanner: {
    width: '100%',
    height: HERO_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topRow: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInfo: {
    position: 'absolute',
    bottom: 20,
    left: 22,
    right: 22,
  },
  heroStep: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#D4CFC8',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 42,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#D4CFC8',
    marginBottom: 12,
  },
  heroPills: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#FFFFFF',
  },
  // Cities
  citiesSection: {
    padding: 22,
    paddingTop: 28,
  },
  citiesHeading: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: '#2C2420',
    marginBottom: 6,
  },
  citiesSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#8A7E74',
    marginBottom: 24,
  },
});
