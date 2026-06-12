import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = 56;

interface CityCardProps {
  index: number;
  name: string;
  description: string;
  curatedSpots: number;
  starterPlan: string;
  image: any;
  onPress: () => void;
}

export default function CityCard({
  index,
  name,
  description,
  curatedSpots,
  starterPlan,
  image,
  onPress,
}: CityCardProps) {
  const formattedIndex = String(index + 1).padStart(2, '0');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      {/* Image section */}
      <View style={styles.imageContainer}>
        <Image
          source={image}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        {/* Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>CITY {formattedIndex}</Text>
        </View>
      </View>

      {/* Info section */}
      <View style={styles.info}>
        <View style={styles.infoContent}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.description}>{description}</Text>
          <View style={styles.metaRow}>
            <Feather name="map-pin" size={12} color="#8A7E74" />
            <Text style={styles.metaText}>
              {curatedSpots} curated spots · {starterPlan}
            </Text>
          </View>
        </View>

        {/* Arrow button */}
        <Pressable style={styles.arrowButton} onPress={onPress}>
          <Feather name="arrow-right" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    boxShadow: '0px 4px 12px rgba(44, 36, 32, 0.08)',
    elevation: 4,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#2C2420',
    letterSpacing: 1.5,
  },
  info: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoContent: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: '#2C2420',
    marginBottom: 4,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#D4654A',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8A7E74',
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D4654A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
