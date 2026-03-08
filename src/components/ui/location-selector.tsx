import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Navigation, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

// Tunisia default coordinates
const TUNISIA_LAT = 33.8869;
const TUNISIA_LNG = 9.5375;

interface LocationSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (location: { 
    address: string; 
    latitude: number; 
    longitude: number; 
  }) => void;
  initialLocation?: string;
}

// Build "City, Region, Country" from Nominatim address
function formatAddress(addr: any): string {
  const city = addr.city || addr.town || addr.village || addr.municipality || addr.hamlet || addr.suburb || addr.district || addr.county || '';
  const country = addr.country || '';
  const parts: string[] = [];
  if (city) parts.push(city);
  if (country) parts.push(country);
  return parts.join(', ');
}

// Reverse geocode to get "City, Region, Country" format
async function reverseGeocodeCity(lat: number, lng: number, lang: string): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10&addressdetails=1`,
      { headers: { 'Accept-Language': lang } }
    );
    const data = await res.json();
    const formatted = formatAddress(data.address);
    return formatted || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

// Search for a city
async function searchCity(query: string, lang: string): Promise<{ name: string; lat: number; lon: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`,
      { headers: { 'Accept-Language': lang } }
    );
    const data = await res.json();
    if (data.length > 0) {
      const item = data[0];
      const name = formatAddress(item.address);
      return { name, lat: parseFloat(item.lat), lon: parseFloat(item.lon) };
    }
    return null;
  } catch {
    return null;
  }
}

// Inject leaflet CSS if not already present
function ensureLeafletCSS() {
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  open,
  onOpenChange,
  onLocationSelect,
  initialLocation,
}) => {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState(initialLocation || '');
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  const updateMarkerPosition = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    const city = await reverseGeocodeCity(lat, lng, lang);
    setSelectedLocation({ address: city, latitude: lat, longitude: lng });
    setSearchQuery(city);
    setLoading(false);
  }, [lang]);

  // Initialize map when dialog opens
  useEffect(() => {
    if (!open) {
      // Cleanup on close
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
      return;
    }

    ensureLeafletCSS();

    // Delay to let dialog render and CSS load
    const timer = setTimeout(async () => {
      if (!mapContainer.current || mapRef.current) return;

      const L = await import('leaflet');

      // Try to get user location first, fallback to Tunisia
      let startLat = TUNISIA_LAT;
      let startLng = TUNISIA_LNG;
      
      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
          });
          startLat = pos.coords.latitude;
          startLng = pos.coords.longitude;
        } catch {
          // Use Tunisia default
        }
      }

      const map = L.map(mapContainer.current, {
        center: [startLat, startLng],
        zoom: 6,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map);

      // Custom pin icon
      const icon = L.divIcon({
        html: `<div style="font-size: 32px; line-height: 1; transform: translate(-50%, -100%);">📍</div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([startLat, startLng], { icon, draggable: true }).addTo(map);
      markerRef.current = marker;
      mapRef.current = map;

      // Drag end → update city
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        updateMarkerPosition(pos.lat, pos.lng);
      });

      // Click map → move marker & update city
      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        updateMarkerPosition(e.latlng.lat, e.latlng.lng);
      });

      // Ensure proper sizing
      setTimeout(() => map.invalidateSize(), 100);
    }, 400);

    return () => clearTimeout(timer);
  }, [open, updateMarkerPosition]);

  const getCurrentLocation = () => {
    if (!('geolocation' in navigator)) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([latitude, longitude], 10);
          markerRef.current.setLatLng([latitude, longitude]);
        }
        await updateMarkerPosition(latitude, longitude);
      },
      () => {
        setLoading(false);
        toast({
          title: "Location error",
          description: "Could not get your current location",
          variant: "destructive",
        });
      }
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    const result = await searchCity(searchQuery, lang);
    if (result) {
      if (mapRef.current && markerRef.current) {
        mapRef.current.setView([result.lat, result.lon], 10);
        markerRef.current.setLatLng([result.lat, result.lon]);
      }
      setSelectedLocation({ address: result.name, latitude: result.lat, longitude: result.lon });
      setSearchQuery(result.name);
    } else {
      toast({
        title: "Not found",
        description: `Could not find "${searchQuery}"`,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Select City</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {/* Search */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city..."
                className="pl-9"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} variant="outline" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </Button>
          </div>

          {/* GPS */}
          <Button onClick={getCurrentLocation} variant="outline" className="w-full" disabled={loading}>
            <Navigation className="w-4 h-4 mr-2" />
            Use Current Location
          </Button>

          {/* Map */}
          <div
            ref={mapContainer}
            className="h-56 rounded-lg overflow-hidden border border-border"
            style={{ minHeight: 224, zIndex: 0 }}
          />
          <p className="text-xs text-muted-foreground text-center">
            Tap or drag the pin to select a city
          </p>

          {/* Selected city */}
          {selectedLocation && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <p className="font-medium text-sm">{selectedLocation.address}</p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedLocation} className="flex-1">
              Confirm City
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
