/**
 * Location Detection Utility
 * Detects user's location based on browser APIs and IP geolocation
 */

// Country code to flag emoji mapping
const countryFlags = {
  'US': '🇺🇸',
  'CA': '🇨🇦',
  'GB': '🇬🇧',
  'AU': '🇦🇺',
  'DE': '🇩🇪',
  'FR': '🇫🇷',
  'IT': '🇮🇹',
  'ES': '🇪🇸',
  'JP': '🇯🇵',
  'KR': '🇰🇷',
  'CN': '🇨🇳',
  'IN': '🇮🇳',
  'BR': '🇧🇷',
  'MX': '🇲🇽',
  'NL': '🇳🇱',
  'SE': '🇸🇪',
  'NO': '🇳🇴',
  'DK': '🇩🇰',
  'FI': '🇫🇮',
  'CH': '🇨🇭',
  'AT': '🇦🇹',
  'BE': '🇧🇪',
  'IE': '🇮🇪',
  'PT': '🇵🇹',
  'GR': '🇬🇷',
  'PL': '🇵🇱',
  'CZ': '🇨🇿',
  'HU': '🇭🇺',
  'RO': '🇷🇴',
  'BG': '🇧🇬',
  'HR': '🇭🇷',
  'SK': '🇸🇰',
  'SI': '🇸🇮',
  'LT': '🇱🇹',
  'LV': '🇱🇻',
  'EE': '🇪🇪',
  'MT': '🇲🇹',
  'CY': '🇨🇾',
  'LU': '🇱🇺',
  'IS': '🇮🇸',
  'LI': '🇱🇮',
  'MC': '🇲🇨',
  'SM': '🇸🇲',
  'VA': '🇻🇦',
  'AD': '🇦🇩'
};

// Country code to country name mapping
const countryNames = {
  'US': 'United States',
  'CA': 'Canada',
  'GB': 'United Kingdom',
  'AU': 'Australia',
  'DE': 'Germany',
  'FR': 'France',
  'IT': 'Italy',
  'ES': 'Spain',
  'JP': 'Japan',
  'KR': 'South Korea',
  'CN': 'China',
  'IN': 'India',
  'BR': 'Brazil',
  'MX': 'Mexico',
  'NL': 'Netherlands',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'CH': 'Switzerland',
  'AT': 'Austria',
  'BE': 'Belgium',
  'IE': 'Ireland',
  'PT': 'Portugal',
  'GR': 'Greece',
  'PL': 'Poland',
  'CZ': 'Czech Republic',
  'HU': 'Hungary',
  'RO': 'Romania',
  'BG': 'Bulgaria',
  'HR': 'Croatia',
  'SK': 'Slovakia',
  'SI': 'Slovenia',
  'LT': 'Lithuania',
  'LV': 'Latvia',
  'EE': 'Estonia',
  'MT': 'Malta',
  'CY': 'Cyprus',
  'LU': 'Luxembourg',
  'IS': 'Iceland',
  'LI': 'Liechtenstein',
  'MC': 'Monaco',
  'SM': 'San Marino',
  'VA': 'Vatican City',
  'AD': 'Andorra'
};

/**
 * Get user's location using browser APIs
 * @returns {Promise<Object>} Location object with country, countryCode, flag, etc.
 */
export const getUserLocation = async () => {
  try {
    // First try to get from localStorage cache
    const cachedLocation = localStorage.getItem('userLocation');
    const cacheTimestamp = localStorage.getItem('userLocationTimestamp');
    
    // Use cached location if it's less than 24 hours old
    if (cachedLocation && cacheTimestamp) {
      const cacheAge = Date.now() - parseInt(cacheTimestamp);
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (cacheAge < twentyFourHours) {
        return JSON.parse(cachedLocation);
      }
    }

    // Try multiple methods to detect location
    let locationData = null;

    // Method 1: Try browser's Intl API (most reliable for timezone-based detection)
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      locationData = await getLocationFromTimezone(timezone);
    } catch (error) {
      console.log('Timezone detection failed:', error);
    }

    // Method 2: Try IP-based geolocation as fallback
    if (!locationData) {
      try {
        locationData = await getLocationFromIP();
      } catch (error) {
        console.log('IP geolocation failed:', error);
      }
    }

    // Method 3: Use browser language as last resort
    if (!locationData) {
      locationData = getLocationFromLanguage();
    }

    // Cache the result
    if (locationData) {
      localStorage.setItem('userLocation', JSON.stringify(locationData));
      localStorage.setItem('userLocationTimestamp', Date.now().toString());
    }

    return locationData;
  } catch (error) {
    console.error('Error detecting user location:', error);
    return getDefaultLocation();
  }
};

/**
 * Get location from timezone
 */
const getLocationFromTimezone = async (timezone) => {
  // Simple timezone to country mapping for common cases
  const timezoneCountryMap = {
    'America/New_York': 'US',
    'America/Chicago': 'US',
    'America/Denver': 'US',
    'America/Los_Angeles': 'US',
    'America/Toronto': 'CA',
    'America/Vancouver': 'CA',
    'Europe/London': 'GB',
    'Europe/Berlin': 'DE',
    'Europe/Paris': 'FR',
    'Europe/Rome': 'IT',
    'Europe/Madrid': 'ES',
    'Asia/Tokyo': 'JP',
    'Asia/Seoul': 'KR',
    'Asia/Shanghai': 'CN',
    'Asia/Kolkata': 'IN',
    'Australia/Sydney': 'AU',
    'Australia/Melbourne': 'AU'
  };

  const countryCode = timezoneCountryMap[timezone];
  if (countryCode) {
    return createLocationObject(countryCode);
  }

  // Extract country from timezone string
  const parts = timezone.split('/');
  if (parts.length >= 2) {
    const region = parts[0];
    if (region === 'America') {
      return createLocationObject('US'); // Default to US for America
    } else if (region === 'Europe') {
      return createLocationObject('GB'); // Default to UK for Europe
    } else if (region === 'Asia') {
      return createLocationObject('JP'); // Default to Japan for Asia
    } else if (region === 'Australia') {
      return createLocationObject('AU');
    }
  }

  return null;
};

/**
 * Get location from IP using a free service
 */
const getLocationFromIP = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      timeout: 5000
    });
    const data = await response.json();
    
    if (data.country_code) {
      return createLocationObject(data.country_code.toUpperCase());
    }
  } catch (error) {
    console.log('IP geolocation service failed:', error);
  }

  return null;
};

/**
 * Get location from browser language
 */
const getLocationFromLanguage = () => {
  const language = navigator.language || navigator.languages?.[0] || 'en-US';
  const parts = language.split('-');
  
  if (parts.length >= 2) {
    const countryCode = parts[1].toUpperCase();
    if (countryNames[countryCode]) {
      return createLocationObject(countryCode);
    }
  }

  // Default based on language
  if (language.startsWith('en')) return createLocationObject('US');
  if (language.startsWith('fr')) return createLocationObject('FR');
  if (language.startsWith('de')) return createLocationObject('DE');
  if (language.startsWith('es')) return createLocationObject('ES');
  if (language.startsWith('it')) return createLocationObject('IT');
  if (language.startsWith('ja')) return createLocationObject('JP');
  if (language.startsWith('ko')) return createLocationObject('KR');
  if (language.startsWith('zh')) return createLocationObject('CN');

  return getDefaultLocation();
};

/**
 * Create location object from country code
 */
const createLocationObject = (countryCode) => {
  return {
    countryCode,
    countryName: countryNames[countryCode] || 'Unknown',
    flag: countryFlags[countryCode] || '🌍',
    detected: true,
    timestamp: Date.now()
  };
};

/**
 * Get default location (US)
 */
const getDefaultLocation = () => {
  return {
    countryCode: 'US',
    countryName: 'United States',
    flag: '🇺🇸',
    detected: false,
    timestamp: Date.now()
  };
};

/**
 * Format shipping text for display
 */
export const formatShippingText = (location) => {
  if (!location) {
    return '🇺🇸 Ship to United States';
  }
  
  return `${location.flag} Ship to ${location.countryName}`;
};

/**
 * Clear cached location (useful for testing or user preference changes)
 */
export const clearLocationCache = () => {
  localStorage.removeItem('userLocation');
  localStorage.removeItem('userLocationTimestamp');
};

export default {
  getUserLocation,
  formatShippingText,
  clearLocationCache
};
