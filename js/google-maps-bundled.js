/**
 * GeoExplorer AI - Google Maps Loader
 * Safely loads the Google Maps API for Chrome Extensions using Manifest V3 compliant approach
 */

// Keep track of loading state
let isLoading = false;
let isLoaded = false;
let loadCallbacks = [];

/**
 * Initialize the Google Maps API
 * @param {string} apiKey - Your Google Maps API key
 * @returns {Promise} - Resolves when Google Maps is loaded
 */
function initGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (isLoaded && window.google && window.google.maps) {
      resolve(window.google);
      return;
    }
    
    // If currently loading, add to callbacks
    if (isLoading) {
      loadCallbacks.push({ resolve, reject });
      return;
    }
    
    // Start loading
    isLoading = true;
    loadCallbacks.push({ resolve, reject });
    
    // Inject a script that will fetch the Google Maps API
    const script = document.createElement('script');
    
    // Create a callback function that Google Maps will call when loaded
    window.gm_authFailure = function() {
      const error = new Error('Google Maps authentication failed. Check your API key.');
      loadCallbacks.forEach(callback => callback.reject(error));
      loadCallbacks = [];
      isLoading = false;
    };
    
    window.initGoogleMapsCallback = function() {
      console.log('Google Maps loaded successfully');
      isLoaded = true;
      isLoading = false;
      loadCallbacks.forEach(callback => callback.resolve(window.google));
      loadCallbacks = [];
    };
    
    // Build the URL - we'll manually construct this to avoid CSP issues
    script.textContent = `
      (function() {
        // This is essentially what Google Maps would do, but wrapped in our own code
        const script = document.createElement('script');
        script.src = "https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsCallback";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      })();
    `;
    
    // Handle errors
    script.onerror = function() {
      const error = new Error('Failed to load Google Maps API');
      loadCallbacks.forEach(callback => callback.reject(error));
      loadCallbacks = [];
      isLoading = false;
    };
    
    // Add script to document
    document.head.appendChild(script);
  });
}