import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  useWindowDimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import InteractiveMap from '@/components/InteractiveMap';
import { getCityPlan, Place, NearbyEat } from '@/data/cityPlaces';

export default function MapPlannerScreen() {
  const { cityId } = useLocalSearchParams<{ cityId: string }>();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

  // Explicitly calculate layout heights (bottom bar covers 1/4 screen height, map covers 3/4)
  const BOTTOM_BAR_HEIGHT = Math.max(260, SCREEN_HEIGHT * 0.32);
  const MAP_HEIGHT = SCREEN_HEIGHT - BOTTOM_BAR_HEIGHT;

  // Retrieve initial plan
  const cityPlan = useMemo(() => {
    return getCityPlan(cityId || 'jaipur');
  }, [cityId]);

  if (!cityPlan) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Destination plan not found.</Text>
        <Pressable style={styles.errorButton} onPress={() => router.back()}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // Active state for places list
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [activeDay, setActiveDay] = useState(1);

  // Load places on mount
  useEffect(() => {
    if (cityPlan) {
      setPlaces(cityPlan.places);
      // Select first in-plan place initially
      const firstInPlan = cityPlan.places.find((p) => p.inPlan && p.day === 1);
      setSelectedPlace(firstInPlan || cityPlan.places[0] || null);
    }
  }, [cityPlan]);

  // Compute planned places sorted for the active day
  const activeDayPlaces = useMemo(() => {
    return places
      .filter((p) => p.inPlan && p.day === activeDay)
      .sort((a, b) => a.order - b.order);
  }, [places, activeDay]);

  // Compute day statistics (budget, stops)
  const dayStats = useMemo(() => {
    const stats: Record<number, { cost: number; stops: number; duration: number }> = {};
    for (let d = 1; d <= cityPlan.totalDays; d++) {
      stats[d] = { cost: 0, stops: 0, duration: 0 };
    }

    places.forEach((p) => {
      if (p.inPlan && p.day > 0) {
        if (!stats[p.day]) {
          stats[p.day] = { cost: 0, stops: 0, duration: 0 };
        }
        stats[p.day].cost += p.cost;
        stats[p.day].stops += 1;
        stats[p.day].duration += p.duration + p.travelTimeToNext;
      }
    });

    return stats;
  }, [places, cityPlan.totalDays]);

  // Compute total statistics across all days
  const totalStats = useMemo(() => {
    let cost = 0;
    let duration = 0;

    places.forEach((p) => {
      if (p.inPlan) {
        cost += p.cost;
        duration += p.duration + p.travelTimeToNext;
      }
    });

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    return {
      cost,
      timeStr,
      totalStops: places.filter((p) => p.inPlan).length,
    };
  }, [places]);

  // Check if a restaurant is already added to the plan
  const isEatAdded = (eatName: string) => {
    return places.some((p) => p.name.includes(eatName) && p.inPlan);
  };

  // Add / Remove place to plan toggle
  const togglePlaceInPlan = (placeId: string) => {
    setPlaces((prevPlaces) => {
      const updated = prevPlaces.map((p) => {
        if (p.id === placeId) {
          const nextInPlan = !p.inPlan;
          if (nextInPlan) {
            const dayStops = prevPlaces.filter((x) => x.inPlan && x.day === activeDay);
            const nextOrder = dayStops.length + 1;
            const travelTime = p.type === 'attraction' ? 10 : 0;
            return {
              ...p,
              inPlan: true,
              day: activeDay,
              order: nextOrder,
              travelTimeToNext: travelTime,
            };
          } else {
            return {
              ...p,
              inPlan: false,
              day: 0,
              order: 0,
              travelTimeToNext: 0,
            };
          }
        }
        return p;
      });

      const placeAffected = prevPlaces.find((p) => p.id === placeId);
      const dayAffected = placeAffected?.day || activeDay;
      const wasInPlan = placeAffected?.inPlan;

      if (wasInPlan) {
        let orderIndex = 1;
        const reordered = updated.map((p) => {
          if (p.inPlan && p.day === dayAffected) {
            if (p.id === placeId) return p;
            const newOrder = orderIndex++;
            return { ...p, order: newOrder };
          }
          return p;
        });
        return reordered;
      }

      return updated;
    });

    setSelectedPlace((prev) => {
      if (prev?.id === placeId) {
        const item = places.find((p) => p.id === placeId);
        if (item) {
          return { ...item, inPlan: !item.inPlan };
        }
      }
      return prev;
    });
  };

  // Add a nearby food spot to the active day plan directly after its parent attraction
  const addNearbyEatToPlan = (attraction: Place, eat: NearbyEat) => {
    const existingInPlan = places.find((p) => p.name.includes(eat.name) && p.inPlan);
    if (existingInPlan) return;

    const existingMaster = places.find(
      (p) => p.name.includes(eat.name) || eat.name.includes(p.name)
    );

    if (existingMaster) {
      setPlaces((prevPlaces) => {
        const attrDay = attraction.day;
        const attrOrder = attraction.order;

        const shifted = prevPlaces.map((p) => {
          if (p.inPlan && p.day === attrDay && p.order > attrOrder) {
            return { ...p, order: p.order + 1 };
          }
          return p;
        });

        return shifted.map((p) => {
          if (p.id === existingMaster.id) {
            return {
              ...p,
              inPlan: true,
              day: attrDay,
              order: attrOrder + 1,
              travelTimeToNext: 6,
            };
          }
          return p;
        });
      });
    } else {
      const newId = `${attraction.id}-eat-${Date.now()}`;
      const newRestaurant: Place = {
        id: newId,
        name: eat.name,
        type: 'restaurant',
        lat: attraction.lat + 0.0015,
        lng: attraction.lng + 0.0015,
        rating: eat.rating,
        duration: 45,
        cost: eat.cost,
        description: `Recommended dining nearby: famous for ${eat.cuisine}. AI Suggestion: ${eat.aiSuggestion}`,
        image: attraction.image,
        inPlan: true,
        day: attraction.day,
        order: attraction.order + 1,
        nearbyEats: [],
        travelTimeToNext: 5,
      };

      setPlaces((prevPlaces) => {
        const shifted = prevPlaces.map((p) => {
          if (p.inPlan && p.day === attraction.day && p.order > attraction.order) {
            return { ...p, order: p.order + 1 };
          }
          return p;
        });
        return [...shifted, newRestaurant];
      });
    }
  };

  const currentDayStats = dayStats[activeDay] || { cost: 0, stops: 0 };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDF6EE" />

      <View style={styles.content}>
        {/* TOP: Map View (Takes 3/4 screen height) */}
        <View style={[styles.mapContainer, { height: MAP_HEIGHT }]}>
          <InteractiveMap
            places={places}
            centerLat={cityPlan.centerLat}
            centerLng={cityPlan.centerLng}
            zoomDelta={cityPlan.zoomDelta}
            selectedPlace={selectedPlace}
            onSelectPlace={(p) => setSelectedPlace(p)}
            onRightClickPlace={(p) => togglePlaceInPlan(p.id)}
          />

          {/* Floating Back Row overlaying Map */}
          <Pressable style={styles.floatingBackButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={16} color="#2C2420" />
          </Pressable>

          {/* Floating Map Legend */}
          <View style={styles.legendCard}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#D4654A' }]} />
              <Text style={styles.legendText}>In plan</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#8A7E74' }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#8C6239' }]} />
              <Text style={styles.legendText}>Restaurant</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#C69C24' }]} />
              <Text style={styles.legendText}>Market</Text>
            </View>
          </View>

          {/* Selected Place Popup Detail Card */}
          {selectedPlace && (
            <View style={styles.detailPopupCard}>
              <View style={styles.popupImageContainer}>
                <Image
                  source={selectedPlace.image}
                  style={styles.popupImage}
                  contentFit="cover"
                  transition={200}
                />
                <View style={styles.popupBadge}>
                  <Text style={styles.popupBadgeText}>
                    {selectedPlace.type.toUpperCase()}
                  </Text>
                </View>
                <Pressable
                  style={styles.popupCloseBtn}
                  onPress={() => setSelectedPlace(null)}
                >
                  <Feather name="x" size={16} color="#FFFFFF" />
                </Pressable>
              </View>

              <View style={styles.popupInfo}>
                <Text style={styles.popupName} numberOfLines={1}>{selectedPlace.name}</Text>
                <View style={styles.popupRatingRow}>
                  <Feather name="star" size={12} color="#D4654A" style={{ marginRight: 4 }} />
                  <Text style={styles.popupRatingText}>
                    {selectedPlace.rating} · {selectedPlace.duration}m · {selectedPlace.cost === 0 ? 'Free' : `₹${selectedPlace.cost}`}
                  </Text>
                </View>
                <Text style={styles.popupDesc} numberOfLines={2}>
                  {selectedPlace.description}
                </Text>

                <Pressable
                  style={[
                    styles.popupActionButton,
                    selectedPlace.inPlan ? styles.popupRemoveBtn : styles.popupAddBtn,
                  ]}
                  onPress={() => togglePlaceInPlan(selectedPlace.id)}
                >
                  <Feather
                    name={selectedPlace.inPlan ? 'trash-2' : 'plus'}
                    size={14}
                    color={selectedPlace.inPlan ? '#8A7E74' : '#FFFFFF'}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.popupActionText,
                      selectedPlace.inPlan ? styles.popupRemoveText : styles.popupAddText,
                    ]}
                  >
                    {selectedPlace.inPlan ? 'Remove' : 'Add to itinerary'}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* BOTTOM: Horizontal Navbar (Takes 1/4 screen height) */}
        <View style={[styles.bottomBar, { height: BOTTOM_BAR_HEIGHT }]}>
          {/* Header Row: City details + Stats + Day Selection */}
          <View style={styles.barHeader}>
            <View style={styles.barHeaderLeft}>
              <Text style={styles.barCityTitle}>{cityPlan.cityName}</Text>
              <Text style={styles.barCitySubtitle}>{cityPlan.citySubtitle}</Text>
            </View>

            {/* Total Tour Stats */}
            <View style={styles.barStats}>
              <View style={styles.barStatItem}>
                <Text style={styles.barStatVal}>{cityPlan.totalDays}d</Text>
                <Text style={styles.barStatLbl}>DAYS</Text>
              </View>
              <View style={styles.barStatDivider} />
              <View style={styles.barStatItem}>
                <Text style={styles.barStatVal}>{totalStats.timeStr}</Text>
                <Text style={styles.barStatLbl}>TIME</Text>
              </View>
              <View style={styles.barStatDivider} />
              <View style={styles.barStatItem}>
                <Text style={styles.barStatVal}>₹{totalStats.cost.toLocaleString('en-IN')}</Text>
                <Text style={styles.barStatLbl}>BUDGET</Text>
              </View>
            </View>

            {/* Day Selector Pills */}
            <View style={styles.dayTabs}>
              {Array.from({ length: cityPlan.totalDays }).map((_, index) => {
                const dayNum = index + 1;
                const isActive = activeDay === dayNum;
                return (
                  <Pressable
                    key={`day-tab-${dayNum}`}
                    style={[styles.dayTab, isActive && styles.dayTabActive]}
                    onPress={() => setActiveDay(dayNum)}
                  >
                    <Text style={[styles.dayTabText, isActive && styles.dayTabTextActive]}>
                      DAY {dayNum}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Day Summary */}
            <View style={styles.daySummaryBox}>
              <Text style={styles.daySummaryText}>
                Day {activeDay} · {currentDayStats.stops} stops · ₹{currentDayStats.cost.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* Horizontal scroll list of stops and travel times */}
          <ScrollView
            horizontal
            style={styles.stopsHorizontalScroll}
            contentContainerStyle={styles.stopsHorizontalContent}
            showsHorizontalScrollIndicator={false}
          >
            {activeDayPlaces.length === 0 ? (
              <View style={styles.emptyStops}>
                <Feather name="map" size={24} color="#B8AFA8" style={{ marginRight: 8 }} />
                <Text style={styles.emptyText}>No stops added for Day {activeDay}.</Text>
                <Text style={styles.emptySubText}>Tap pins on the map to add destinations.</Text>
              </View>
            ) : (
              activeDayPlaces.map((place, idx) => {
                const isLast = idx === activeDayPlaces.length - 1;
                const isSelected = selectedPlace?.id === place.id;

                return (
                  <React.Fragment key={place.id}>
                    {/* Stop Card */}
                    <Pressable
                      style={[
                        styles.stopCard,
                        isSelected && styles.stopCardSelected,
                      ]}
                      onPress={() => setSelectedPlace(place)}
                    >
                      {/* Top Row: Stop Badge + Name + Close */}
                      <View style={styles.stopCardHeader}>
                        <View style={styles.stopBadge}>
                          <Text style={styles.stopNumber}>{place.order}</Text>
                        </View>
                        <View style={styles.stopTitleCol}>
                          <Text style={styles.stopName} numberOfLines={1}>
                            {place.name}
                          </Text>
                          <Text style={styles.stopMeta}>
                            ★ {place.rating} · {place.duration}m · {place.cost === 0 ? 'Free' : `₹${place.cost}`}
                          </Text>
                        </View>
                        <Pressable
                          style={styles.removeStopBtn}
                          onPress={(e) => {
                            e.stopPropagation();
                            togglePlaceInPlan(place.id);
                          }}
                        >
                          <Feather name="x" size={14} color="#8A7E74" />
                        </Pressable>
                      </View>

                      {/* Bottom Eats suggestions inside card */}
                      {place.type === 'attraction' && place.nearbyEats && place.nearbyEats[0] ? (
                        (() => {
                          const eat = place.nearbyEats[0];
                          const added = isEatAdded(eat.name);
                          return (
                            <View style={styles.eatCard}>
                              <View style={styles.eatInfoRow}>
                                <Feather name="coffee" size={10} color="#8C6239" style={{ marginRight: 4 }} />
                                <Text style={styles.eatTitle} numberOfLines={1}>
                                  Near: {eat.name}
                                </Text>
                              </View>
                              <View style={styles.eatSubRow}>
                                <View style={styles.eatDetailsCol}>
                                  <Text style={styles.eatMeta}>
                                    ★ {eat.rating} · {eat.distance} · ₹{eat.cost}
                                  </Text>
                                  <Text style={styles.eatAiText} numberOfLines={2}>
                                    {eat.aiSuggestion}
                                  </Text>
                                </View>
                                <Pressable
                                  style={[styles.eatAddBtn, added && styles.eatAddedBtn]}
                                  onPress={() => !added && addNearbyEatToPlan(place, eat)}
                                  disabled={added}
                                >
                                  <Text style={[styles.eatAddBtnText, added && styles.eatAddedBtnText]}>
                                    {added ? 'Added' : 'Add'}
                                  </Text>
                                </Pressable>
                              </View>
                            </View>
                          );
                        })()
                      ) : (
                        <View style={styles.noEatsPlaceholder}>
                          <Text style={styles.noEatsText} numberOfLines={2}>
                            {place.type === 'restaurant'
                              ? 'Selected local restaurant stop'
                              : place.type === 'market'
                                ? 'Selected shopping market stop'
                                : 'No nearby suggestions available'}
                          </Text>
                        </View>
                      )}
                    </Pressable>

                    {/* Horizontal connector line with travel time */}
                    {!isLast && place.travelTimeToNext > 0 && (
                      <View style={styles.travelConnection}>
                        <View style={styles.travelLine} />
                        <View style={styles.travelPill}>
                          <Feather name="clock" size={9} color="#8A7E74" style={{ marginRight: 3 }} />
                          <Text style={styles.travelText}>{place.travelTimeToNext}m</Text>
                        </View>
                        <View style={styles.travelLine} />
                      </View>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF6EE',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDF6EE',
    padding: 24,
  },
  errorText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: '#2C2420',
    marginBottom: 16,
  },
  errorButton: {
    backgroundColor: '#D4654A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  errorButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },

  // ─── Map Wrapper & overlays ────────────────────────
  mapContainer: {
    width: '100%',
    position: 'relative',
  },
  floatingBackButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 8px rgba(44, 36, 32, 0.15)',
    elevation: 4,
  },
  legendCard: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(44, 36, 32, 0.06)',
    boxShadow: '0px 2px 8px rgba(44, 36, 32, 0.08)',
    elevation: 3,
    zIndex: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#2C2420',
  },

  // Popup detail card
  detailPopupCard: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(44, 36, 32, 0.08)',
    boxShadow: '0px 4px 16px rgba(44, 36, 32, 0.12)',
    elevation: 8,
    zIndex: 20,
  },
  popupImageContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  popupImage: {
    width: '100%',
    height: '100%',
  },
  popupBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  popupBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8.5,
    color: '#2C2420',
    letterSpacing: 0.5,
  },
  popupCloseBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(44, 36, 32, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupInfo: {
    padding: 12,
  },
  popupName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 16,
    color: '#2C2420',
    marginBottom: 2,
  },
  popupRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  popupRatingText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#8A7E74',
  },
  popupDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8A7E74',
    lineHeight: 15,
    marginBottom: 12,
  },
  popupActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 999,
    width: '100%',
  },
  popupAddBtn: {
    backgroundColor: '#D4654A',
  },
  popupRemoveBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
  },
  popupActionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  popupAddText: {
    color: '#FFFFFF',
  },
  popupRemoveText: {
    color: '#8A7E74',
  },

  // ─── Bottom Horizontal Navbar ────────────────────────
  bottomBar: {
    width: '100%',
    backgroundColor: '#FDF6EE',
    borderTopWidth: 1,
    borderTopColor: '#EFE7DC',
    paddingVertical: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  barHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 10,
  },
  barHeaderLeft: {
    marginRight: 12,
  },
  barCityTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: '#2C2420',
  },
  barCitySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8A7E74',
  },

  // Header stats
  barStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 10,
  },
  barStatItem: {
    alignItems: 'center',
  },
  barStatVal: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 11.5,
    color: '#2C2420',
  },
  barStatLbl: {
    fontFamily: 'Inter_500Medium',
    fontSize: 7.5,
    color: '#8A7E74',
    letterSpacing: 0.5,
  },
  barStatDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(44,36,32,0.08)',
  },

  // Day Tabs
  dayTabs: {
    flexDirection: 'row',
    gap: 4,
  },
  dayTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#EFE7DC',
    backgroundColor: '#FFFFFF',
  },
  dayTabActive: {
    backgroundColor: '#D4654A',
    borderColor: '#D4654A',
  },
  dayTabText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: '#8A7E74',
    letterSpacing: 0.5,
  },
  dayTabTextActive: {
    color: '#FFFFFF',
  },
  daySummaryBox: {
    justifyContent: 'center',
  },
  daySummaryText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10.5,
    color: '#D4654A',
  },

  // Stops timeline horizontal scroll
  stopsHorizontalScroll: {
    flex: 1,
  },
  stopsHorizontalContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    paddingBottom: 4,
  },
  emptyStops: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 14,
    color: '#2C2420',
  },
  emptySubText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8A7E74',
    marginLeft: 8,
  },

  // Stop card item
  stopCard: {
    width: 310,
    height: 155,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    borderRadius: 12,
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0px 2px 6px rgba(44, 36, 32, 0.03)',
    elevation: 1.5,
  },
  stopCardSelected: {
    borderColor: '#D4654A',
    borderWidth: 1.5,
    backgroundColor: '#FFFDFB',
  },
  stopCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D4654A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  stopNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9.5,
    color: '#FFFFFF',
  },
  stopTitleCol: {
    flex: 1,
    paddingRight: 8,
  },
  stopName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 13,
    color: '#2C2420',
  },
  stopMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#8A7E74',
  },
  removeStopBtn: {
    padding: 2,
  },

  // Eat Suggestion card
  eatCard: {
    backgroundColor: '#FFF9F2',
    borderWidth: 1,
    borderColor: '#F5E6D3',
    borderRadius: 8,
    padding: 6,
    marginTop: 6,
  },
  eatInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  eatTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10.5,
    color: '#8C6239',
  },
  eatSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eatDetailsCol: {
    flex: 1,
    paddingRight: 6,
  },
  eatMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    color: '#8A7E74',
    marginBottom: 2,
  },
  eatAiText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9.5,
    color: '#8A7E74',
    lineHeight: 12.5,
    fontStyle: 'italic',
  },
  eatAddBtn: {
    backgroundColor: '#D4654A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  eatAddedBtn: {
    backgroundColor: '#EFE7DC',
  },
  eatAddBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  eatAddedBtnText: {
    color: '#8A7E74',
  },

  // Placeholders when there are no suggestions (e.g. for restaurants themselves)
  noEatsPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#B8AFA8',
    borderRadius: 8,
    marginTop: 6,
    padding: 8,
    opacity: 0.6,
  },
  noEatsText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9.5,
    color: '#8A7E74',
    textAlign: 'center',
  },

  // Travel Connector block
  travelConnection: {
    width: 65,
    height: 155,
    alignItems: 'center',
    justifyContent: 'center',
  },
  travelLine: {
    flex: 1,
    width: 1,
    borderStyle: 'dashed',
    borderWidth: 0.8,
    borderColor: '#B8AFA8',
    opacity: 0.4,
  },
  travelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginVertical: 4,
  },
  travelText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 8.5,
    color: '#8A7E74',
  },
});
