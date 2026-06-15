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
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import BottomNavBar from '@/components/BottomNavBar';
import {
  scanFoodItem,
  searchFoodItem,
  type FoodScanResult,
  type FoodAlternative,
} from '@/lib/food.functions';

// Preset helpers for common packaged foods
const FOOD_PRESET_SUGGESTIONS = [
  'Lays Chips',
  'Coke',
  'Oreo',
  'Maggi Noodles',
  'KitKat',
  'Kurkure'
];

// Web-specific styling
const webStyles = {
  webcamVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  webApiKeyInput: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: '1px solid #EFE7DC',
    backgroundColor: '#FDF6EE',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    boxSizing: 'border-box' as const,
    outline: 'none',
  },
  webSearchInput: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: '1px solid #EFE7DC',
    backgroundColor: '#FFFFFF',
    fontSize: 12.5,
    fontFamily: 'Inter_400Regular',
    boxSizing: 'border-box' as const,
    outline: 'none',
  }
};

export default function FoodScannerScreen() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const isWide = SCREEN_WIDTH > 768;

  const videoRef = useRef<any>(null);
  const streamRef = useRef<any>(null);

  const [streaming, setStreaming] = useState(false);
  const [busy, setBusy] = useState<'idle' | 'identifying' | 'loading'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<any>(null);
  
  const [identifiedResult, setIdentifiedResult] = useState<FoodScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState('');

  // Custom API Key states (shares the key in localStorage with the timeline screen)
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [directSearchText, setDirectSearchText] = useState('');

  // Load API key from local storage on mount
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('WANDER_INDIA_GEMINI_KEY') || '';
      setApiKey(stored);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem('WANDER_INDIA_GEMINI_KEY', key);
    }
    setShowSettings(false);
  };

  // Initialize camera stream
  useEffect(() => {
    if (Platform.OS === 'web' && !snapshot) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('Webcam stream not supported on this origin');
        setStreaming(false);
        return;
      }

      navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
            setStreaming(true);
          }
        })
        .catch((err) => {
          console.warn('Webcam stream not available:', err);
          setStreaming(false);
        });
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: any) => track.stop());
      }
    };
  }, [snapshot]);

  // Capture frame to Data URL
  const captureDataUrl = (): string | null => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return null;
    const canvas = document.createElement('canvas');
    const maxW = 800; // Keep file size under 1MB
    const scale = Math.min(1, maxW / v.videoWidth);
    canvas.width = v.videoWidth * scale;
    canvas.height = v.videoHeight * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  // Start animated visual scan progress bar
  const startScanningAnimation = (fileName: string | undefined, dataUrl: any) => {
    setIsScanning(true);
    setScanProgress(0);
    setScanMessage('Accessing neural vision models...');
    setSnapshot(dataUrl);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setScanProgress(progress);

      if (progress === 20) setScanMessage('Detecting packaging boundaries...');
      if (progress === 40) setScanMessage('Extracting branding & text overlays...');
      if (progress === 60) setScanMessage('Analyzing macronutrient composition...');
      if (progress === 80) setScanMessage('Calculating dehydration & sugar indices...');
      if (progress === 90) setScanMessage('Retrieving healthy travel alternatives...');
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        runIdentify(dataUrl, fileName);
      }
    }, 100);
  };

  // Run AI packaged food identification and alternatives matching
  const runIdentify = async (dataUrl: any, fileName?: string) => {
    setError(null);
    setSnapshot(dataUrl);
    setIdentifiedResult(null);
    setBusy('identifying');

    // Stop webcam stream during review
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: any) => track.stop());
      setStreaming(false);
    }

    try {
      const hint = fileName || undefined;
      const activeKey = apiKey || undefined;

      let res: FoodScanResult;
      if (typeof dataUrl === 'string') {
        res = await scanFoodItem({ imageDataUrl: dataUrl, hint, apiKey: activeKey });
      } else {
        // Simulating offline scan of Lays chips via fallback local asset
        res = {
          identifiedFood: "Lay's Potato Chips",
          brand: "Lay's (PepsiCo)",
          nutritionalSummary: "High in sodium, deep-fried trans fats, and empty calories. Promotes water retention and rapid thirst/dehydration on road trips.",
          alternatives: [
            {
              name: "Roasted Makhana (Foxnuts)",
              whyBetter: "Light, crunchy, low in calories, and roasted in minimal ghee/olive oil instead of deep frying.",
              nutritionBenefit: "Excellent source of protein, fiber, and potassium with zero trans fat.",
              portability: "Extremely lightweight, does not break easily in zip-lock bags, and stays fresh for weeks."
            },
            {
              name: "Roasted Chickpeas (Chana)",
              whyBetter: "Savory, crunchy snack that satisfies chip cravings but releases energy slowly to keep you full.",
              nutritionBenefit: "High plant protein, complex carbohydrates, and iron. Keeps blood sugar stable.",
              portability: "Highly stable, compact packaging, does not melt or crumble."
            },
            {
              name: "Baked Vegetable Straws / Chips",
              whyBetter: "Baked instead of fried, with significantly less oil, salt, and preservatives.",
              nutritionBenefit: "Vitamins A & C, low fat content, and made from real vegetables like spinach, beets, and carrots.",
              portability: "Lightweight bags, easily resealable for long train or car trips."
            }
          ]
        };
      }

      setIdentifiedResult(res);
      setBusy('idle');
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Something went wrong during food scan.');
      setBusy('idle');
    }
  };

  const onCapture = () => {
    const url = captureDataUrl();
    if (!url) {
      // Camera offline / permission denied fallback. Simulate Lay's Potato Chips.
      setError('Camera offline. Simulating scanner capture of Lay\'s Chips...');
      const mockPhoto = require('@/assets/images/lays_chips_fallback.png');
      startScanningAnimation('lays', mockPhoto);
      return;
    }
    startScanningAnimation(undefined, url);
  };

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      startScanningAnimation(file.name, url);
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = () => {
    if (Platform.OS !== 'web') return;
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) onFile(file);
      };
      input.click();
    } catch (err) {
      console.error('Failed to trigger upload:', err);
    }
  };

  const runPresetSearch = async (name: string) => {
    setError(null);
    setSnapshot(null);
    setIdentifiedResult(null);
    setBusy('loading');

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: any) => track.stop());
      setStreaming(false);
    }

    try {
      const res = await searchFoodItem({ name, apiKey: apiKey || undefined });
      setIdentifiedResult(res);

      // Map corresponding snapshot placeholder if possible
      const lower = name.toLowerCase();
      if (lower.includes('lay')) {
        setSnapshot(require('@/assets/images/lays_chips_fallback.png'));
      } else {
        setSnapshot(true); // Draw placeholder snapshot view
      }

      setBusy('idle');
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Failed to search preset alternatives.');
      setBusy('idle');
    }
  };

  const reset = () => {
    setSnapshot(null);
    setIdentifiedResult(null);
    setError(null);
    setBusy('idle');
  };

  // Memoized image rendering to prevent flickers
  const displayImageSource = useMemo(() => {
    if (snapshot === true) {
      return null;
    }
    if (snapshot) {
      return typeof snapshot === 'string' && snapshot.startsWith('data:') ? { uri: snapshot } : snapshot;
    }
    return null;
  }, [snapshot]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDF6EE" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <View style={styles.badgeRow}>
              <View style={styles.outlineBadge}>
                <Feather name="package" size={11} color="#D4654A" style={{ marginRight: 5 }} />
                <Text style={styles.badgeText}>Trip Food Scanner</Text>
              </View>
            </View>
            <Text style={styles.heading}>Healthy Travel Food Swap</Text>
          </View>
          
          {/* Settings API button */}
          <Pressable 
            style={[styles.settingsToggle, showSettings && styles.settingsToggleActive]} 
            onPress={() => setShowSettings(!showSettings)}
          >
            <Feather name="settings" size={18} color={showSettings ? '#FFFFFF' : '#D4654A'} />
          </Pressable>
        </View>

        <Text style={styles.subtitle}>
          Scan your packaged travel snacks. We analyze their nutritional impact during trips and suggest 3 healthy, packable food swaps.
        </Text>

        {/* API Key settings panel */}
        {showSettings && (
          <View style={styles.settingsPanel}>
            <Text style={styles.settingsTitle}>Vision API Settings</Text>
            <Text style={styles.settingsSub}>
              Enter your Google Gemini API Key. This runs the food visual recognition directly in your browser.
            </Text>
            <View style={styles.apiKeyRow}>
              {Platform.OS === 'web' ? (
                <input
                  type="password"
                  placeholder="AIzaSy... (Gemini API Key)"
                  style={webStyles.webApiKeyInput}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              ) : null}
              <Pressable style={styles.saveKeyBtn} onPress={() => handleSaveApiKey(apiKey)}>
                <Text style={styles.saveKeyBtnText}>Save</Text>
              </Pressable>
            </View>
            <Text style={styles.settingsTip}>
              Don't have a key? The app automatically falls back to our local smart parser for common road-trip foods (Lays, Coke, Oreo, Maggi, Kurkure, KitKat).
            </Text>
          </View>
        )}

        <View style={[styles.cardGrid, isWide && styles.cardGridWide]}>
          {/* Left panel: Camera scanner & photo viewer */}
          <View style={[styles.card, styles.leftCard]}>
            <View style={styles.cameraContainer}>
              {!snapshot ? (
                Platform.OS === 'web' ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={webStyles.webcamVideo}
                  />
                ) : (
                  <View style={styles.nativeCameraFallback}>
                    <Feather name="camera" size={32} color="#B8AFA8" style={{ marginBottom: 10 }} />
                    <Text style={styles.nativeFallbackText}>Webcam live stream placeholder</Text>
                  </View>
                )
              ) : (
                displayImageSource ? (
                  <Image
                    source={displayImageSource}
                    style={styles.cameraImage}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.genericProductFallback}>
                    <Feather name="package" size={48} color="#D4CFC8" style={{ marginBottom: 10 }} />
                    <Text style={styles.genericFallbackText}>Scanning packaged item</Text>
                  </View>
                )
              )}

              {/* Blur Loader overlay when scanning or identifying */}
              {(isScanning || busy !== 'idle') && (
                <View style={styles.loaderOverlay}>
                  <View style={styles.loaderPill}>
                    <ActivityIndicator size="small" color="#D4654A" style={{ marginRight: 8 }} />
                    <Text style={styles.loaderPillText}>
                      {isScanning 
                        ? `Scanning: ${scanProgress}%` 
                        : busy === 'identifying'
                        ? 'Analyzing ingredients…'
                        : 'Matching travel food swaps…'}
                    </Text>
                  </View>
                  {isScanning && (
                    <Text style={styles.loaderPillSub}>{scanMessage}</Text>
                  )}
                </View>
              )}
            </View>

            <View style={styles.cameraBtnRow}>
              {!snapshot ? (
                <>
                  <Pressable
                    style={[styles.primaryBtn, busy !== 'idle' && styles.disabledBtn]}
                    onPress={onCapture}
                    disabled={busy !== 'idle'}
                  >
                    <Feather name="camera" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.primaryBtnText}>Scan Product</Text>
                  </Pressable>
                  <Pressable
                    style={styles.outlineBtn}
                    onPress={triggerUpload}
                  >
                    <Feather name="upload" size={14} color="#2C2420" style={{ marginRight: 6 }} />
                    <Text style={styles.outlineBtnText}>Upload Photo</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable
                  style={styles.outlineBtn}
                  onPress={reset}
                >
                  <Feather name="refresh-cw" size={14} color="#2C2420" style={{ marginRight: 6 }} />
                  <Text style={styles.outlineBtnText}>Scan Another</Text>
                </Pressable>
              )}
            </View>

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>

          {/* Right panel: Alternatives history */}
          <View style={[styles.card, styles.rightCard]}>
            {!identifiedResult ? (
              <View style={styles.placeholderBox}>
                <Feather name="shield" size={40} color="#D4CFC8" style={{ marginBottom: 14 }} />
                <Text style={styles.placeholderText}>
                  Scan a packaged item or select a common snack below to reveal healthier travel alternatives.
                </Text>

                {/* Direct Search Bar */}
                <Text style={styles.searchLabel}>SEARCH SNACK ALTERNATIVES</Text>
                <View style={styles.searchContainer}>
                  {Platform.OS === 'web' ? (
                    <input
                      placeholder="Type a snack name (e.g. Soda, Chips, Biscuits)..."
                      style={webStyles.webSearchInput}
                      value={directSearchText}
                      onChange={(e) => setDirectSearchText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') runPresetSearch(directSearchText);
                      }}
                    />
                  ) : null}
                  <Pressable 
                    style={styles.searchSubmitBtn} 
                    onPress={() => runPresetSearch(directSearchText)}
                  >
                    <Feather name="search" size={14} color="#FFFFFF" />
                  </Pressable>
                </View>

                <Text style={styles.presetLabel}>— OR SELECT A COMMON SNACK —</Text>
                <View style={styles.presetsGrid}>
                  {FOOD_PRESET_SUGGESTIONS.map((name) => (
                    <Pressable
                      key={name}
                      style={styles.presetBtn}
                      onPress={() => runPresetSearch(name)}
                    >
                      <Text style={styles.presetBtnText}>{name}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.resultsBox}>
                <View style={styles.resultsHeaderRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.identifiedLabel}>PACKAGED ITEM DETECTED</Text>
                    <Text style={styles.monumentName}>{identifiedResult.identifiedFood}</Text>
                    <Text style={styles.brandName}>Brand: {identifiedResult.brand}</Text>
                  </View>
                  <Pressable style={styles.timelineResetBtn} onPress={reset}>
                    <Text style={styles.timelineResetBtnText}>Reset</Text>
                  </Pressable>
                </View>

                {/* Nutrition warning box */}
                <View style={styles.warningBox}>
                  <Feather name="alert-triangle" size={16} color="#D4654A" style={{ marginRight: 8, marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.warningHeading}>Trip Nutrition Warning</Text>
                    <Text style={styles.warningText}>{identifiedResult.nutritionalSummary}</Text>
                  </View>
                </View>

                <Text style={styles.alternativesHeading}>RECOMMENDED TRIP OPTIONS</Text>

                {/* Alternatives cards */}
                {identifiedResult.alternatives.map((alt: FoodAlternative, i: number) => (
                  <View key={alt.name} style={styles.altCard}>
                    <View style={styles.altCardHeader}>
                      <View style={styles.numberCircle}>
                        <Text style={styles.numberCircleText}>{i + 1}</Text>
                      </View>
                      <Text style={styles.altName}>{alt.name}</Text>
                    </View>
                    
                    <Text style={styles.altDetailsText}>
                      <Text style={styles.altLabel}>Why it's better: </Text>
                      {alt.whyBetter}
                    </Text>
                    
                    <Text style={styles.altDetailsText}>
                      <Text style={styles.altLabel}>Nutrition: </Text>
                      {alt.nutritionBenefit}
                    </Text>

                    <Text style={styles.altDetailsText}>
                      <Text style={styles.altLabel}>Travel Portability: </Text>
                      {alt.portability}
                    </Text>
                  </View>
                ))}
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
    maxWidth: '85%',
  },
  settingsToggle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE7DC',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsToggleActive: {
    backgroundColor: '#D4654A',
    borderColor: '#D4654A',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    color: '#8A7E74',
    lineHeight: 20,
    marginBottom: 20,
  },
  settingsPanel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F5E6D3',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  settingsTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 16,
    color: '#2C2420',
    marginBottom: 4,
  },
  settingsSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    color: '#8A7E74',
    lineHeight: 16,
    marginBottom: 12,
  },
  apiKeyRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  saveKeyBtn: {
    backgroundColor: '#D4654A',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveKeyBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  settingsTip: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    color: '#8A7E74',
    marginTop: 8,
    lineHeight: 14,
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
    flex: 1.2,
  },
  cameraContainer: {
    height: 320,
    backgroundColor: '#2C2420',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFE7DC',
  },
  cameraImage: {
    width: '100%',
    height: '100%',
  },
  genericProductFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDF6EE',
  },
  genericFallbackText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12.5,
    color: '#8A7E74',
  },
  nativeCameraFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2420',
  },
  nativeFallbackText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#8A7E74',
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(44, 36, 32, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  loaderPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12.5,
    color: '#2C2420',
  },
  loaderPillSub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#EFE7DC',
    marginTop: 8,
    textAlign: 'center',
  },
  cameraBtnRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4654A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    flex: 1.2,
    minWidth: 140,
  },
  primaryBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    flex: 1,
    minWidth: 120,
  },
  outlineBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12.5,
    color: '#2C2420',
  },
  disabledBtn: {
    opacity: 0.4,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#D4654A',
    marginTop: 10,
  },
  placeholderBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  placeholderText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#8A7E74',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 280,
  },
  searchLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9.5,
    color: '#B8AFA8',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 6,
    marginBottom: 20,
  },
  searchSubmitBtn: {
    backgroundColor: '#D4654A',
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9.5,
    color: '#B8AFA8',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  presetBtn: {
    backgroundColor: '#FDF6EE',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  presetBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#2C2420',
  },
  resultsBox: {
    width: '100%',
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  identifiedLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9.5,
    color: '#D4654A',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  monumentName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: '#2C2420',
    marginBottom: 2,
  },
  brandName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12.5,
    color: '#8A7E74',
  },
  timelineResetBtn: {
    borderWidth: 1,
    borderColor: '#EFE7DC',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FDF6EE',
  },
  timelineResetBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#8A7E74',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF2F0',
    borderWidth: 1,
    borderColor: '#FFD1C9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  warningHeading: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12.5,
    color: '#D4654A',
    marginBottom: 4,
  },
  warningText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#5C4E46',
    lineHeight: 18,
  },
  alternativesHeading: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9.5,
    color: '#B8AFA8',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  altCard: {
    backgroundColor: '#FDF6EE',
    borderWidth: 1,
    borderColor: '#F5E6D3',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  altCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  numberCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#D4654A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  numberCircleText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  altName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14.5,
    color: '#2C2420',
  },
  altDetailsText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    color: '#5C4E46',
    lineHeight: 18,
    marginBottom: 4,
  },
  altLabel: {
    fontFamily: 'Inter_600SemiBold',
    color: '#2C2420',
  }
});
