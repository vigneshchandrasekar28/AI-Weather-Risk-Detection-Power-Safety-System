import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { GeocodedLocation, WeatherData, RiskAnalysis } from '../types';
import { Map, MapPin, Compass, Navigation } from 'lucide-react';

interface WeatherMapSectionProps {
  location: GeocodedLocation;
  weather: WeatherData;
  risk: RiskAnalysis;
}

export const WeatherMapSection: React.FC<WeatherMapSectionProps> = ({
  location,
  weather,
  risk
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Fix default Leaflet icon paths in React/bundlers
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const lat = location.lat || 11.0168;
    const lon = location.lon || 76.9558;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lon],
        zoom: 10,
        scrollWheelZoom: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      // Create marker with popup
      const marker = L.marker([lat, lon]).addTo(map);
      marker
        .bindPopup(
          `<strong>${location.displayName}</strong><br/>Temp: ${weather.temp}°C | Risk: ${risk.score}/100 (${risk.level})`
        )
        .openPopup();

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      const map = mapInstanceRef.current;
      map.setView([lat, lon], 10, { animate: true });
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
        markerRef.current
          .bindPopup(
            `<strong>${location.displayName}</strong><br/>Temp: ${weather.temp}°C | Risk: ${risk.score}/100 (${risk.level})`
          )
          .openPopup();
      }
    }

    return () => {
      // Map cleanup on unmount
    };
  }, [location.lat, location.lon, location.displayName, weather.temp, risk.score, risk.level]);

  return (
    <section id="weatherMapSection" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Interactive Regional Weather & Grid Map &bull; {location.name}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic positioning and meteorological telemetry station coordinates
          </p>
        </div>

        {/* Geographic Coordinates Display */}
        <div className="flex items-center gap-3 text-xs bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl font-mono text-slate-700 self-start sm:self-auto">
          <div className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-sky-600" />
            <span>Lat: {location.lat.toFixed(4)}&deg;N</span>
          </div>
          <div className="flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-indigo-600" />
            <span>Lon: {location.lon.toFixed(4)}&deg;E</span>
          </div>
        </div>
      </div>

      {/* Leaflet Map Frame */}
      <div className="relative w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-slate-200 shadow-inner z-0">
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {/* Map Overlay Card */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs border border-slate-200 p-3 rounded-xl shadow-md text-xs max-w-xs space-y-1">
          <div className="font-extrabold text-slate-900 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            <span>{location.displayName}</span>
          </div>
          <div className="text-[11px] text-slate-600 flex justify-between gap-3">
            <span>Condition: <strong>{weather.condition}</strong></span>
            <span>Risk Score: <strong className={risk.score >= 60 ? 'text-red-600' : 'text-slate-800'}>{risk.score}/100</strong></span>
          </div>
          <div className="text-[10px] text-slate-400">
            OpenStreetMap geospatial tiles &bull; Indian sub-continent boundaries
          </div>
        </div>
      </div>
    </section>
  );
};
