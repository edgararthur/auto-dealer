/**
 * Text Sanitizer Utility
 * Intelligently replaces unprofessional or competitor references with appropriate marketplace language
 */

/**
 * Sanitizes product descriptions and other text content
 * @param {string} text - The text to sanitize
 * @param {string} type - Type of content ('description', 'title', 'short_description')
 * @returns {string} - Sanitized text
 */
export const sanitizeText = (text, type = 'description') => {
  if (!text || typeof text !== 'string') return text;

  let sanitized = text;

  // eBay-specific replacements
  const ebayReplacements = [
    {
      pattern: /sourced from ebay motors?/gi,
      replacement: 'Professionally sourced'
    },
    {
      pattern: /sourced from ebay/gi,
      replacement: 'Professionally sourced'
    },
    {
      pattern: /ebay motors? verified/gi,
      replacement: 'Quality verified'
    },
    {
      pattern: /ebay motors?/gi,
      replacement: 'our marketplace'
    },
    {
      pattern: /\bebay\b/gi,
      replacement: 'our marketplace'
    },
    {
      pattern: /with quality verification from ebay/gi,
      replacement: 'with quality verification'
    }
  ];

  // Amazon-specific replacements
  const amazonReplacements = [
    {
      pattern: /amazon\.com/gi,
      replacement: 'our marketplace'
    },
    {
      pattern: /amazon prime/gi,
      replacement: 'fast shipping'
    },
    {
      pattern: /amazon verified/gi,
      replacement: 'quality verified'
    }
  ];

  // Generic competitor replacements
  const competitorReplacements = [
    {
      pattern: /autozone/gi,
      replacement: 'auto parts retailers'
    },
    {
      pattern: /advance auto parts?/gi,
      replacement: 'auto parts retailers'
    },
    {
      pattern: /o'?reilly'?s?/gi,
      replacement: 'auto parts retailers'
    },
    {
      pattern: /napa auto parts?/gi,
      replacement: 'auto parts retailers'
    },
    {
      pattern: /pepboys/gi,
      replacement: 'auto parts retailers'
    }
  ];

  // Professional enhancement replacements
  const professionalReplacements = [
    {
      pattern: /cheap/gi,
      replacement: 'affordable'
    },
    {
      pattern: /super cheap/gi,
      replacement: 'competitively priced'
    },
    {
      pattern: /dirt cheap/gi,
      replacement: 'budget-friendly'
    },
    {
      pattern: /knock-?off/gi,
      replacement: 'aftermarket'
    },
    {
      pattern: /chinese made/gi,
      replacement: 'manufactured overseas'
    },
    {
      pattern: /made in china/gi,
      replacement: 'manufactured overseas'
    }
  ];

  // Quality assurance replacements
  const qualityReplacements = [
    {
      pattern: /no warranty/gi,
      replacement: 'limited warranty available'
    },
    {
      pattern: /as-?is condition/gi,
      replacement: 'sold in current condition'
    },
    {
      pattern: /buyer beware/gi,
      replacement: 'please review specifications carefully'
    },
    {
      pattern: /not responsible for/gi,
      replacement: 'please note'
    }
  ];

  // Apply all replacements
  const allReplacements = [
    ...ebayReplacements,
    ...amazonReplacements,
    ...competitorReplacements,
    ...professionalReplacements,
    ...qualityReplacements
  ];

  allReplacements.forEach(({ pattern, replacement }) => {
    sanitized = sanitized.replace(pattern, replacement);
  });

  // Clean up multiple spaces and normalize punctuation
  sanitized = sanitized
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .replace(/\s+\./g, '.') // Space before period
    .replace(/\s+,/g, ',') // Space before comma
    .replace(/\.\s*\./g, '.') // Multiple periods
    .trim();

  // Capitalize first letter if it's a description
  if (type === 'description' && sanitized.length > 0) {
    sanitized = sanitized.charAt(0).toUpperCase() + sanitized.slice(1);
  }

  return sanitized;
};

/**
 * Sanitizes product object with all text fields
 * @param {Object} product - Product object
 * @returns {Object} - Product with sanitized text fields
 */
export const sanitizeProduct = (product) => {
  if (!product || typeof product !== 'object') return product;

  const sanitized = { ...product };

  // Sanitize common text fields
  if (sanitized.name) {
    sanitized.name = sanitizeText(sanitized.name, 'title');
  }
  
  if (sanitized.description) {
    sanitized.description = sanitizeText(sanitized.description, 'description');
  }
  
  if (sanitized.short_description) {
    sanitized.short_description = sanitizeText(sanitized.short_description, 'short_description');
  }

  // Sanitize specifications if it's a string
  if (sanitized.specifications && typeof sanitized.specifications === 'string') {
    sanitized.specifications = sanitizeText(sanitized.specifications, 'description');
  }

  // Sanitize warranty info
  if (sanitized.warranty_info && typeof sanitized.warranty_info === 'string') {
    sanitized.warranty_info = sanitizeText(sanitized.warranty_info, 'description');
  }

  return sanitized;
};

/**
 * Sanitizes an array of products
 * @param {Array} products - Array of product objects
 * @returns {Array} - Array of sanitized products
 */
export const sanitizeProducts = (products) => {
  if (!Array.isArray(products)) return products;
  
  return products.map(product => sanitizeProduct(product));
};

/**
 * Adds professional marketplace language to descriptions
 * @param {string} description - Original description
 * @returns {string} - Enhanced description
 */
export const enhanceDescription = (description) => {
  if (!description) return description;

  let enhanced = sanitizeText(description);

  // Add professional marketplace context if description is too short
  if (enhanced.length < 50) {
    enhanced += ' Available through our verified dealer network with quality assurance.';
  }

  // Add marketplace benefits if not already mentioned
  if (!enhanced.toLowerCase().includes('shipping') && !enhanced.toLowerCase().includes('delivery')) {
    enhanced += ' Fast shipping available from multiple dealers.';
  }

  return enhanced;
};

export default {
  sanitizeText,
  sanitizeProduct,
  sanitizeProducts,
  enhanceDescription
};
