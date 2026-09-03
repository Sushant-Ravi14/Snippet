import * as ImageManipulator from 'expo-image-manipulator';
import * as Location from 'expo-location';

export const compressImage = async (uri) => {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};

export const getFormattedLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
    
    if (reverseGeocode && reverseGeocode.length > 0) {
      const place = reverseGeocode[0];
      const name = place.street || place.name || place.district;
      const city = place.city || place.subregion || place.region;
      
      let locality = '';
      if (name && city) locality = `${name}, ${city}`;
      else if (name) locality = name;
      else if (city) locality = city;
      else locality = 'Unknown location';

      return {
        latitude,
        longitude,
        locality,
      };
    }
    
    return { latitude, longitude, locality: 'Unknown location' };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

export const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
};

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
