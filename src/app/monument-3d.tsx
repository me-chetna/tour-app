import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  useWindowDimensions,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import BottomNavBar from '@/components/BottomNavBar';
import {
  MONUMENTS_3D,
  project3DTo2D,
  type Monument3DData,
  type Hotspot,
} from '@/lib/monument3D.functions';

export default function Monument3DExplorerScreen() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const isWide = SCREEN_WIDTH > 768;

  // Selected Monument
  const [monumentId, setMonumentId] = useState<string>('taj-mahal');
  const monument = useMemo(() => MONUMENTS_3D[monumentId], [monumentId]);

  // Rotation angles (Pitch & Yaw)
  const [yaw, setYaw] = useState<number>(0.8);
  const [pitch, setPitch] = useState<number>(-0.3);

  // Active Hotspot & Tab
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(monument.hotspots[0] || null);
  const [activeTab, setActiveTab] = useState<'history' | 'culture' | 'cuisine' | 'dance'>('history');

  // Trigger to redraw canvas
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 340, height: 320 });
  const [trigger, setTrigger] = useState(0);

  // Speech engine state
  const [speakingSection, setSpeakingSection] = useState<string | null>(null);

  // Refs for tracking mouse/touch drag
  const canvasRef = useRef<any>(null);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);

  // Reset active hotspot when monument changes
  useEffect(() => {
    setActiveHotspot(monument.hotspots[0] || null);
    stopSpeaking();
  }, [monumentId]);

  // Populate canvas dimensions on mount/resize
  useEffect(() => {
    if (Platform.OS === 'web' && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setCanvasDimensions({
        width: rect.width || 340,
        height: rect.height || 320,
      });
      canvasRef.current.width = rect.width || 340;
      canvasRef.current.height = rect.height || 320;
      setTrigger(t => t + 1);
    }
  }, [SCREEN_WIDTH]);

  // Redraw 3D Wireframe on Yaw/Pitch/Monument changes
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set wireframe colors and widths
    ctx.strokeStyle = '#D4654A'; // coral
    ctx.lineWidth = 1.4;

    // Draw ground shadow circle
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height / 2 + 50, 90, 25, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(212, 101, 74, 0.15)';
    ctx.stroke();

    ctx.strokeStyle = '#D4654A';

    // Project all vertices
    const projected = monument.vertices.map(v =>
      project3DTo2D(v, pitch, yaw, canvas.width, canvas.height)
    );

    // Draw all lines (edges)
    monument.edges.forEach(edge => {
      const p1 = projected[edge.v1];
      const p2 = projected[edge.v2];
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    });
  }, [yaw, pitch, monument, trigger]);

  // ----------------------------------------------------
  // ROTATION TOUCH HANDLERS
  // ----------------------------------------------------

  const handleTouchStart = (e: any) => {
    const pageX = e.nativeEvent.pageX || e.nativeEvent.touches?.[0]?.pageX;
    const pageY = e.nativeEvent.pageY || e.nativeEvent.touches?.[0]?.pageY;
    if (pageX !== undefined && pageY !== undefined) {
      lastTouchRef.current = { x: pageX, y: pageY };
    }
  };

  const handleTouchMove = (e: any) => {
    const pageX = e.nativeEvent.pageX || e.nativeEvent.touches?.[0]?.pageX;
    const pageY = e.nativeEvent.pageY || e.nativeEvent.touches?.[0]?.pageY;

    if (pageX !== undefined && pageY !== undefined && lastTouchRef.current) {
      const dx = pageX - lastTouchRef.current.x;
      const dy = pageY - lastTouchRef.current.y;

      setYaw(y => y + dx * 0.007);
      // Clamp pitch to prevent flipping
      setPitch(p => Math.max(-1.1, Math.min(1.1, p + dy * 0.007)));

      lastTouchRef.current = { x: pageX, y: pageY };
    }
  };

  const handleTouchEnd = () => {
    lastTouchRef.current = null;
  };

  // ----------------------------------------------------
  // TEXT-TO-SPEECH (TTS) AUDIO GUIDE
  // ----------------------------------------------------

  const stopSpeaking = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } else {
      Speech.stop();
    }
    setSpeakingSection(null);
  };

  // Search available system voices for English female names
  const findFemaleVoice = async (): Promise<any> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          const voices = window.speechSynthesis.getVoices();
          const femaleKeywords = ['female', 'samantha', 'zira', 'karen', 'tessa', 'moira', 'google us english', 'hazel', 'victoria'];
          const match = voices.find(v =>
            v.lang.startsWith('en') &&
            femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))
          );
          return match || voices.find(v => v.lang.startsWith('en')) || null;
        }
      } else {
        const voices = await Speech.getAvailableVoicesAsync();
        const femaleKeywords = ['female', 'samantha', 'zira', 'karen', 'tessa', 'moira', 'victoria', 'hazel', 'en-us-x-sfg', 'en-us-x-tpf'];
        const match = voices.find(v =>
          v.language.startsWith('en') &&
          (
            (v.name && femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))) ||
            (v.quality && v.quality.toString().includes('female'))
          )
        );
        return match || voices.find(v => v.language.startsWith('en')) || null;
      }
    } catch (e) {
      console.warn('Speech engine voice fetch failed:', e);
    }
    return null;
  };

  const speakGuide = async (sectionKey: string, text: string) => {
    if (speakingSection === sectionKey) {
      stopSpeaking();
      return;
    }

    stopSpeaking();
    setSpeakingSection(sectionKey);

    // Filter markdown and dots
    const cleanedText = text
      .replace(/[#*`_~]/g, '')
      .replace(/•/g, ', ')
      .trim();

    try {
      const voiceObj = await findFemaleVoice();

      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(cleanedText);
          if (voiceObj) utterance.voice = voiceObj as SpeechSynthesisVoice;
          utterance.onend = () => setSpeakingSection(null);
          utterance.onerror = () => setSpeakingSection(null);
          window.speechSynthesis.speak(utterance);
        }
      } else {
        Speech.speak(cleanedText, {
          voice: (voiceObj as any)?.identifier,
          onDone: () => setSpeakingSection(null),
          onStopped: () => setSpeakingSection(null),
          onError: () => setSpeakingSection(null),
        });
      }
    } catch (err) {
      console.error('TTS playback failure:', err);
      setSpeakingSection(null);
    }
  };

  // ----------------------------------------------------
  // CALCULATE HOTSPOT SCREEN PLACEMENTS
  // ----------------------------------------------------

  const projectedHotspots = useMemo(() => {
    return monument.hotspots.map(h => {
      const proj = project3DTo2D(
        h.coords,
        pitch,
        yaw,
        canvasDimensions.width,
        canvasDimensions.height
      );
      return {
        hotspot: h,
        projX: proj.x,
        projY: proj.y,
        projZ: proj.z, // depth reference
      };
    });
  }, [monument, pitch, yaw, canvasDimensions]);

  // Active Tab content
  const activeTabContent = useMemo(() => {
    if (!activeHotspot) return null;
    switch (activeTab) {
      case 'history':
        return {
          title: "History & Past Origins",
          icon: "book-open",
          details: activeHotspot.history,
          subheading: "Historical Context",
          subDetails: activeHotspot.past
        };
      case 'culture':
        return {
          title: "Culture & Traditional Dress",
          icon: "user",
          details: activeHotspot.culture,
          subheading: "Traditional Attire",
          subDetails: activeHotspot.dress
        };
      case 'cuisine':
        return {
          title: "Cuisine & Traditional Food",
          icon: "coffee",
          details: activeHotspot.cuisine,
          subheading: "Signature Dishes",
          subDetails: activeHotspot.traditional_food
        };
      case 'dance':
        return {
          title: "Dance Style & Folk Art",
          icon: "activity",
          details: activeHotspot.dance,
          subheading: "Artistic Heritage",
          subDetails: activeHotspot.dance
        };
    }
  }, [activeHotspot, activeTab]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDF6EE" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View>
            <View style={styles.badgeRow}>
              <View style={styles.outlineBadge}>
                <Feather name="box" size={11} color="#D4654A" style={{ marginRight: 5 }} />
                <Text style={styles.badgeText}>3D Monument Explorer</Text>
              </View>
            </View>
            <Text style={styles.heading}>Interactive 3D Heritage</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Drag or swipe to rotate the monument in 3D. Click the glowing hotspots to discover history, traditional dress, local food, and dance styles with our female AI voice guide.
        </Text>

        {/* MONUMENT SELECTOR TABS */}
        <View style={styles.monumentTabs}>
          {Object.values(MONUMENTS_3D).map(m => (
            <Pressable
              key={m.id}
              style={[styles.monumentTab, monumentId === m.id && styles.monumentTabActive]}
              onPress={() => setMonumentId(m.id)}
            >
              <Text
                style={[
                  styles.monumentTabText,
                  monumentId === m.id && styles.monumentTabTextActive,
                ]}
              >
                {m.name.split(' (')[0]}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.cardGrid, isWide && styles.cardGridWide]}>
          {/* LEFT: 3D VIEWPORT */}
          <View style={[styles.card, styles.leftCard]}>
            <Text style={styles.cardHeaderTitle}>3D WIREFRAME MESH</Text>
            <Text style={styles.dragTooltip}>↔ Drag mouse or swipe finger to rotate 3D model</Text>

            <View 
              style={styles.viewportContainer}
              onStartShouldSetResponder={() => true}
              onResponderGrant={handleTouchStart}
              onResponderMove={handleTouchMove}
              onResponderRelease={handleTouchEnd}
            >
              {Platform.OS === 'web' ? (
                <canvas
                  ref={canvasRef}
                  style={styles.webCanvas}
                  onMouseDown={handleTouchStart}
                  onMouseMove={handleTouchMove}
                  onMouseUp={handleTouchEnd}
                  onMouseLeave={handleTouchEnd}
                />
              ) : (
                <View style={styles.nativeFallbackContainer}>
                  <Feather name="package" size={48} color="#D4CFC8" style={{ marginBottom: 12 }} />
                  <Text style={styles.nativeFallbackText}>Webcam & WebGL Canvas Viewer</Text>
                </View>
              )}

              {/* PROJECTED GLOWING HOTSPOTS */}
              {projectedHotspots.map(({ hotspot, projX, projY, projZ }) => {
                // If projected point falls inside container boundaries
                if (projX < 0 || projX > canvasDimensions.width || projY < 0 || projY > canvasDimensions.height) {
                  return null;
                }
                const isSelected = activeHotspot?.id === hotspot.id;
                // Fade out hotspots that are on the back side of the model (z < 0)
                const isBehind = projZ < 0;

                return (
                  <Pressable
                    key={hotspot.id}
                    style={[
                      styles.hotspotNode,
                      {
                        left: projX - 16,
                        top: projY - 16,
                        opacity: isBehind ? 0.35 : 1,
                        transform: [{ scale: isSelected ? 1.15 : 1.0 }],
                      },
                      isSelected && styles.hotspotNodeSelected,
                    ]}
                    onPress={() => setActiveHotspot(hotspot)}
                  >
                    <View style={[styles.hotspotPulse, isSelected && styles.hotspotPulseSelected]} />
                    <Feather
                      name={
                        hotspot.id === 'dome' || hotspot.id === 'facade' || hotspot.id === 'base'
                          ? 'info'
                          : 'map-pin'
                      }
                      size={10}
                      color="#FFFFFF"
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* RIGHT: CULTURAL GUIDE DETAILS */}
          <View style={[styles.card, styles.rightCard]}>
            {activeHotspot ? (
              <View style={styles.guideContainer}>
                <View style={styles.guideHeader}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.guideLabel}>ACTIVE HOTSPOT</Text>
                    <Text style={styles.guideTitle}>{activeHotspot.name}</Text>
                  </View>
                  <Pressable 
                    style={[styles.audioGuideBtn, speakingSection === 'all' && styles.audioGuideBtnActive]}
                    onPress={() => speakGuide('all', `${activeHotspot.name}. ${activeTabContent?.title}: ${activeTabContent?.details}. ${activeTabContent?.subheading}: ${activeTabContent?.subDetails}`)}
                  >
                    <Feather 
                      name={speakingSection === 'all' ? "volume-2" : "volume"} 
                      size={14} 
                      color={speakingSection === 'all' ? "#FFFFFF" : "#D4654A"} 
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.audioGuideText, speakingSection === 'all' && styles.audioGuideTextActive]}>
                      {speakingSection === 'all' ? 'Speaking...' : 'Listen Guide'}
                    </Text>
                  </Pressable>
                </View>

                {/* INFORMATION CATEGORY TABS */}
                <View style={styles.categoryTabs}>
                  <Pressable
                    style={[styles.categoryTab, activeTab === 'history' && styles.categoryTabActive]}
                    onPress={() => {
                      setActiveTab('history');
                      stopSpeaking();
                    }}
                  >
                    <Feather name="book-open" size={12} color={activeTab === 'history' ? '#FFFFFF' : '#8A7E74'} style={{ marginRight: 4 }} />
                    <Text style={[styles.categoryTabText, activeTab === 'history' && styles.categoryTabTextActive]}>History</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.categoryTab, activeTab === 'culture' && styles.categoryTabActive]}
                    onPress={() => {
                      setActiveTab('culture');
                      stopSpeaking();
                    }}
                  >
                    <Feather name="user" size={12} color={activeTab === 'culture' ? '#FFFFFF' : '#8A7E74'} style={{ marginRight: 4 }} />
                    <Text style={[styles.categoryTabText, activeTab === 'culture' && styles.categoryTabTextActive]}>Culture & Dress</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.categoryTab, activeTab === 'cuisine' && styles.categoryTabActive]}
                    onPress={() => {
                      setActiveTab('cuisine');
                      stopSpeaking();
                    }}
                  >
                    <Feather name="coffee" size={12} color={activeTab === 'cuisine' ? '#FFFFFF' : '#8A7E74'} style={{ marginRight: 4 }} />
                    <Text style={[styles.categoryTabText, activeTab === 'cuisine' && styles.categoryTabTextActive]}>Food</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.categoryTab, activeTab === 'dance' && styles.categoryTabActive]}
                    onPress={() => {
                      setActiveTab('dance');
                      stopSpeaking();
                    }}
                  >
                    <Feather name="activity" size={12} color={activeTab === 'dance' ? '#FFFFFF' : '#8A7E74'} style={{ marginRight: 4 }} />
                    <Text style={[styles.categoryTabText, activeTab === 'dance' && styles.categoryTabTextActive]}>Dance & Art</Text>
                  </Pressable>
                </View>

                {/* TAB DESCRIPTION BLOCKS */}
                {activeTabContent && (
                  <View style={styles.tabContentContainer}>
                    {/* Primary category details */}
                    <View style={styles.detailsBlock}>
                      <View style={styles.blockHeader}>
                        <Text style={styles.blockTitle}>{activeTabContent.title}</Text>
                        <Pressable 
                          style={styles.smallSpeakBtn}
                          onPress={() => speakGuide('details', activeTabContent.details)}
                        >
                          <Feather 
                            name={speakingSection === 'details' ? "volume-2" : "volume-x"} 
                            size={12} 
                            color={speakingSection === 'details' ? '#D4654A' : '#8A7E74'} 
                          />
                        </Pressable>
                      </View>
                      <Text style={styles.blockText}>{activeTabContent.details}</Text>
                    </View>

                    {/* Secondary category details */}
                    <View style={styles.detailsBlock}>
                      <View style={styles.blockHeader}>
                        <Text style={styles.blockTitle}>{activeTabContent.subheading}</Text>
                        <Pressable 
                          style={styles.smallSpeakBtn}
                          onPress={() => speakGuide('subDetails', activeTabContent.subDetails)}
                        >
                          <Feather 
                            name={speakingSection === 'subDetails' ? "volume-2" : "volume-x"} 
                            size={12} 
                            color={speakingSection === 'subDetails' ? '#D4654A' : '#8A7E74'} 
                          />
                        </Pressable>
                      </View>
                      <Text style={styles.blockText}>{activeTabContent.subDetails}</Text>
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <Feather name="box" size={40} color="#D4CFC8" style={{ marginBottom: 14 }} />
                <Text style={styles.placeholderText}>
                  Please select one of the glowing hotspots on the 3D model viewport to explore cultural facets.
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 160 }} />
      </ScrollView>

      <BottomNavBar />
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 160,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  outlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4654A',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: 'rgba(212, 101, 74, 0.05)',
  },
  badgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#D4654A',
    letterSpacing: 0.5,
  },
  heading: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
    color: '#2C2420',
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    color: '#8A7E74',
    lineHeight: 20,
    marginBottom: 20,
  },
  monumentTabs: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  monumentTab: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  monumentTabActive: {
    backgroundColor: '#D4654A',
    borderColor: '#D4654A',
  },
  monumentTabText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12.5,
    color: '#8A7E74',
  },
  monumentTabTextActive: {
    color: '#FFFFFF',
  },
  cardGrid: {
    flexDirection: 'column',
    gap: 20,
  },
  cardGridWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F5E6D3',
    borderRadius: 20,
    padding: 20,
    flex: 1,
  },
  leftCard: {
    maxWidth: '100%',
  },
  rightCard: {
    flex: 1.25,
  },
  cardHeaderTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9.5,
    color: '#B8AFA8',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  dragTooltip: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    color: '#8A7E74',
    marginBottom: 16,
  },
  viewportContainer: {
    height: 320,
    backgroundColor: '#2C2420',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webCanvas: {
    width: '100%',
    height: '100%',
    cursor: 'grab',
  },
  nativeFallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDF6EE',
  },
  nativeFallbackText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12.5,
    color: '#8A7E74',
  },
  hotspotNode: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 101, 74, 0.85)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4654A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  hotspotNodeSelected: {
    backgroundColor: '#E67E22',
    borderColor: '#FFFFFF',
    shadowColor: '#E67E22',
    shadowRadius: 12,
  },
  hotspotPulse: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 101, 74, 0.4)',
    transform: [{ scale: 1.4 }],
  },
  hotspotPulseSelected: {
    borderColor: 'rgba(230, 126, 34, 0.6)',
  },
  guideContainer: {
    width: '100%',
  },
  guideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  guideLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9.5,
    color: '#D4654A',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  guideTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    color: '#2C2420',
  },
  audioGuideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 101, 74, 0.08)',
    borderWidth: 1,
    borderColor: '#FFD1C9',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  audioGuideBtnActive: {
    backgroundColor: '#D4654A',
    borderColor: '#D4654A',
  },
  audioGuideText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11.5,
    color: '#D4654A',
  },
  audioGuideTextActive: {
    color: '#FFFFFF',
  },
  categoryTabs: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(44, 36, 32, 0.05)',
    paddingBottom: 12,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  categoryTabActive: {
    backgroundColor: '#D4654A',
    borderColor: '#D4654A',
  },
  categoryTabText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11.5,
    color: '#8A7E74',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
  },
  tabContentContainer: {
    width: '100%',
    gap: 16,
  },
  detailsBlock: {
    backgroundColor: '#FDF6EE',
    borderWidth: 1,
    borderColor: '#F5E6D3',
    borderRadius: 14,
    padding: 14,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  blockTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#2C2420',
  },
  smallSpeakBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    color: '#5C4E46',
    lineHeight: 18,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  placeholderText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#8A7E74',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  }
});
