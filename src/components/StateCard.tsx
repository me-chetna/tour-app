import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_GAP * 3) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.3;

interface StateCardProps {
  index: number;
  name: string;
  tagline: string;
  subtitle: string;
  emoji: string;
  citiesReady: number;
  image: any;
  onPress: () => void;
}

export default function StateCard({
  index,
  name,
  tagline,
  subtitle,
  emoji,
  citiesReady,
  image,
  onPress,
}: StateCardProps) {
  const formattedIndex = String(index + 1).padStart(2, '0');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <Image
        source={image}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />

      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(44,36,32,0.1)', 'rgba(44,36,32,0.85)']}
        style={styles.gradient}
        start={{ x: 0, y: 0.3 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Number badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{formattedIndex}</Text>
      </View>

      {/* Emoji icon */}
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>

      {/* Content overlay */}
      <View style={styles.content}>
        <Text style={styles.tagline}>{tagline}</Text>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {/* Meta row */}
        <View style={styles.metaRow}>
          <View style={styles.metaLeft}>
            <Feather name="map-pin" size={12} color="#B8AFA8" />
            <Text style={styles.metaText}>
              {citiesReady} {citiesReady === 1 ? 'city' : 'cities'} ready
            </Text>
          </View>
          <Feather name="arrow-right" size={16} color="#FFFFFF" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: CARD_GAP,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  emojiContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 16,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  tagline: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: '#D4654A',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  name: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#D4CFC8',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 8,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#B8AFA8',
  },
});
