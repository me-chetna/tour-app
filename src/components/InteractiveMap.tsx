import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';
import { Place } from '@/data/cityPlaces';

interface InteractiveMapProps {
  places: Place[];
  centerLat: number;
  centerLng: number;
  zoomDelta: number;
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onRightClickPlace?: (place: Place) => void;
}

export default function InteractiveMap({
  places,
  centerLat,
  centerLng,
  zoomDelta,
  selectedPlace,
  onSelectPlace,
  onRightClickPlace,
}: InteractiveMapProps) {
  const webViewRef = useRef<WebView>(null);

  // Generate self-contained HTML page loading Leaflet and CartoDB Voyager tiles
  const getMapHtml = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <style>
            html, body, #map {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
              background-color: #f1ece4;
            }
            @keyframes spin-glow {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .custom-leaflet-icon {
              background: none !important;
              border: none !important;
            }
            .marker-tooltip {
              pointer-events: none;
            }
          </style>
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        </head>
        <body>
          <div id="map"></div>
          <script>
            var map = L.map('map', {
              zoomControl: false,
              attributionControl: false
            }).setView([${centerLat}, ${centerLng}], 13);

            // Tile layer: CartoDB Voyager raster tiles
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
              maxZoom: 19
            }).addTo(map);

            var layers = [];

            // Main update function called from native parent
            window.updateData = function(placesStr, selectedPlaceId) {
              var places = JSON.parse(placesStr);
              
              // Clear previous markers & polylines
              layers.forEach(function(l) { l.remove(); });
              layers = [];

              // Group stops by day for polylines
              var routes = {};
              places.forEach(function(p) {
                if (p.inPlan && p.day > 0) {
                  if (!routes[p.day]) routes[p.day] = [];
                  routes[p.day].push(p);
                }
              });

              // Draw dashed route lines
              Object.keys(routes).forEach(function(day) {
                var dayPlaces = routes[day];
                if (dayPlaces.length < 2) return;
                dayPlaces.sort(function(a, b) { return a.order - b.order; });
                var latlngs = dayPlaces.map(function(p) { return [p.lat, p.lng]; });
                
                var polyline = L.polyline(latlngs, {
                  color: '#D4654A',
                  weight: 3.5,
                  dashArray: '6 8'
                }).addTo(map);
                layers.push(polyline);
              });

              // Draw custom markers
              places.forEach(function(place) {
                var isSelected = place.id === selectedPlaceId;
                
                // Colors: active=terracotta, rest=c97a3a, market=b8860b, available=6b7280
                var markerColor = place.inPlan 
                  ? '#D4654A' 
                  : (place.type === 'restaurant' ? '#c97a3a' : (place.type === 'market' ? '#b8860b' : '#6b7280'));

                var iconHtml = '<div class="custom-marker-wrapper ' + (isSelected ? 'selected' : '') + '" style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">' +
                  (isSelected ? '<div class="glow-ring" style="position: absolute; top: -7px; left: -7px; width: 38px; height: 38px; border-radius: 50%; border: 2px dashed #D4654A; animation: spin-glow 8s linear infinite;"></div>' : '') +
                  '<div class="teardrop" style="width: 22px; height: 22px; background-color: ' + markerColor + '; border-radius: 50% 50% 50% 0; transform: rotate(-45deg) ' + (isSelected ? 'scale(1.2)' : 'scale(1)') + '; box-shadow: 0px 2px 6px rgba(0,0,0,0.25); border: 1.5px solid #FFFFFF; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">' +
                    '<div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">' +
                      (place.inPlan 
                        ? '<span style="color: #FFFFFF; font-family: sans-serif; font-size: 10px; font-weight: bold;">' + place.order + '</span>'
                        : '<span style="color: #FFFFFF; font-size: 9px;">' + (place.type === 'restaurant' ? '🍴' : (place.type === 'market' ? '🛍️' : '📍')) + '</span>') +
                    '</div>' +
                  '</div>' +
                  '<div class="marker-tooltip" style="position: absolute; top: 28px; left: 50%; transform: translateX(-50%); background-color: #FFFFFF; color: #2C2420; padding: 3px 8px; border-radius: 999px; font-size: 9.5px; font-family: sans-serif; font-weight: 600; white-space: nowrap; box-shadow: 0px 2px 6px rgba(44, 36, 32, 0.15); border: 1px solid #EFE7DC; pointer-events: none; opacity: ' + (isSelected ? 1 : 0) + '; transition: opacity 0.2s ease; z-index: 1000;">' +
                    place.name +
                  '</div>' +
                '</div>';

                var customIcon = L.divIcon({
                  html: iconHtml,
                  className: 'custom-leaflet-icon',
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                });

                var marker = L.marker([place.lat, place.lng], { icon: customIcon }).addTo(map);
                
                // Click handler
                marker.on('click', function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'click', placeId: place.id }));
                });

                // Double click callback maps to add/remove
                marker.on('dblclick', function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'right-click', placeId: place.id }));
                });

                // Touchhold / Longpress simulation to act as right-click on mobile screens
                var pressTimer;
                marker.on('mousedown touchstart', function() {
                  pressTimer = window.setTimeout(function() {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'right-click', placeId: place.id }));
                  }, 650);
                });
                marker.on('mouseup touchend', function() {
                  clearTimeout(pressTimer);
                });

                layers.push(marker);
              });
            };

            // Pan handler
            window.panToPlace = function(lat, lng) {
              map.setView([lat, lng], 14, { animate: true, duration: 0.5 });
            };
          </script>
        </body>
      </html>
    `;
  };

  // Push updates to WebView
  useEffect(() => {
    if (webViewRef.current) {
      const placesStr = JSON.stringify(places);
      const selectedPlaceId = selectedPlace?.id || '';
      const escapedPlacesStr = JSON.stringify(placesStr);
      
      const js = `window.updateData(${escapedPlacesStr}, '${selectedPlaceId}'); void(0);`;
      webViewRef.current.injectJavaScript(js);
    }
  }, [places, selectedPlace]);

  // Pan WebView when selectedPlace changes
  useEffect(() => {
    if (webViewRef.current && selectedPlace) {
      const js = `window.panToPlace(${selectedPlace.lat}, ${selectedPlace.lng}); void(0);`;
      webViewRef.current.injectJavaScript(js);
    }
  }, [selectedPlace]);

  // Inject initial list when page completes loading
  const injectInitialData = () => {
    const placesStr = JSON.stringify(places);
    const selectedPlaceId = selectedPlace?.id || '';
    const escapedPlacesStr = JSON.stringify(placesStr);
    
    const js = `window.updateData(${escapedPlacesStr}, '${selectedPlaceId}'); void(0);`;
    webViewRef.current?.injectJavaScript(js);
  };

  // Process messages coming from WebView Leaflet map
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'click') {
        const place = places.find((p) => p.id === data.placeId);
        if (place) {
          onSelectPlace(place);
        }
      } else if (data.type === 'right-click') {
        const place = places.find((p) => p.id === data.placeId);
        if (place && onRightClickPlace) {
          onRightClickPlace(place);
        }
      }
    } catch (e) {
      console.warn('WebView postMessage parsing error:', e);
    }
  };

  // Custom zoom handlers
  const zoomIn = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`map.zoomIn(); void(0);`);
    }
  };

  const zoomOut = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`map.zoomOut(); void(0);`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Floating zoom controls matching UI specs */}
      <View style={styles.zoomControls}>
        <Pressable style={styles.zoomButton} onPress={zoomIn}>
          <Feather name="plus" size={18} color="#2C2420" />
        </Pressable>
        <Pressable style={styles.zoomButton} onPress={zoomOut}>
          <Feather name="minus" size={18} color="#2C2420" />
        </Pressable>
      </View>

      {/* Cross-platform WebView rendering Leaflet */}
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: getMapHtml() }}
        onMessage={handleMessage}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onLoadEnd={injectInitialData}
        scalesPageToFit={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#f1ece4',
  },
  zoomControls: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1000,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(44,36,32,0.1)',
    boxShadow: '0px 2px 8px rgba(44,36,32,0.15)',
    elevation: 3,
  },
  zoomButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(44,36,32,0.08)',
  },
});
