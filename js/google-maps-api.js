/**
 * GeoExplorer AI - Google Maps API Loader
 * This file serves as a proxy to load the Google Maps API in a way that complies
 * with Chrome Extension's Content Security Policy.
 */

// Will be replaced with the actual API key by the background script
const GOOGLE_MAPS_API_KEY = "__API_KEY_PLACEHOLDER__";

// Create a script element to load the Google Maps API
(function() {
  console.log("Google Maps loader script executing with key:", GOOGLE_MAPS_API_KEY);
  
  // We need to inject a script tag that loads from an external source
  // To do this in a way that bypasses CSP, we create a script element with inline code
  const scriptText = `
    (function() {
      const script = document.createElement('script');
      script.src = "https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    })();
  `;
  
  // Create a blob URL for our script content
  const blob = new Blob([scriptText], { type: 'application/javascript' });
  const scriptUrl = URL.createObjectURL(blob);
  
  // Load the script via blob URL (which is allowed by CSP)
  const script = document.createElement('script');
  script.src = scriptUrl;
  document.head.appendChild(script);
})();