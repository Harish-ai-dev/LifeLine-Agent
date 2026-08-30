'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  color: string;
  popupHtml: string;
  isPulsing?: boolean;
}

interface LeafletMapProps {
  markers: MarkerData[];
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  drawRoute?: {
    start: { lat: number; lng: number };
    end: { lat: number; lng: number };
  } | null;
}

export default function LeafletMap({
  markers,
  centerLat = 19.0760,
  centerLng = 72.8777,
  zoom = 11,
  selectedId,
  onSelect,
  drawRoute
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        zoomControl: false,
      }).setView([centerLat, centerLng], zoom);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;
    
    // Clear all existing markers/layers except the tile layer
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Add Markers
    markers.forEach(m => {
      const isSelected = selectedId === m.id;
      const markerColor = isSelected ? '#4f46e5' : m.color;
      const shadow = isSelected ? '0 0 0 4px rgba(79, 70, 229, 0.2)' : '0 1px 3px rgba(0,0,0,0.3)';
      const anim = m.isPulsing ? 'animate-pulse' : '';
      
      const html = `<div class="${anim}" style="background-color: ${markerColor}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: ${shadow};"></div>`;

      const icon = L.divIcon({
        html,
        className: '',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);
      marker.bindPopup(m.popupHtml);
      
      if (onSelect) {
        marker.on('click', () => {
          onSelect(m.id);
          marker.openPopup();
        });
      }
    });

    // Draw Route if provided (simulated simple polyline)
    if (drawRoute) {
      const latlngs = [
        [drawRoute.start.lat, drawRoute.start.lng],
        [drawRoute.end.lat, drawRoute.end.lng]
      ] as L.LatLngExpression[];
      
      L.polyline(latlngs, {
        color: '#4f46e5',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.7
      }).addTo(map);
    }

  }, [markers, centerLat, centerLng, zoom, selectedId, onSelect, drawRoute]);

  return <div ref={containerRef} className="w-full h-full min-h-[300px] z-0" />;
}
