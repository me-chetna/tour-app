import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, {
  FadeInUp,
  FadeInDown,
  FadeIn,
  FadeInRight,
} from 'react-native-reanimated';
import BottomNavBar from '@/components/BottomNavBar';
import { states } from '@/data/states';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Featured experiences data
const experiences = [
  {
    id: '1',
    title: 'Heritage Walk',
    icon: '🏛️',
    color: '#E8D5C4',
  },
  {
    id: '2',
    title: 'Beach Vibes',
    icon: '🏖️',
    color: '#C4DEE8',
  },
  {
    id: '3',
    title: 'Mountain Trek',
    icon: '⛰️',
    color: '#C4E8D0',
  },
  {
    id: '4',
    title: 'Food Trail',
    icon: '🍛',
    color: '#E8C4C4',
  },
  {
    id: '5',
    title: 'Spiritual',
    icon: '🕉️',
    color: '#D5C4E8',
  },
];

// Trending destinations
const trending = [
  {
    id: '1',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    rating: '4.8',
    image: require('@/assets/images/featured/varanasi.png'),
  },
  {
    id: '2',
    name: 'Jaipur',
    state: 'Rajasthan',
    rating: '4.7',
    image: require('@/assets/images/featured/jaipur.png'),
  },
  {
    id: '3',
    name: 'Dal Lake',
    state: 'Kashmir',
    rating: '4.9',
    image: require('@/assets/images/featured/kashmir.png'),
  },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── HERO SECTION ──────────────────────────────────── */}
        <View style={styles.hero}>
          <Image
            source={require('@/assets/images/hero.png')}
            style={styles.heroImage}
            contentFit="cover"
            transition={500}
          />
          <LinearGradient
            colors={[
              'rgba(44,36,32,0.15)',
              'rgba(44,36,32,0.05)',
              'rgba(253,246,238,0.7)',
              '#FDF6EE',
            ]}
            locations={[0, 0.3, 0.65, 1]}
            style={styles.heroGradient}
          />

          {/* Top bar */}
          <Animated.View entering={FadeIn.delay(100).duration(500)} style={styles.topBar}>
            <View style={styles.logoRow}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>W</Text>
              </View>
              <View>
                <Text style={styles.brandName}>WanderIndia</Text>
                <Text style={styles.brandSub}>slow-travel planner</Text>
              </View>
            </View>
            <Pressable style={styles.notifButton}>
              <Feather name="bell" size={20} color="#2C2420" />
              <View style={styles.notifDot} />
            </Pressable>
          </Animated.View>

          {/* Hero content */}
          <View style={styles.heroContent}>
            <Animated.View entering={FadeInUp.delay(200).duration(700)}>
              <Text style={styles.labelText}>✦ PLAN YOUR INDIA · EST. 2026</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(350).duration(700)}>
              <Text style={styles.heroHeading}>
                Wander the{'\n'}colours of{' '}
                <Text style={styles.heroHighlight}>India</Text>
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(500).duration(700)}>
              <Text style={styles.heroSubtext}>
                Pick a state, choose a city, drop pins on a{'\n'}real map — we do the rest.
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(650).duration(700)} style={styles.ctaRow}>
              <Pressable
                style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]}
                onPress={() => router.push('/states')}
              >
                <Text style={styles.ctaText}>Start exploring</Text>
                <Feather name="arrow-right" size={15} color="#FFFFFF" />
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.cta3DButton, pressed && styles.cta3DPressed]}
                onPress={() => router.push('/monument-3d')}
              >
                <Feather name="box" size={14} color="#D4654A" style={{ marginRight: 6 }} />
                <Text style={styles.cta3DText}>3D Explorer</Text>
              </Pressable>
            </Animated.View>
          </View>
        </View>

        {/* ─── SEARCH BAR ────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(700).duration(600)} style={styles.searchSection}>
          <Pressable style={styles.searchBar}>
            <Feather name="search" size={18} color="#8A7E74" />
            <Text style={styles.searchPlaceholder}>Search states, cities, or experiences...</Text>
          </Pressable>
        </Animated.View>

        {/* ─── EXPERIENCE CATEGORIES ─────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(800).duration(600)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore by experience</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.expScroll}
          >
            {experiences.map((exp, i) => (
              <Animated.View key={exp.id} entering={FadeInRight.delay(850 + i * 80).duration(500)}>
                <Pressable
                  style={({ pressed }) => [
                    styles.expCard,
                    { backgroundColor: exp.color },
                    pressed && styles.expCardPressed,
                  ]}
                >
                  <Text style={styles.expEmoji}>{exp.icon}</Text>
                  <Text style={styles.expTitle}>{exp.title}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* ─── POPULAR STATES (HORIZONTAL SCROLL) ────────────── */}
        <Animated.View entering={FadeInUp.delay(900).duration(600)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular states</Text>
            <Pressable onPress={() => router.push('/states')}>
              <Text style={styles.seeAll}>See all →</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statesScroll}
            decelerationRate="fast"
            snapToInterval={SCREEN_WIDTH * 0.62 + 12}
          >
            {states.slice(0, 4).map((state, i) => (
              <Animated.View key={state.id} entering={FadeInRight.delay(950 + i * 100).duration(500)}>
                <Pressable
                  style={({ pressed }) => [
                    styles.stateScrollCard,
                    pressed && styles.stateCardPressed,
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: '/state-detail',
                      params: { stateId: state.id },
                    })
                  }
                >
                  <Image
                    source={state.image}
                    style={styles.stateScrollImage}
                    contentFit="cover"
                    transition={300}
                  />
                  <LinearGradient
                    colors={['rgba(44,36,32,0)', 'rgba(44,36,32,0.85)']}
                    style={styles.stateScrollGradient}
                    start={{ x: 0, y: 0.35 }}
                    end={{ x: 0, y: 1 }}
                  />
                  <View style={styles.stateScrollBadge}>
                    <Text style={styles.stateScrollEmoji}>{state.emoji}</Text>
                  </View>
                  <View style={styles.stateScrollInfo}>
                    <Text style={styles.stateScrollTag}>{state.tagline}</Text>
                    <Text style={styles.stateScrollName}>{state.name}</Text>
                    <View style={styles.stateScrollMeta}>
                      <Feather name="map-pin" size={10} color="#D4CFC8" />
                      <Text style={styles.stateScrollMetaText}>
                        {state.citiesReady} {state.citiesReady === 1 ? 'city' : 'cities'} ready
                      </Text>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* ─── TRENDING DESTINATIONS ─────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(1000).duration(600)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending now</Text>
            <Pressable>
              <Text style={styles.seeAll}>See all →</Text>
            </Pressable>
          </View>
          <View style={styles.trendingList}>
            {trending.map((place, i) => (
              <Animated.View key={place.id} entering={FadeInUp.delay(1050 + i * 100).duration(500)}>
                <Pressable
                  style={({ pressed }) => [
                    styles.trendingCard,
                    pressed && styles.trendingPressed,
                  ]}
                >
                  <Image
                    source={place.image}
                    style={styles.trendingImage}
                    contentFit="cover"
                    transition={300}
                  />
                  <View style={styles.trendingInfo}>
                    <Text style={styles.trendingName}>{place.name}</Text>
                    <Text style={styles.trendingState}>{place.state}</Text>
                  </View>
                  <View style={styles.trendingRating}>
                    <Feather name="star" size={12} color="#D4654A" />
                    <Text style={styles.ratingText}>{place.rating}</Text>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* ─── QUICK STATS ───────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(1100).duration(600)} style={styles.statsSection}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>28</Text>
            <Text style={styles.statLabel}>States</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>100+</Text>
            <Text style={styles.statLabel}>Cities</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Places</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>50+</Text>
            <Text style={styles.statLabel}>Itineraries</Text>
          </View>
        </Animated.View>

        {/* ─── FOOTER ────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>WANDER INDIA — A SLOW-TRAVEL PLANNER</Text>
          <Text style={styles.footerSub}>Made with ♥ for explorers</Text>
        </View>

        {/* Bottom padding for nav bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Chatbot Bubble */}
      <Pressable 
        style={({ pressed }) => [
          styles.floatingChatBtn,
          pressed && styles.floatingChatBtnPressed
        ]}
        onPress={() => router.push('/chatbot')}
      >
        <Feather name="message-circle" size={24} color="#FFFFFF" />
      </Pressable>

      {/* Bottom Navigation */}
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

  // ─── Hero ───────────────────────────────────────────
  hero: {
    height: SCREEN_HEIGHT * 0.58,
    position: 'relative',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D4654A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 17,
    color: '#FFFFFF',
  },
  brandName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#2C2420',
  },
  brandSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#8A7E74',
    letterSpacing: 0.5,
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#D4654A',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 22,
    paddingBottom: 10,
  },
  labelText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#D4654A',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  heroHeading: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 34,
    color: '#2C2420',
    lineHeight: 42,
    marginBottom: 10,
  },
  heroHighlight: {
    color: '#D4654A',
  },
  heroSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#8A7E74',
    lineHeight: 20,
    marginBottom: 18,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#D4654A',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 999,
  },
  ctaPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  cta3DButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFD1C9',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 999,
  },
  cta3DPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  cta3DText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#D4654A',
  },
  ctaText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  statsText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#8A7E74',
  },

  // ─── Search ─────────────────────────────────────────
  searchSection: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(44,36,32,0.06)',
    boxShadow: '0px 2px 8px rgba(44, 36, 32, 0.04)',
    elevation: 2,
  },
  searchPlaceholder: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#B8AFA8',
  },

  // ─── Section Headers ───────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginTop: 24,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: '#2C2420',
  },
  seeAll: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#D4654A',
  },

  // ─── Experience Cards ──────────────────────────────
  expScroll: {
    paddingLeft: 22,
    paddingRight: 10,
    gap: 10,
  },
  expCard: {
    width: 88,
    height: 88,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  expCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  expEmoji: {
    fontSize: 26,
  },
  expTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#2C2420',
    textAlign: 'center',
  },

  // ─── State Horizontal Cards ────────────────────────
  statesScroll: {
    paddingLeft: 22,
    paddingRight: 10,
    gap: 12,
  },
  stateScrollCard: {
    width: SCREEN_WIDTH * 0.62,
    height: SCREEN_WIDTH * 0.78,
    borderRadius: 20,
    overflow: 'hidden',
  },
  stateCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  stateScrollImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  stateScrollGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  stateScrollBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateScrollEmoji: {
    fontSize: 16,
  },
  stateScrollInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  stateScrollTag: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: '#D4654A',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  stateScrollName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 26,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  stateScrollMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stateScrollMetaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#D4CFC8',
  },

  // ─── Trending ──────────────────────────────────────
  trendingList: {
    paddingHorizontal: 22,
    gap: 12,
  },
  trendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(44,36,32,0.04)',
    boxShadow: '0px 2px 8px rgba(44, 36, 32, 0.04)',
    elevation: 2,
  },
  trendingPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  trendingImage: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  trendingInfo: {
    flex: 1,
    marginLeft: 14,
  },
  trendingName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 17,
    color: '#2C2420',
    marginBottom: 2,
  },
  trendingState: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#8A7E74',
  },
  trendingRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FDF6EE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  ratingText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#2C2420',
  },

  // ─── Stats ─────────────────────────────────────────
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 22,
    marginTop: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(44,36,32,0.04)',
    boxShadow: '0px 2px 8px rgba(44, 36, 32, 0.04)',
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    color: '#D4654A',
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8A7E74',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(44,36,32,0.08)',
  },

  // ─── Footer ────────────────────────────────────────
  footer: {
    marginTop: 32,
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#B8AFA8',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  footerSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#D4CFC8',
  },
  floatingChatBtn: {
    position: 'absolute',
    bottom: 96,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#D4654A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 99,
  },
  floatingChatBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
});
