import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
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
  const [L, setL] = useState<any>(null);
  const [map, setMap] = useState<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<any[]>([]);

  // 1. Inject Leaflet CSS and keyframe animations on mount
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('leaflet-custom-styles')) {
      const style = document.createElement('style');
      style.id = 'leaflet-custom-styles';
      style.innerHTML = `
        @keyframes spin-glow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .custom-marker-wrapper:hover .marker-tooltip {
          opacity: 1 !important;
        }
        .leaflet-container {
          background-color: #f1ece4 !important; /* warm sand fallback */
        }
        .custom-leaflet-icon {
          background: none !important;
          border: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // 2. Initialize Leaflet map instance
  useEffect(() => {
    let active = true;
    let leafletMap: any = null;

    const initMap = async () => {
      // Dynamic import to avoid SSR window errors
      const LeafletLib = (await import('leaflet')).default;

      if (!active) return;
      setL(LeafletLib);

      if (mapContainerRef.current) {
        // Map engine: leaflet v1.9.4
        leafletMap = LeafletLib.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
        }).setView([centerLat, centerLng], 13);

        // Tile layer: CartoDB Voyager raster tiles
        LeafletLib.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
        }).addTo(leafletMap);

        setMap(leafletMap);
      }
    };

    initMap();

    return () => {
      active = false;
      if (leafletMap) {
        leafletMap.remove();
      }
    };
  }, [centerLat, centerLng]);

  // 3. Pan map when selectedPlace changes
  useEffect(() => {
    if (map && selectedPlace) {
      map.setView([selectedPlace.lat, selectedPlace.lng], 14, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [selectedPlace, map]);

  // 4. Draw/Update Markers and Polylines
  useEffect(() => {
    if (!L || !map) return;

    // Clear previous elements
    layersRef.current.forEach((layer) => layer.remove());
    layersRef.current = [];

    const newLayers: any[] = [];

    // Group planned stops by day to draw polylines
    const routes: Record<number, Place[]> = {};
    places.forEach((p) => {
      if (p.inPlan && p.day > 0) {
        if (!routes[p.day]) routes[p.day] = [];
        routes[p.day].push(p);
      }
    });

    // Draw route dashed polyline
    Object.entries(routes).forEach(([dayStr, dayPlaces]) => {
      if (dayPlaces.length < 2) return;
      dayPlaces.sort((a, b) => a.order - b.order);
      const latlngs = dayPlaces.map((p) => [p.lat, p.lng]);

      const polyline = L.polyline(latlngs, {
        color: '#D4654A', // warm terracotta
        weight: 3.5,
        dashArray: '6 8', // dashed polyline
      }).addTo(map);

      newLayers.push(polyline);
    });

    // Draw custom pins
    places.forEach((place) => {
      const isSelected = selectedPlace?.id === place.id;
      
      // Marker Colors
      const markerColor = place.inPlan
        ? '#D4654A' // Terracotta: warm terracotta oklch(0.62 0.16 40)
        : place.type === 'restaurant'
          ? '#c97a3a' // Restaurants
          : place.type === 'market'
            ? '#b8860b' // Markets
            : '#6b7280'; // Available (not in plan)

      const iconHtml = `
        <div class="custom-marker-wrapper ${isSelected ? 'selected' : ''}" style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
          ${
            isSelected
              ? `<div class="glow-ring" style="position: absolute; top: -7px; left: -7px; width: 38px; height: 38px; border-radius: 50%; border: 2px dashed #D4654A; animation: spin-glow 8s linear infinite;"></div>`
              : ''
          }
          <!-- Teardrop shape pin rotated -45deg -->
          <div class="teardrop" style="
            width: 22px;
            height: 22px;
            background-color: ${markerColor};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg) ${isSelected ? 'scale(1.2)' : 'scale(1)'};
            box-shadow: 0px 2px 6px rgba(0,0,0,0.25);
            border: 1.5px solid #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          ">
            <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
              ${
                place.inPlan
                  ? `<span style="color: #FFFFFF; font-family: 'Inter_700Bold', sans-serif; font-size: 10px; font-weight: bold; line-height: 1;">${place.order}</span>`
                  : `<span style="color: #FFFFFF; font-size: 9px; line-height: 1;">
                      ${place.type === 'restaurant' ? '🍴' : place.type === 'market' ? '🛍️' : '📍'}
                     </span>`
              }
            </div>
          </div>
          <!-- White tooltip pill below marker -->
          <div class="marker-tooltip" style="
            position: absolute;
            top: 28px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #FFFFFF;
            color: #2C2420;
            padding: 3px 8px;
            border-radius: 999px;
            font-size: 9.5px;
            font-family: 'Inter_600SemiBold', sans-serif;
            font-weight: 600;
            white-space: nowrap;
            box-shadow: 0px 2px 6px rgba(44, 36, 32, 0.15);
            border: 1px solid #EFE7DC;
            pointer-events: none;
            opacity: ${isSelected ? 1 : 0};
            transition: opacity 0.2s ease;
            z-index: 1000;
          ">
            ${place.name}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([place.lat, place.lng], { icon: customIcon }).addTo(map);

      // Select place on click
      marker.on('click', () => {
        onSelectPlace(place);
      });

      // Show/hide tooltip on hover
      marker.on('mouseover', (e: any) => {
        const el = e.target.getElement();
        const tooltip = el?.querySelector('.marker-tooltip');
        if (tooltip) tooltip.style.opacity = '1';
      });

      marker.on('mouseout', (e: any) => {
        const el = e.target.getElement();
        const tooltip = el?.querySelector('.marker-tooltip');
        if (tooltip && selectedPlace?.id !== place.id) {
          tooltip.style.opacity = '0';
        }
      });

      // Right-click: Add or remove from itinerary
      marker.on('contextmenu', (e: any) => {
        e.originalEvent.preventDefault();
        if (onRightClickPlace) {
          onRightClickPlace(place);
        }
      });

      newLayers.push(marker);
    });

    layersRef.current = newLayers;
  }, [places, selectedPlace, L, map]);

  // Zoom handlers
  const zoomIn = () => {
    if (map) map.zoomIn();
  };

  const zoomOut = () => {
    if (map) map.zoomOut();
  };

  return (
    <View style={styles.container}>
      {/* Custom float Zoom controls */}
      <View style={styles.zoomControls}>
        <Pressable style={styles.zoomButton} onPress={zoomIn}>
          <Feather name="plus" size={18} color="#2C2420" />
        </Pressable>
        <Pressable style={styles.zoomButton} onPress={zoomOut}>
          <Feather name="minus" size={18} color="#2C2420" />
        </Pressable>
      </View>

      {/* Vanilla Leaflet Map DOM Target Container */}
      <div
        ref={mapContainerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
        }}
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
