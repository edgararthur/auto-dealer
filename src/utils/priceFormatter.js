/**
 * Enhanced Price formatting utilities for Ghana Cedis (GHS) with currency conversion
 */

// Currency conversion rates (base: GHS)
const EXCHANGE_RATES = {
  GHS: 1.0,        // Ghana Cedis (base)
  USD: 0.082,      // US Dollar
  EUR: 0.076,      // Euro
  GBP: 0.065,      // British Pound
  NGN: 135.0,      // Nigerian Naira
  XOF: 50.2,       // West African CFA Franc
  ZAR: 1.52,       // South African Rand
  KES: 10.8,       // Kenyan Shilling
  UGX: 308.0,      // Ugandan Shilling
  CAD: 0.112,      // Canadian Dollar
  AUD: 0.125       // Australian Dollar
};

// Currency symbols and locales
const CURRENCY_INFO = {
  GHS: { symbol: '₵', locale: 'en-GH', name: 'Ghana Cedi' },
  USD: { symbol: '$', locale: 'en-US', name: 'US Dollar' },
  EUR: { symbol: '€', locale: 'en-EU', name: 'Euro' },
  GBP: { symbol: '£', locale: 'en-GB', name: 'British Pound' },
  NGN: { symbol: '₦', locale: 'en-NG', name: 'Nigerian Naira' },
  XOF: { symbol: 'CFA', locale: 'fr-SN', name: 'West African CFA Franc' },
  ZAR: { symbol: 'R', locale: 'en-ZA', name: 'South African Rand' },
  KES: { symbol: 'KSh', locale: 'en-KE', name: 'Kenyan Shilling' },
  UGX: { symbol: 'USh', locale: 'en-UG', name: 'Ugandan Shilling' },
  CAD: { symbol: 'C$', locale: 'en-CA', name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', locale: 'en-AU', name: 'Australian Dollar' }
};

// Country to currency mapping
const COUNTRY_CURRENCY_MAP = {
  'GH': 'GHS', // Ghana
  'US': 'USD', // United States
  'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR',
  'GB': 'GBP', // United Kingdom
  'NG': 'NGN', // Nigeria
  'SN': 'XOF', 'ML': 'XOF', 'BF': 'XOF', 'CI': 'XOF',
  'ZA': 'ZAR', // South Africa
  'KE': 'KES', // Kenya
  'UG': 'UGX', // Uganda
  'CA': 'CAD', // Canada
  'AU': 'AUD'  // Australia
};

// Cache for user location and currency
let userLocation = null;
let userCurrency = 'GHS'; // Default to Ghana Cedis
let lastLocationCheck = null;

/**
 * Detect user location and set appropriate currency
 */
const detectUserLocation = async () => {
  // Don't check location more than once per hour
  if (lastLocationCheck && Date.now() - lastLocationCheck < 3600000) {
    return;
  }

  try {
    // Check if location is cached in localStorage
    const cachedLocation = localStorage.getItem('userLocation');
    const cachedCurrency = localStorage.getItem('userCurrency');
    
    if (cachedLocation && cachedCurrency) {
      userLocation = JSON.parse(cachedLocation);
      userCurrency = cachedCurrency;
      lastLocationCheck = Date.now();
      return;
    }

    // Try to get location from IP (using a free service)
    const response = await fetch('https://ipapi.co/json/', {
      timeout: 5000
    });
    
    if (response.ok) {
      const locationData = await response.json();
      userLocation = {
        country: locationData.country_code,
        countryName: locationData.country_name,
        city: locationData.city
      };
      
      // Set currency based on country
      userCurrency = COUNTRY_CURRENCY_MAP[locationData.country_code] || 'GHS';
      
      // Cache the results
      localStorage.setItem('userLocation', JSON.stringify(userLocation));
      localStorage.setItem('userCurrency', userCurrency);
      lastLocationCheck = Date.now();
      
      console.log(`🌍 Location detected: ${userLocation.countryName}, Currency: ${userCurrency}`);
    }
  } catch (error) {
    console.warn('Could not detect location, using default currency (GHS):', error);
    userCurrency = 'GHS';
  }
};

/**
 * Convert price from GHS to target currency
 */
const convertCurrency = (priceInGHS, targetCurrency = userCurrency) => {
  if (!priceInGHS && priceInGHS !== 0) return 0;
  if (targetCurrency === 'GHS') return priceInGHS;
  
  const rate = EXCHANGE_RATES[targetCurrency];
  if (!rate) return priceInGHS;
  
  return priceInGHS * rate;
};

/**
 * Format price with automatic currency detection and conversion
 */
export const formatPrice = (price, forceCurrency = null) => {
  if (!price && price !== 0) return 'Contact for price';
  
  const currency = forceCurrency || userCurrency;
  const convertedPrice = convertCurrency(price, currency);
  const currencyInfo = CURRENCY_INFO[currency];
  
  if (!currencyInfo) {
    return `₵${price.toFixed(2)}`;
  }
  
  return new Intl.NumberFormat(currencyInfo.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'UGX' ? 0 : 2,
    maximumFractionDigits: currency === 'UGX' ? 0 : 2
  }).format(convertedPrice);
};

/**
 * Format price with symbol only (for compact display)
 */
export const formatPriceCompact = (price, forceCurrency = null) => {
  if (!price && price !== 0) return 'Contact for price';
  
  const currency = forceCurrency || userCurrency;
  const convertedPrice = convertCurrency(price, currency);
  const currencyInfo = CURRENCY_INFO[currency];
  
  if (!currencyInfo) {
    return `₵${price.toFixed(2)}`;
  }
  
  const decimals = currency === 'UGX' ? 0 : 2;
  const formatted = new Intl.NumberFormat(currencyInfo.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(convertedPrice);
  
  return `${currencyInfo.symbol}${formatted}`;
};

/**
 * Get current user currency info
 */
export const getCurrentCurrency = () => {
  return {
    code: userCurrency,
    symbol: CURRENCY_INFO[userCurrency]?.symbol || '₵',
    name: CURRENCY_INFO[userCurrency]?.name || 'Ghana Cedi'
  };
};

/**
 * Manually set user currency (for currency selector)
 */
export const setUserCurrency = (currencyCode) => {
  if (CURRENCY_INFO[currencyCode]) {
    userCurrency = currencyCode;
    localStorage.setItem('userCurrency', currencyCode);
    localStorage.removeItem('userLocation');
  }
};

/**
 * Format price range
 */
export const formatPriceRange = (minPrice, maxPrice, forceCurrency = null) => {
  if (!minPrice && !maxPrice) return 'Contact for price';
  if (!maxPrice || minPrice === maxPrice) return formatPrice(minPrice, forceCurrency);
  
  return `${formatPrice(minPrice, forceCurrency)} - ${formatPrice(maxPrice, forceCurrency)}`;
};

/**
 * Format discount information
 */
export const formatDiscount = (originalPrice, discountPrice, forceCurrency = null) => {
  if (!originalPrice || !discountPrice) return null;
  
  const discountAmount = originalPrice - discountPrice;
  const discountPercent = Math.round((discountAmount / originalPrice) * 100);
  
  return {
    amount: formatPrice(discountAmount, forceCurrency),
    percentage: `${discountPercent}%`,
    savings: `You save ${formatPrice(discountAmount, forceCurrency)} (${discountPercent}%)`
  };
};

/**
 * Parse and format price from string or number
 */
export const parseAndFormatPrice = (price, forceCurrency = null) => {
  if (typeof price === 'string') {
    const numericPrice = parseFloat(price.replace(/[^0-9.-]/g, ''));
    return formatPrice(numericPrice, forceCurrency);
  }
  return formatPrice(price, forceCurrency);
};

/**
 * Initialize currency system (call this in your app startup)
 */
export const initializeCurrency = () => {
  const savedCurrency = localStorage.getItem('userCurrency');
  if (savedCurrency && CURRENCY_INFO[savedCurrency]) {
    userCurrency = savedCurrency;
  }
  
  if (!localStorage.getItem('userLocation') || !savedCurrency) {
    detectUserLocation();
  }
};

/**
 * Get supported currencies (for currency selector)
 */
export const getSupportedCurrencies = () => {
  return Object.entries(CURRENCY_INFO).map(([code, info]) => ({
    code,
    symbol: info.symbol,
    name: info.name
  }));
};

// Auto-initialize when module loads
initializeCurrency(); 