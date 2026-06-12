import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import BottomNavBar from '@/components/BottomNavBar';

// Comprehensive historical data for the 4 featured monuments
const monumentData: Record<string, {
  name: string;
  location: string;
  confidence: string;
  description: string;
  timeline: Record<number, {
    title: string;
    text: string;
    look: string;
    image: any;
  }>;
  years: number[];
}> = {
  taj: {
    name: 'Taj Mahal',
    location: 'Agra, Uttar Pradesh, India',
    confidence: '95% confidence',
    description: 'The Taj Mahal is an ivory-white marble mausoleum on the right bank of the river Yamuna in the Indian city of Agra. It was commissioned in 1632 by the Mughal emperor Shah Jahan to house the tomb of his favorite wife, Mumtaz Mahal; it also houses the tomb of Shah Jahan himself.',
    years: [1631, 1653, 1707, 1803, 1947, 1983, 2026],
    timeline: {
      1631: {
        title: 'CONSTRUCTION BEGINS',
        text: 'Mughal Emperor Shah Jahan initiates the construction of this grand mausoleum. Over 20,000 artisans, masons, and stone-cutters are brought in from Persia, Europe, and all over India to begin foundation work on the banks of the Yamuna River.',
        look: 'How it looked: Scaffolding grids, large red sandstone blocks, rising foundation layouts, and thousands of workers surrounding the half-formed minaret bases.',
        image: require('@/assets/images/timeline/taj_1631.png'),
      },
      1653: {
        title: 'COMPLETION AND MAJESTY',
        text: 'The main mausoleum is completed in its pristine glory. The central dome stands tall, and the white Makrana marble shines brilliantly under the Agra sun. The lush gardens are laid out in classical charbagh Mughal style.',
        look: 'How it looked: Pure, bright white marble towers against a clean sky, with fresh symmetrical gardens, fountains, and royal Mughal attendants walking the pathways.',
        image: require('@/assets/images/timeline/taj_2026.png'),
      },
      1707: {
        title: 'AURANGZEB\'S ERA AND DECLINE',
        text: 'Following the death of Emperor Aurangzeb, the Mughal Empire enters a period of gradual decline. Funding for the maintenance of the gardens and the complex decreases, leading to early overgrowth.',
        look: 'How it looked: The marble structures remain majestic, but the surrounding gardens show signs of early overgrowth, and the pools are less regularly cleared.',
        image: require('@/assets/images/timeline/taj_1857.png'),
      },
      1803: {
        title: 'COLONIAL TRANSITION',
        text: 'During the British colonial era, the Taj Mahal\'s gardens are redesigned to mimic the formal lawns of London. Parts of the monument suffer neglect, but early conservation efforts begin under the colonial administration.',
        look: 'How it looked: Sepia-toned photograph showing overgrown english-style lawns, dirt pathways, and early tourists inspecting the dome.',
        image: require('@/assets/images/timeline/taj_1857.png'),
      },
      1947: {
        title: 'INDEPENDENCE ERA',
        text: 'With India gaining independence, the Taj Mahal becomes the crown jewel of national heritage. The Archaeological Survey of India (ASI) takes full control, launching modern scientific restoration techniques.',
        look: 'How it looked: Classic black and white vintage photograph with visitors in traditional 1940s Indian clothing strolling along the reflection pool.',
        image: require('@/assets/images/timeline/taj_1857.png'), // Reused existing vintage image to resolve missing asset error
      },
      1983: {
        title: 'UNESCO WORLD HERITAGE SITE',
        text: 'The Taj Mahal is designated a UNESCO World Heritage Site, recognized as "the jewel of Muslim art in India and one of the universally admired masterpieces of the world\'s heritage."',
        look: 'How it looked: Color photograph showing the dome under early modern scientific chemical washing, with tourists from all corners of the globe visiting.',
        image: require('@/assets/images/timeline/taj_2026.png'),
      },
      2026: {
        title: 'CONTEMPORARY PRESERVATION AND TOURISM',
        text: 'Today, the Taj Mahal faces challenges from air pollution, footfall from millions of tourists, and climate change. Ongoing conservation efforts employ advanced techniques and strict regulations to maintain its pristine condition.',
        look: 'How it looked: The Taj Mahal continues to dazzle, a focal point for global tourism, its brilliant white marble meticulously conserved, standing in its historic grandeur on the banks of the Yamuna River.',
        image: require('@/assets/images/timeline/taj_2026.png'),
      },
    },
  },
  hawa: {
    name: 'Hawa Mahal',
    location: 'Jaipur, Rajasthan, India',
    confidence: '98% confidence',
    description: 'Hawa Mahal, or the \'Palace of Winds\', is a palace in the city of Jaipur, India. Built from red and pink sandstone, the palace sits on the edge of the City Palace, Jaipur, and extends to the zenana, or women\'s chambers.',
    years: [1799, 1876, 1947, 2026],
    timeline: {
      1799: {
        title: 'THE PALACE OF WINDS IS BORN',
        text: 'Maharaja Sawai Pratap Singh commissions Hawa Mahal. Designed by Lal Chand Ustad, the five-storey honeycomb facade with 953 small windows (jharokhas) is built so royal women can observe street life without being seen.',
        look: 'How it looked: Freshly carved pink-red sandstone with gilded arches, Rajasthani royal guards on horses, and a clean, historic street in Jaipur.',
        image: require('@/assets/images/timeline/hawa_1799.png'),
      },
      1876: {
        title: 'THE PINK CITY COAT',
        text: 'Jaipur is painted pink to welcome Albert Edward, Prince of Wales. Hawa Mahal receives a fresh coat of terracotta-pink paint and white lime accents, cementing Jaipur\'s identity as the \'Pink City\'.',
        look: 'How it looked: Warm hand-tinted historical depiction with the palace painted in deep terracotta-pink, street parades, and crowds in traditional royal attire.',
        image: require('@/assets/images/timeline/hawa_1799.png'),
      },
      1947: {
        title: 'INDEPENDENCE ERA',
        text: 'Following India\'s independence, Hawa Mahal is declared a protected national monument. It transitions from a private royal viewing gallery to a public museum hosting visitors from around the world.',
        look: 'How it looked: Black and white photo showing local merchants, cycle rickshaws, and vintage vehicles passing by the intricate facade.',
        image: require('@/assets/images/timeline/hawa_2026.png'),
      },
      2026: {
        title: 'MODERN PRESERVATION',
        text: 'Hawa Mahal undergoes extensive restoration to preserve its delicate screens and sandstone carvings. It remains Jaipur\'s most photographed landmark, standing at the busy intersection of the old walled city.',
        look: 'How it looked: Beautiful high-definition color photograph of the iconic pink honeycomb structure against a bright sky, surrounded by modern Jaipur street bustle.',
        image: require('@/assets/images/timeline/hawa_2026.png'),
      },
    },
  },
  qutub: {
    name: 'Qutub Minar',
    location: 'Delhi, India',
    confidence: '92% confidence',
    description: 'Qutub Minar is a minaret and \'victory tower\' that forms part of the Qutb complex, which lies at the site of Delhi\'s oldest fortified city. It is a UNESCO World Heritage Site.',
    years: [1200, 1803, 1947, 2026],
    timeline: {
      1200: {
        title: 'THE VICTORY TOWER ERECTION',
        text: 'Qutb-ud-din Aibak begins construction of the first storey of the minaret. Built with red sandstone and detailed with Arabic inscriptions and geometric carvings, it symbolizes the triumph of the Sultanate.',
        look: 'How it looked: Pristine red sandstone tower surrounded by ancient ruins, Islamic guards in medieval armor, and clear skies in historic Delhi.',
        image: require('@/assets/images/timeline/qutub_1200.png'),
      },
      1803: {
        title: 'EARTHQUAKE AND BRITISH REPAIRS',
        text: 'An earthquake causes severe damage to the tower, destroying the cupola at the top. Major Robert Smith of the British Indian Army repairs it, adding a Bengali-style dome which was later removed.',
        look: 'How it looked: Antique lithograph look showing surrounding brick ruins, scaffolding, and British officers inspecting the minaret.',
        image: require('@/assets/images/timeline/qutub_1803.png'),
      },
      1947: {
        title: 'INDEPENDENCE TRANSITION',
        text: 'The Qutb complex becomes a national archaeological preserve. The Archaeological Survey of India (ASI) reinforces the tower\'s foundation and limits inner climbing to preserve its structural integrity.',
        look: 'How it looked: Classic black and white vintage photo showing visitors examining the towering sandstone pillar from the historic lawns.',
        image: require('@/assets/images/timeline/qutub_2026.png'),
      },
      2026: {
        title: 'UNESCO PRESERVATION AND PARKWAYS',
        text: 'Today, Qutub Minar is Delhi\'s most iconic medieval heritage site. The surrounding parkways are landscaped with green lawns and evening light-and-sound shows attract thousands of global tourists.',
        look: 'How it looked: High-resolution modern color photograph showing the spectacular red sandstone tower and minaret rising against a blue sky, surrounded by green lawns.',
        image: require('@/assets/images/timeline/qutub_2026.png'),
      },
    },
  },
  indiagate: {
    name: 'India Gate',
    location: 'New Delhi, India',
    confidence: '96% confidence',
    description: 'The India Gate is a war memorial located astride the Rajpath (now Kartavya Path) on the eastern edge of the "ceremonial axis" of New Delhi, formerly called Kingsway.',
    years: [1921, 1931, 1971, 2026],
    timeline: {
      1921: {
        title: 'FOUNDATION STONE LAYING',
        text: 'The foundation stone of the All India War Memorial is laid by the Duke of Connaught. Designed by Sir Edwin Lutyens, the structure honors 84,000 soldiers of the British Indian Army who died in World War I.',
        look: 'How it looked: Vintage black and white photo showing early foundations, scaffolding, construction cranes, and British-Indian officers planning the ceremonial arch.',
        image: require('@/assets/images/timeline/indiagate_1921.png'),
      },
      1931: {
        title: 'INAUGURATION AND SPLENDOR',
        text: 'The monument is inaugurated by Lord Irwin. It stands as a majestic triumphal arch resembling the Arc de Triomphe in Paris, anchoring the Kingsway ceremonial avenue.',
        look: 'How it looked: Crisp historical photograph showing the freshly completed monument, open plains around it, and military march-pasts.',
        image: require('@/assets/images/timeline/indiagate_1971.png'),
      },
      1971: {
        title: 'AMAR JAWAN JYOTI',
        text: 'Following the Indo-Pakistan War, the Amar Jawan Jyoti (Flame of the Immortal Soldier) is inaugurated by Indira Gandhi, establishing the eternal flame under the arch.',
        look: 'How it looked: Faded 1970s color photograph showing the eternal flame beneath the arch, with army guards standing at attention.',
        image: require('@/assets/images/timeline/indiagate_1971.png'),
      },
      2026: {
        title: 'KARTAVYA PATH AND ILLUMINATION',
        text: 'Re-anchoring the central vista, the India Gate plaza is renovated into Kartavya Path, featuring walkable canals, musical fountains, and daily tricolor night lighting.',
        look: 'How it looked: Modern night photo showing the India Gate illuminated brilliantly in saffron, white, and green lights, reflecting in the fountains.',
        image: require('@/assets/images/timeline/indiagate_2026.png'),
      },
    },
  },
};

// Thumbnail preview shortcuts to test the camera scan
const shortcuts = [
  { id: 'taj', name: 'Taj Mahal', image: require('@/assets/images/timeline/taj_2026.png') },
  { id: 'hawa', name: 'Hawa Mahal', image: require('@/assets/images/timeline/hawa_2026.png') },
  { id: 'qutub', name: 'Qutub Minar', image: require('@/assets/images/timeline/qutub_2026.png') },
  { id: 'indiagate', name: 'India Gate', image: require('@/assets/images/timeline/indiagate_2026.png') },
];

export default function TimelineScannerScreen() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const isTablet = SCREEN_WIDTH > 768;

  const [activeShortcut, setActiveShortcut] = useState<string>('taj');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState('');
  
  const [identifiedId, setIdentifiedId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [isRenderingEra, setIsRenderingEra] = useState(false);

  // Hidden references for Web file upload and video capture
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [flashActive, setFlashActive] = useState(false);

  // HTML5 Live Camera feed on Web
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && !identifiedId) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraActive(true);
          }
        })
        .catch((err) => {
          console.warn('Camera stream blocked or unavailable:', err);
          setCameraActive(false);
        });
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [identifiedId]);

  const activeMonument = useMemo(() => {
    return identifiedId ? monumentData[identifiedId] : null;
  }, [identifiedId]);

  // Selected Era detail block
  const activeEraData = useMemo(() => {
    if (!activeMonument) return null;
    // Find closest historical year matching slider
    const closestYear = activeMonument.years.reduce((prev, curr) => {
      return Math.abs(curr - selectedYear) < Math.abs(prev - selectedYear) ? curr : prev;
    }, activeMonument.years[0]);

    return {
      year: closestYear,
      ...activeMonument.timeline[closestYear],
    };
  }, [activeMonument, selectedYear]);

  // Simulate scanning matching animation
  const triggerScan = () => {
    // White shutter flash animation
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    // Freeze video frame to canvas on Web
    if (Platform.OS === 'web' && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
          const dataUrl = canvas.toDataURL('image/jpeg');
          setCapturedImage(dataUrl);
        } catch (e) {
          console.warn('Could not freeze camera frame:', e);
        }
      }
    }

    setIsScanning(true);
    setScanProgress(0);
    setScanMessage('Detecting architectural contours...');

    const messages = [
      'Querying monuments neural network...',
      'Matching feature signatures in database...',
      'Match Confirmed! Confidence rating: 95%',
    ];

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setScanProgress(step * 25);
      if (step < 4) {
        setScanMessage(messages[step - 1]);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsScanning(false);
          setIdentifiedId(activeShortcut);
          // Set to latest year
          const mon = monumentData[activeShortcut];
          setSelectedYear(mon.years[mon.years.length - 1]);
        }, 300);
      }
    }, 600);
  };

  // Changing Year with blurred loading rendering overlay
  const handleYearChange = (year: number) => {
    if (year === selectedYear) return;
    setIsRenderingEra(true);
    setSelectedYear(year);

    setTimeout(() => {
      setIsRenderingEra(false);
    }, 700); // 700ms rendering transition
  };

  // Upload photo handler
  const triggerUpload = () => {
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
    } else {
      // Mobile fallback: simulate photo library selection
      setIsScanning(true);
      setScanProgress(0);
      setScanMessage('Selecting image from library...');
      setTimeout(() => {
        setIsScanning(false);
        setIdentifiedId(activeShortcut);
        const mon = monumentData[activeShortcut];
        setSelectedYear(mon.years[mon.years.length - 1]);
      }, 1500);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const filename = file.name.toLowerCase();
    let detectedId = 'taj'; // default fallback
    if (filename.includes('hawa') || filename.includes('wind') || filename.includes('jaipur')) {
      detectedId = 'hawa';
    } else if (filename.includes('qutub') || filename.includes('minar') || filename.includes('delhi')) {
      detectedId = 'qutub';
    } else if (filename.includes('india') || filename.includes('gate') || filename.includes('war')) {
      detectedId = 'indiagate';
    } else if (filename.includes('taj') || filename.includes('mahal') || filename.includes('agra')) {
      detectedId = 'taj';
    } else {
      detectedId = activeShortcut;
    }

    setActiveShortcut(detectedId);
    setCapturedImage(null); // Clear any video snapshots since it is a file upload

    setIsScanning(true);
    setScanProgress(0);
    setScanMessage('Analyzing uploaded image...');

    const messages = [
      'Extracting image metadata...',
      'Matching architectural contours...',
      'Match Confirmed! Confidence rating: 95%',
    ];

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setScanProgress(step * 25);
      if (step < 4) {
        setScanMessage(messages[step - 1]);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsScanning(false);
          setIdentifiedId(detectedId);
          const mon = monumentData[detectedId];
          setSelectedYear(mon.years[mon.years.length - 1]);
        }, 300);
      }
    }, 600);
  };

  const handleReset = () => {
    setIdentifiedId(null);
    setCapturedImage(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDF6EE" />

      {/* Hidden elements for Web file upload and canvas snap */}
      {Platform.OS === 'web' && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept="image/*"
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <style dangerouslySetInnerHTML={{__html: `
            input[type=range].timeline-slider {
              -webkit-appearance: none;
              width: 100%;
              background: transparent;
            }
            input[type=range].timeline-slider:focus {
              outline: none;
            }
            input[type=range].timeline-slider::-webkit-slider-runnable-track {
              width: 100%;
              height: 6px;
              cursor: pointer;
              background: #EFE7DC;
              border-radius: 3px;
            }
            input[type=range].timeline-slider::-webkit-slider-thumb {
              height: 18px;
              width: 18px;
              border-radius: 9px;
              background: #D4654A;
              cursor: pointer;
              -webkit-appearance: none;
              margin-top: -6px;
              border: 2px solid #FFFFFF;
              box-shadow: 0px 2px 6px rgba(0,0,0,0.15);
            }
            input[type=range].timeline-slider::-moz-range-track {
              width: 100%;
              height: 6px;
              cursor: pointer;
              background: #EFE7DC;
              border-radius: 3px;
            }
            input[type=range].timeline-slider::-moz-range-thumb {
              height: 18px;
              width: 18px;
              border-radius: 9px;
              background: #D4654A;
              cursor: pointer;
              border: 2px solid #FFFFFF;
              box-shadow: 0px 2px 6px rgba(0,0,0,0.15);
            }
          `}} />
        </>
      )}

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Block */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <Feather name="clock" size={12} color="#D4654A" style={{ marginRight: 4 }} />
            <Text style={styles.badgeText}>Live Monument Timeline</Text>
          </View>
          <Text style={styles.title}>Point. Recognise. Travel through time.</Text>
          <Text style={styles.subtitle}>
            Aim your camera at a monument. We identify it with AI, then let you scrub the year to see how it looked across centuries.
          </Text>
        </View>

        {/* Grid panel */}
        <View style={[styles.gridRow, isTablet && styles.gridRowTablet]}>
          
          {/* LEFT PANEL: Viewfinder / Media */}
          <View style={[styles.panel, styles.leftPanel, isTablet && styles.panelTablet]}>
            {!identifiedId ? (
              // BEFORE SCAN: Live Camera / Placeholder Viewfinder
              <View style={styles.viewfinderContainer}>
                {capturedImage ? (
                  <Image
                    source={{ uri: capturedImage }}
                    style={styles.viewfinderImage}
                    contentFit="cover"
                  />
                ) : Platform.OS === 'web' && cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={styles.webVideo}
                  />
                ) : (
                  // Native/Fallback preview template
                  <Image
                    source={monumentData[activeShortcut].timeline[2026].image}
                    style={styles.viewfinderImage}
                    contentFit="cover"
                  />
                )}

                {/* Laser scan line overlay when active */}
                {isScanning && (
                  <View style={styles.scanLaserLine} />
                )}

                {/* Grid Overlay Graphic */}
                <View style={styles.gridOverlay}>
                  <View style={styles.cornerTL} />
                  <View style={styles.cornerTR} />
                  <View style={styles.cornerBL} />
                  <View style={styles.cornerBR} />
                </View>

                {/* Shutter flash effect */}
                {flashActive && (
                  <View style={styles.flashOverlay} />
                )}

                {/* Scanning HUD status overlay */}
                {isScanning && (
                  <View style={styles.hudOverlay}>
                    <ActivityIndicator size="small" color="#5cd65c" style={{ marginBottom: 6 }} />
                    <Text style={styles.hudText}>{scanMessage}</Text>
                    <Text style={styles.hudPercent}>{scanProgress}%</Text>
                  </View>
                )}
              </View>
            ) : (
              // AFTER SCAN: Selected Era Visualizer
              <View style={styles.eraImageContainer}>
                <Image
                  source={activeEraData?.image}
                  style={styles.eraImage}
                  contentFit="cover"
                  transition={150}
                />
                
                {/* Era tag */}
                <View style={styles.eraPill}>
                  <Text style={styles.eraPillText}>Year {selectedYear}</Text>
                </View>

                {/* "Rendering this era..." spinner overlay */}
                {isRenderingEra && (
                  <View style={styles.renderingOverlay}>
                    <View style={styles.renderingPill}>
                      <ActivityIndicator size="small" color="#D4654A" style={{ marginRight: 8 }} />
                      <Text style={styles.renderingText}>Rendering this era...</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Action buttons below viewfinder */}
            {!identifiedId ? (
              <View style={styles.viewfinderActionsCol}>
                <View style={styles.actionRow}>
                  <Pressable
                    style={[styles.btnCapture, isScanning && styles.btnDisabled]}
                    onPress={triggerScan}
                    disabled={isScanning}
                  >
                    <Feather name="camera" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.btnCaptureText}>Capture & Identify</Text>
                  </Pressable>
                  
                  <Pressable style={styles.btnUpload} onPress={triggerUpload}>
                    <Feather name="upload" size={15} color="#2C2420" style={{ marginRight: 6 }} />
                    <Text style={styles.btnUploadText}>Upload photo</Text>
                  </Pressable>
                </View>

                {/* Quick select shortcut list */}
                <Text style={styles.shortcutHeading}>Or select a monument to simulate camera aim:</Text>
                <View style={styles.shortcutsRow}>
                  {shortcuts.map((sc) => {
                    const isActive = activeShortcut === sc.id;
                    return (
                      <Pressable
                        key={sc.id}
                        style={[styles.shortcutCard, isActive && styles.shortcutCardActive]}
                        onPress={() => !isScanning && setActiveShortcut(sc.id)}
                      >
                        <Image source={sc.image} style={styles.shortcutImg} contentFit="cover" />
                        <Text style={[styles.shortcutName, isActive && styles.shortcutNameActive]} numberOfLines={1}>
                          {sc.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View style={styles.resetRow}>
                <Pressable style={styles.btnReset} onPress={handleReset}>
                  <Feather name="refresh-cw" size={13} color="#2C2420" style={{ marginRight: 6 }} />
                  <Text style={styles.btnResetText}>Try another</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* RIGHT PANEL: Scanner instructions / Scrubbing details */}
          <View style={[styles.panel, styles.rightPanel, isTablet && styles.panelTablet]}>
            {!identifiedId ? (
              // Locked placeholder state
              <View style={styles.lockedContainer}>
                <View style={styles.lockedIconCircle}>
                  <Feather name="clock" size={32} color="#B8AFA8" />
                </View>
                <Text style={styles.lockedText}>
                  Capture a monument to unlock its living timeline — Taj Mahal, Hawa Mahal, Qutub Minar, India Gate and beyond.
                </Text>
              </View>
            ) : (
              // Scanned timeline view
              <View style={styles.timelinePanel}>
                {/* Identified info */}
                <Text style={styles.identifiedLabel}>IDENTIFIED</Text>
                <Text style={styles.monumentName}>{activeMonument?.name}</Text>
                <View style={styles.locationRow}>
                  <Feather name="map-pin" size={11} color="#8A7E74" style={{ marginRight: 4 }} />
                  <Text style={styles.locationText}>
                    {activeMonument?.location} · <Text style={{ color: '#5cd65c', fontWeight: '600' }}>{activeMonument?.confidence}</Text>
                  </Text>
                </View>
                <Text style={styles.monumentDesc}>{activeMonument?.description}</Text>

                <View style={styles.divider} />

                {/* Scrubbing slider scroller */}
                {activeMonument && (
                  <View style={styles.scrollerSection}>
                    {/* HTML native slider for web compatibility */}
                    {Platform.OS === 'web' ? (
                      <input
                        type="range"
                        className="timeline-slider"
                        min={activeMonument.years[0]}
                        max={2026}
                        value={selectedYear}
                        onChange={(e) => handleYearChange(Number(e.target.value))}
                      />
                    ) : (
                      // Native slider representation with percentage left positioning
                      <View style={styles.nativeSliderLine}>
                        <View style={styles.nativeSliderTrack} />
                        <View 
                          style={[
                            styles.nativeSliderHandle, 
                            { 
                              left: `${((selectedYear - activeMonument.years[0]) / (2026 - activeMonument.years[0])) * 95}%` 
                            }
                          ]} 
                        />
                      </View>
                    )}

                    <View style={styles.sliderLabelRow}>
                      <Text style={styles.sliderYearLimit}>{activeMonument.years[0]}</Text>
                      <Text style={styles.sliderYearCurrent}>{selectedYear}</Text>
                      <Text style={styles.sliderYearLimit}>2026</Text>
                    </View>

                    {/* Discrete Era Buttons */}
                    <View style={styles.eraButtonsRow}>
                      {activeMonument.years.map((y) => {
                        const isSelected = selectedYear === y;
                        return (
                          <Pressable
                            key={y}
                            style={[styles.btnEra, isSelected && styles.btnEraActive]}
                            onPress={() => handleYearChange(y)}
                          >
                            <Text style={[styles.btnEraText, isSelected && styles.btnEraTextActive]}>
                              {y}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Timeline era narrative details card */}
                {activeEraData && (
                  <View style={styles.eraCard}>
                    <Text style={styles.eraCardTitle}>
                      {activeEraData.year} · {activeEraData.title}
                    </Text>
                    <Text style={styles.eraCardText}>{activeEraData.text}</Text>
                    <View style={styles.eraCardDivider} />
                    <Text style={styles.eraCardLook}>{activeEraData.look}</Text>
                  </View>
                )}
              </View>
            )}
          </View>

        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Tab bar */}
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

  // Header styling
  header: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212, 101, 74, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 101, 74, 0.15)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
  },
  badgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10.5,
    color: '#D4654A',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 34,
    color: '#2C2420',
    lineHeight: 40,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    color: '#8A7E74',
    lineHeight: 20,
    maxWidth: 680,
  },

  // Grid
  gridRow: {
    flexDirection: 'column',
    paddingHorizontal: 22,
    gap: 24,
  },
  gridRowTablet: {
    flexDirection: 'row',
  },
  panel: {
    flex: 1,
  },
  panelTablet: {
    maxWidth: '50%',
  },

  // Left Panel camera
  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
  },
  viewfinderContainer: {
    width: '100%',
    height: 340,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
    boxShadow: '0px 4px 16px rgba(44, 36, 32, 0.1)',
    elevation: 6,
  },
  webVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  viewfinderImage: {
    width: '100%',
    height: '100%',
  },
  scanLaserLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#5cd65c',
    boxShadow: '0px 0px 8px #5cd65c',
    top: '45%',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 24,
  },
  cornerTL: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: 20,
    height: 20,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#FFFFFF',
  },
  cornerTR: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 20,
    height: 20,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#FFFFFF',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    width: 20,
    height: 20,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#FFFFFF',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 20,
    height: 20,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#FFFFFF',
  },
  hudOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hudText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  hudPercent: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#5cd65c',
  },

  // Capture buttons below viewfinder
  viewfinderActionsCol: {
    marginTop: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  btnCapture: {
    flex: 1.2,
    backgroundColor: '#D4654A',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 8px rgba(212, 101, 74, 0.25)',
    elevation: 3,
  },
  btnCaptureText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  btnUpload: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 6px rgba(44, 36, 32, 0.02)',
  },
  btnUploadText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12.5,
    color: '#2C2420',
  },
  btnDisabled: {
    opacity: 0.6,
  },

  // Shortcuts aim
  shortcutHeading: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#8A7E74',
    marginBottom: 8,
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  shortcutCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    borderRadius: 12,
    padding: 6,
    alignItems: 'center',
  },
  shortcutCardActive: {
    borderColor: '#D4654A',
    backgroundColor: '#FFFDFB',
    borderWidth: 1.5,
  },
  shortcutImg: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    marginBottom: 4,
  },
  shortcutName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9.5,
    color: '#8A7E74',
    textAlign: 'center',
  },
  shortcutNameActive: {
    color: '#D4654A',
    fontFamily: 'Inter_600SemiBold',
  },

  // After scan Left side image card
  eraImageContainer: {
    width: '100%',
    height: 340,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0px 4px 16px rgba(44, 36, 32, 0.1)',
    elevation: 6,
  },
  eraImage: {
    width: '100%',
    height: '100%',
  },
  eraPill: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
  },
  eraPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#2C2420',
  },
  renderingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  renderingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
    boxShadow: '0px 2px 10px rgba(0,0,0,0.12)',
  },
  renderingText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11.5,
    color: '#2C2420',
  },
  resetRow: {
    marginTop: 16,
  },
  btnReset: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnResetText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#2C2420',
  },

  // Right Panel Details
  rightPanel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    borderRadius: 16,
    padding: 20,
    minHeight: 340,
    boxShadow: '0px 4px 16px rgba(44, 36, 32, 0.03)',
    elevation: 3,
  },
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  lockedIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF9F2',
    borderWidth: 1.5,
    borderColor: '#F5E6D3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  lockedText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#8A7E74',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },

  // Timeline view
  timelinePanel: {
    display: 'flex',
    flexDirection: 'column',
  },
  identifiedLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9.5,
    color: '#D4654A',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  monumentName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 28,
    color: '#2C2420',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11.5,
    color: '#8A7E74',
  },
  monumentDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    color: '#8A7E74',
    lineHeight: 18.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#EFE7DC',
    marginVertical: 16,
  },

  // Scroller/Slider section
  scrollerSection: {
    marginBottom: 16,
  },
  nativeSliderLine: {
    width: '100%',
    height: 24,
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 12,
  },
  nativeSliderTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EFE7DC',
    width: '100%',
  },
  nativeSliderHandle: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#D4654A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    top: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sliderYearLimit: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#B8AFA8',
  },
  sliderYearCurrent: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#D4654A',
  },
  eraHeading: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#8A7E74',
    marginBottom: 8,
  },
  eraButtonsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  btnEra: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EFE7DC',
    backgroundColor: '#FFFFFF',
  },
  btnEraActive: {
    backgroundColor: '#D4654A',
    borderColor: '#D4654A',
  },
  btnEraText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#8A7E74',
  },
  btnEraTextActive: {
    color: '#FFFFFF',
  },

  // Era details card
  eraCard: {
    backgroundColor: '#FFF9F2',
    borderWidth: 1,
    borderColor: '#F5E6D3',
    borderRadius: 12,
    padding: 14,
    boxShadow: '0px 2px 8px rgba(212, 101, 74, 0.02)',
  },
  eraCardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#D4654A',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  eraCardText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    color: '#2C2420',
    lineHeight: 18.5,
    marginBottom: 8,
  },
  eraCardLook: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    color: '#8A7E74',
    lineHeight: 16.5,
    fontStyle: 'italic',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FFFFFF',
    zIndex: 99,
  },
  eraCardDivider: {
    height: 1,
    backgroundColor: '#F5E6D3',
    marginVertical: 10,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderRadius: 1,
  },
});
