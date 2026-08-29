"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Hospital {
  name: string;
  lat: number;
  lng: number;
  icu_beds?: number;
  distance_km?: number;
  eta_minutes?: number;
}

interface MapComponentProps {
  patientLocation: { lat: number; lng: number };
  chosenHospital?: Hospital | null;
}

export default function MapComponent({
  patientLocation,
  chosenHospital,
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [patientLocation.lat, patientLocation.lng],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }
      ).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markers = markersRef.current;
    if (!map || !markers) return;

    markers.clearLayers();

    // Patient marker
    const patientIcon = L.divIcon({
      className: "custom-patient-marker",
      html: `
        <div style="background-color: #ef4444; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 0 12px rgba(239, 68, 68, 0.6);">
          <span style="color: white; font-size: 14px; font-weight: bold;">🚨</span>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const patientMarker = L.marker([patientLocation.lat, patientLocation.lng], {
      icon: patientIcon,
    }).bindPopup(
      `<div style="font-family: sans-serif; color: #1e293b;"><strong>Patient Incident Location</strong><br/>Lat: ${patientLocation.lat}, Lng: ${patientLocation.lng}</div>`
    );
    markers.addLayer(patientMarker);

    // Chosen Hospital marker & Route
    if (chosenHospital) {
      const hospitalIcon = L.divIcon({
        className: "custom-hospital-marker",
        html: `
          <div style="background-color: #10b981; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 0 15px rgba(16, 185, 129, 0.7);">
            <span style="color: white; font-size: 16px; font-weight: bold;">🏥</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const destMarker = L.marker([chosenHospital.lat, chosenHospital.lng], {
        icon: hospitalIcon,
      }).bindPopup(
        `<div style="font-family: sans-serif; color: #1e293b;"><strong>${chosenHospital.name}</strong><br/>Status: <em>Assigned Destination</em><br/>ETA: ${chosenHospital.eta_minutes || "—"} min</div>`
      );
      markers.addLayer(destMarker);

      const routeLine = L.polyline(
        [
          [patientLocation.lat, patientLocation.lng],
          [chosenHospital.lat, chosenHospital.lng],
        ],
        {
          color: "#3b82f6",
          weight: 4,
          opacity: 0.85,
          dashArray: "8, 8",
        }
      );
      markers.addLayer(routeLine);

      const bounds = L.latLngBounds([
        [patientLocation.lat, patientLocation.lng],
        [chosenHospital.lat, chosenHospital.lng],
      ]);
      map.fitBounds(bounds, { padding: [40, 40] });
    } else {
      map.setView([patientLocation.lat, patientLocation.lng], 13);
    }
  }, [patientLocation, chosenHospital]);

  return (
    <div className="w-full h-72 rounded-2xl overflow-hidden border border-slate-800 shadow-inner relative z-0">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
