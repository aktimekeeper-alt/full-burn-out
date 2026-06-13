import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';

interface Coords {
  latitude: number;
  longitude: number;
}

interface UseLocationReturn {
  startWatching: (callback: (coords: Coords) => void) => Promise<void>;
  stopWatching: () => void;
  getCurrentLocation: () => Promise<Coords | null>;
  hasPermission: boolean;
}

export function useLocation(): UseLocationReturn {
  const [hasPermission, setHasPermission] = useState(false);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
    };
  }, []);

  async function startWatching(callback: (coords: Coords) => void) {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
    }
    subscriptionRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 10,
      },
      (location) => {
        callback({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    );
  }

  function stopWatching() {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
  }

  async function getCurrentLocation(): Promise<Coords | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch {
      return null;
    }
  }

  return { startWatching, stopWatching, getCurrentLocation, hasPermission };
}
