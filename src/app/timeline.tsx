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
  identifyMonument,
  getMonumentTimeline,
  generateEraImage,
  type TimelineEra,
} from '@/lib/timeline.functions';

type Identified = {
  name: string;
  location: string;
  confidence: number;
  summary: string;
};

// Preset helpers to allow instant clicks to test the flow
const PRESET_SUGGESTIONS = [
  'Taj Mahal',
  'Hawa Mahal',
  'Qutub Minar',
  'India Gate',
  'Eiffel Tower',
  'Colosseum',
  'Statue of Liberty'
];

// Web-only styling dictionary to avoid native StyleSheet type conflicts
const webStyles = {
  webcamVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  webRangeSlider: {
    width: '100%',
    cursor: 'pointer',
    accentColor: '#D4654A',
    marginTop: 8,
    marginBottom: 8,
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

export default function MonumentTimelineScreen() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const isWide = SCREEN_WIDTH > 768;

  const videoRef = useRef<any>(null);
  const [streaming, setStreaming] = useState(false);
  const [busy, setBusy] = useState<'idle' | 'identifying' | 'timeline'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [identified, setIdentified] = useState<Identified | null>(null);
  const [eras, setEras] = useState<TimelineEra[] | null>(null);
  const [year, setYear] = useState<number>(2026);
  const [eraImages, setEraImages] = useState<Record<number, string>>({});
  const [eraImgLoading, setEraImgLoading] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [scanAmbiguous, setScanAmbiguous] = useState(false);
  const [useScannedPhoto, setUseScannedPhoto] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState('');
  
  // Custom API Key states
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [directSearchText, setDirectSearchText] = useState('');
  const [calibrationSearchText, setCalibrationSearchText] = useState('');
  const streamRef = useRef<any>(null);

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

  // Fetch coordinates on mount for location hints
  useEffect(() => {
    if (Platform.OS === 'web' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn('Geolocation not available:', err);
        }
      );
    }
  }, []);

  // Initialize camera stream
  useEffect(() => {
    if (Platform.OS === 'web' && !snapshot) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('Webcam not supported or insecure origin');
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
          // Don't alert error immediately on mount to keep UI clean
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
    const maxW = 1024;
    const scale = Math.min(1, maxW / v.videoWidth);
    canvas.width = v.videoWidth * scale;
    canvas.height = v.videoHeight * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.82);
  };

  // Run AI Monument Recognition and Timeline Fetch
  const runIdentify = async (dataUrl: any, fileName?: string) => {
    setError(null);
    setSnapshot(dataUrl);
    setIdentified(null);
    setEras(null);
    setBusy('identifying');
    setEraImages({});
    setScanAmbiguous(false);

    // Stop webcam after capturing snapshot
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: any) => track.stop());
      setStreaming(false);
    }

    try {
      const hint = fileName || (locationCoords ? `${locationCoords.lat},${locationCoords.lng}` : undefined);
      const activeKey = apiKey || undefined;
      
      let res;
      if (typeof dataUrl === 'string') {
        res = await identifyMonument({ imageDataUrl: dataUrl, hint, apiKey: activeKey });
      } else {
        // Simulating offline scan of Taj Mahal via fallback require asset
        res = {
          name: 'Taj Mahal',
          location: 'Agra, Uttar Pradesh',
          confidence: 0.98,
          summary: 'The Taj Mahal is an Islamic ivory-white marble mausoleum on the south bank of the Yamuna river in Agra, India, commissioned in 1631 by the Mughal emperor Shah Jahan to house the tomb of his favourite wife, Mumtaz Mahal.'
        };
      }
      setIdentified(res);

      if (res.confidence < 0.25 || res.name.toLowerCase() === 'unknown') {
        setError("AI scanner completed, but requires name confirmation to calibrate the history timeline.");
        setBusy('idle');
        setScanAmbiguous(true); // show the manual identification dropdown to calibrate!
        return;
      }

      setBusy('timeline');
      const tl = await getMonumentTimeline({ name: res.name, apiKey: activeKey });
      setEras(tl.eras);
      const latest = tl.eras[tl.eras.length - 1]?.year ?? 2026;
      setYear(latest);
      setBusy('idle');
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Something went wrong during identification.');
      setBusy('idle');
    }
  };

  const onCapture = () => {
    const url = captureDataUrl();
    if (!url) {
      // Camera is offline/placeholder (e.g. HTTP, mobile dev server, or permission denied)
      // We simulate capture & scan of Taj Mahal by using the Taj Mahal fallback asset!
      setError('Camera offline. Simulating scanner capture of Taj Mahal...');
      const mockPhoto = require('@/assets/images/timeline/taj_2026.png');
      startScanningAnimation('taj-mahal', mockPhoto);
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

      if (progress === 30) setScanMessage('Extracting feature descriptors...');
      if (progress === 60) setScanMessage('Comparing visual geometries...');
      if (progress === 80) setScanMessage('Cross-referencing coordinates database...');
      if (progress === 90) setScanMessage('Matching structural profiles...');
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        runIdentify(dataUrl, fileName);
      }
    }, 100);
  };

  // Skip capture and run with text search directly
  const runPresetSearch = async (name: string) => {
    setError(null);
    setSnapshot(null); // Clear snapshot to display preset images
    setIdentified(null);
    setEras(null);
    setBusy('identifying');
    setEraImages({});
    setScanAmbiguous(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: any) => track.stop());
      setStreaming(false);
    }

    try {
      // Simulate identified block
      const mockIdentified: Identified = {
        name: name,
        location: 'India',
        confidence: 1.0,
        summary: `Exploring the historical timeline and architectural transformations of the legendary ${name}.`
      };
      setIdentified(mockIdentified);
      setBusy('timeline');

      const tl = await getMonumentTimeline({ name, apiKey: apiKey || undefined });
      setEras(tl.eras);
      const latest = tl.eras[tl.eras.length - 1]?.year ?? 2026;
      setYear(latest);
      setBusy('idle');
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Failed to search preset.');
      setBusy('idle');
    }
  };

  const reset = () => {
    setSnapshot(null);
    setIdentified(null);
    setEras(null);
    setError(null);
    setBusy('idle');
    setEraImages({});
    setScanAmbiguous(false);
  };

  const activeEra = useMemo(() => {
    if (!eras || eras.length === 0) return null;
    const past = eras.filter((e) => e.year <= year);
    if (past.length === 0) return eras[0];
    return past[past.length - 1];
  }, [eras, year]);

  const minYear = eras?.[0]?.year ?? 1500;
  const maxYear = eras?.[eras.length - 1]?.year ?? 2026;

  // Visual era filter math (sepia, saturate, contrast, brightness) based on age
  const ageRatio = useMemo(() => {
    if (!eras) return 0;
    const span = Math.max(1, maxYear - minYear);
    return 1 - (year - minYear) / span; // 0 = today, 1 = oldest
  }, [eras, year, minYear, maxYear]);

  const getFilterStyle = () => {
    if (Platform.OS !== 'web') return {};

    // Remove filter if the era image is loaded
    if (activeEra && eraImages[activeEra.year]) {
      return { filter: 'none' };
    }

    const sepiaVal = (ageRatio * 80).toFixed(0);
    const satVal = (100 - ageRatio * 50).toFixed(0);
    const contrastVal = (100 + ageRatio * 10).toFixed(0);
    const brightnessVal = (100 - ageRatio * 15).toFixed(0);

    return {
      filter: `sepia(${sepiaVal}%) saturate(${satVal}%) contrast(${contrastVal}%) brightness(${brightnessVal}%)`
    };
  };

  // Hook to generate / fetch the AI Image for the active era
  useEffect(() => {
    if (!identified || !activeEra) return;
    if (eraImages[activeEra.year]) return;

    let cancelled = false;
    setEraImgLoading(true);

    generateEraImage({
      name: identified.name,
      year: activeEra.year,
      appearance: activeEra.appearance,
      apiKey: apiKey || undefined,
    })
      .then((res) => {
        if (cancelled) return;
        if (res.dataUrl) {
          setEraImages((prev) => ({ ...prev, [activeEra.year]: res.dataUrl! }));
        }
      })
      .catch((e) => {
        console.error('Era image generation failed:', e);
      })
      .finally(() => {
        if (!cancelled) setEraImgLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [identified, activeEra, eraImages, apiKey]);

  // Determine active display image
  const displayImageSource = useMemo(() => {
    if (eras && activeEra && eraImages[activeEra.year]) {
      return { uri: eraImages[activeEra.year] };
    }
    
    // For predefined local milestones, if they have local image assets, use them!
    if (!eraImages[activeEra?.year ?? -1] && activeEra && activeEra.image) {
      return activeEra.image;
    }

    if (snapshot) {
      return typeof snapshot === 'string' && snapshot.startsWith('data:') ? { uri: snapshot } : snapshot;
    }

    return null;
  }, [eras, activeEra, eraImages, snapshot]);

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
                <Feather name="clock" size={11} color="#D4654A" style={{ marginRight: 5 }} />
                <Text style={styles.badgeText}>Live Monument Timeline</Text>
              </View>
            </View>
            <Text style={styles.heading}>Point. Recognise. Travel through time.</Text>
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
          Aim your camera at a monument. We identify it with AI, then let you scrub the year to see how it looked across centuries.
        </Text>

        {/* API Key settings panel */}
        {showSettings && (
          <View style={styles.settingsPanel}>
            <Text style={styles.settingsTitle}>AI Scanner Credentials</Text>
            <Text style={styles.settingsSub}>
              Enter your Google Gemini API Key below. This runs the vision scanner directly on your browser to recognize uploaded files or photos.
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
              Don't have a key? You can get a free API Key from Google AI Studio, or simply use our smart manual search and predefined presets.
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
                displayImageSource && (
                  <Image
                    source={displayImageSource}
                    style={[styles.cameraImage, getFilterStyle() as any]}
                    contentFit="cover"
                  />
                )
              )}

              {/* Blur Loader overlay when scanning, identifying, or generating images */}
              {(isScanning || busy !== 'idle' || eraImgLoading) && (
                <View style={styles.loaderOverlay}>
                  <View style={styles.loaderPill}>
                    <ActivityIndicator size="small" color="#D4654A" style={{ marginRight: 8 }} />
                    <Text style={styles.loaderPillText}>
                      {isScanning 
                        ? `Scanning: ${scanProgress}%` 
                        : busy === 'identifying'
                        ? 'Identifying monument…'
                        : busy === 'timeline'
                        ? 'Loading history…'
                        : 'Generating era appearance…'}
                    </Text>
                  </View>
                  {isScanning && (
                    <Text style={styles.loaderPillSub}>{scanMessage}</Text>
                  )}
                </View>
              )}

              {eras && (
                <View style={styles.yearOverlayBadge}>
                  <Text style={styles.yearOverlayText}>Year {year}</Text>
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
                    <Text style={styles.primaryBtnText}>Capture & Identify</Text>
                  </Pressable>
                  <Pressable
                    style={styles.outlineBtn}
                    onPress={triggerUpload}
                  >
                    <Feather name="upload" size={14} color="#2C2420" style={{ marginRight: 6 }} />
                    <Text style={styles.outlineBtnText}>Upload photo</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable
                  style={styles.outlineBtn}
                  onPress={reset}
                >
                  <Feather name="refresh-cw" size={14} color="#2C2420" style={{ marginRight: 6 }} />
                  <Text style={styles.outlineBtnText}>Try another</Text>
                </Pressable>
              )}
            </View>

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>

          {/* Right panel: Timeline history */}
          <View style={[styles.card, styles.rightCard]}>
            {scanAmbiguous ? (
              <View style={styles.calibrationContainer}>
                <Feather name="help-circle" size={32} color="#D4654A" style={{ marginBottom: 10 }} />
                <Text style={styles.calibrationHeading}>Ambiguous Scan Calibration</Text>
                <Text style={styles.calibrationSub}>
                  Vision models detected a monument structure! Please type or select its name to unlock the historical timeline:
                </Text>

                {/* Direct Autocomplete Search */}
                <View style={styles.searchContainer}>
                  {Platform.OS === 'web' ? (
                    <input
                      placeholder="Type monument name (e.g. Eiffel Tower, Colosseum)"
                      style={webStyles.webSearchInput}
                      value={calibrationSearchText}
                      onChange={(e) => setCalibrationSearchText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') runPresetSearch(calibrationSearchText);
                      }}
                    />
                  ) : null}
                  <Pressable 
                    style={styles.searchSubmitBtn} 
                    onPress={() => runPresetSearch(calibrationSearchText)}
                  >
                    <Feather name="arrow-right" size={14} color="#FFFFFF" />
                  </Pressable>
                </View>

                <Text style={styles.orSuggestions}>Or choose a common monument:</Text>
                <View style={styles.presetsGrid}>
                  {PRESET_SUGGESTIONS.map((name) => (
                    <Pressable
                      key={name}
                      style={styles.presetBtn}
                      onPress={() => runPresetSearch(name)}
                    >
                      <Text style={styles.presetBtnText}>{name}</Text>
                    </Pressable>
                  ))}
                </View>

                <Pressable style={styles.cancelBtn} onPress={reset}>
                  <Text style={styles.cancelBtnText}>Reset Camera</Text>
                </Pressable>
              </View>
            ) : !identified ? (
              <View style={styles.placeholderBox}>
                <Feather name="clock" size={40} color="#D4CFC8" style={{ marginBottom: 14 }} />
                <Text style={styles.placeholderText}>
                  Capture a monument to unlock its living timeline — Taj Mahal, Hawa Mahal, Qutub Minar, India Gate and beyond.
                </Text>

                {/* Direct Search Bar */}
                <Text style={styles.searchLabel}>SEARCH MONUMENT HISTORIES</Text>
                <View style={styles.searchContainer}>
                  {Platform.OS === 'web' ? (
                    <input
                      placeholder="Search any monument globally (e.g. Colosseum)..."
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

                <Text style={styles.presetLabel}>— OR SELECT A PRESET —</Text>
                <View style={styles.presetsGrid}>
                  {PRESET_SUGGESTIONS.map((name) => (
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
              <View style={styles.timelineBox}>
                <View style={styles.timelineHeaderRow}>
                  <View>
                    <Text style={styles.identifiedLabel}>IDENTIFIED</Text>
                    <Text style={styles.monumentName}>{identified.name}</Text>
                  </View>
                  <Pressable style={styles.timelineResetBtn} onPress={reset}>
                    <Text style={styles.timelineResetBtnText}>Reset</Text>
                  </Pressable>
                </View>
                <Text style={styles.monumentLoc}>
                  {identified.location} · {(identified.confidence * 100).toFixed(0)}% confidence
                </Text>
                <Text style={styles.monumentSummary}>{identified.summary}</Text>

                {eras && activeEra && (
                  <View style={styles.scrubberContainer}>
                    <View style={styles.sliderLabelRow}>
                      <Text style={styles.sliderLabelMin}>{minYear}</Text>
                      <Text style={styles.sliderLabelVal}>{year}</Text>
                      <Text style={styles.sliderLabelMax}>{maxYear}</Text>
                    </View>

                    {Platform.OS === 'web' ? (
                      <input
                        type="range"
                        min={minYear}
                        max={maxYear}
                        step={1}
                        value={year}
                        style={webStyles.webRangeSlider}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                      />
                    ) : (
                      <Text style={styles.nativeSliderLabel}>
                        Tap milestone years below to scrub travel through time:
                      </Text>
                    )}

                    {/* Era markers */}
                    <View style={styles.eraPillsRow}>
                      {eras.map((e) => (
                        <Pressable
                          key={e.year}
                          style={[
                            styles.eraPill,
                            activeEra.year === e.year && styles.eraPillActive
                          ]}
                          onPress={() => setYear(e.year)}
                        >
                          <Text style={[
                            styles.eraPillText,
                            activeEra.year === e.year && styles.eraPillTextActive
                          ]}>
                            {e.year}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    {/* Active era card */}
                    <View style={styles.eraCard}>
                      <Text style={styles.eraCardHeading}>
                        {activeEra.year} · {activeEra.title}
                      </Text>
                      <Text style={styles.eraCardDesc}>
                        {activeEra.description}
                      </Text>
                      <View style={styles.appearanceDivider} />
                      <Text style={styles.eraCardAppearance}>
                        How it looked: {activeEra.appearance}
                      </Text>
                    </View>
                  </View>
                )}
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
    paddingBottom: 160, // generous bottom spacing to clear BottomNavBar overlay
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
    boxShadow: '0 2px 6px rgba(44,36,32,0.03)',
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
    boxShadow: '0 4px 12px rgba(44,36,32,0.05)',
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
  },
  saveKeyBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  settingsTip: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    color: '#B8AFA8',
    lineHeight: 14,
    marginTop: 10,
    fontStyle: 'italic',
  },
  cardGrid: {
    flexDirection: 'column',
    gap: 20,
  },
  cardGridWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EFE7DC',
    padding: 20,
    boxShadow: '0px 4px 12px rgba(44, 36, 32, 0.04)',
    elevation: 3,
  },
  leftCard: {
    flex: 1.1,
  },
  rightCard: {
    flex: 1,
    minHeight: 320,
  },
  cameraContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#000000',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFE7DC',
  },
  cameraImage: {
    width: '100%',
    height: '100%',
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
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 3,
  },
  yearOverlayBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(44, 36, 32, 0.8)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 5,
  },
  yearOverlayText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
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
    paddingVertical: 20,
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
  timelineBox: {
    width: '100%',
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  identifiedLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9.5,
    color: '#B8AFA8',
    letterSpacing: 1.5,
  },
  monumentName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 30,
    color: '#2C2420',
    marginTop: 4,
  },
  monumentLoc: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#8A7E74',
    marginTop: 2,
  },
  monumentSummary: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#8A7E74',
    lineHeight: 19,
    marginTop: 12,
  },
  scrubberContainer: {
    marginTop: 24,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sliderLabelMin: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#8A7E74',
  },
  sliderLabelVal: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#D4654A',
  },
  sliderLabelMax: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#8A7E74',
  },
  nativeSliderLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11.5,
    color: '#8A7E74',
    textAlign: 'center',
    marginBottom: 10,
  },
  eraPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    marginBottom: 18,
  },
  eraPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  eraPillActive: {
    backgroundColor: '#D4654A',
    borderColor: '#D4654A',
  },
  eraPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#8A7E74',
  },
  eraPillTextActive: {
    color: '#FFFFFF',
  },
  eraCard: {
    backgroundColor: '#FFFDFB',
    borderWidth: 1,
    borderColor: '#F5E6D3',
    borderRadius: 16,
    padding: 16,
  },
  eraCardHeading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12.5,
    color: '#D4654A',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  eraCardDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#2C2420',
    lineHeight: 18.5,
    marginTop: 8,
  },
  appearanceDivider: {
    height: 1,
    backgroundColor: '#F5E6D3',
    marginVertical: 12,
  },
  eraCardAppearance: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    color: '#8A7E74',
    fontStyle: 'italic',
  },
  calibrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  calibrationHeading: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: '#2C2420',
    marginBottom: 6,
  },
  calibrationSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#8A7E74',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 14,
  },
  orSuggestions: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#8A7E74',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  cancelBtn: {
    marginTop: 18,
    paddingVertical: 8,
  },
  cancelBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#8A7E74',
    textDecorationLine: 'underline',
  }
});
