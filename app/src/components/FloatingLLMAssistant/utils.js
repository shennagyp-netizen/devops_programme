export const sanitizeInput = (input) => {
  if (!input) return '';
  
  // Comprehensive XSS and injection prevention
  return input
    // HTML entity encoding
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/`/g, '&#x60;')
    .replace(/=/g, '&#x3D;')
    // Event handler prevention
    .replace(/on\w+=/gi, 'data-')
    // JavaScript URI prevention
    .replace(/javascript:/gi, 'data:')
    // SQL injection markers (for defense in depth)
    .replace(/--/g, '--')
    .replace(/;/g, ';')
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, '');
};

export const validateLessonContext = (context) => {
  return context !== null && 
         context !== undefined && 
         typeof context === 'object' &&
         context !== null &&
         !Array.isArray(context);
};

export const isValidViewport = (viewport) => {
  return ['mobile', 'tablet', 'desktop'].includes(viewport);
};

export const shouldCacheQuery = (queryTimestamp) => {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
  return queryTimestamp > twentyFourHoursAgo;
};

export const formatQueryText = (text, maxLength = 1000) => {
  if (!text) return '';
  
  // Trim and limit length
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  
  // Truncate with ellipsis
  return trimmed.substring(0, maxLength - 3) + '...';
};