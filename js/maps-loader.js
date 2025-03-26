// This file is injected by the background script and loads Google Maps API
(function() {
    // The background script will replace this placeholder
    const API_KEY_PLACEHOLDER = "GOOGLE_MAPS_API_KEY";
    
    // Create script element for Google Maps
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY_PLACEHOLDER}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    // Add the script to the document
    document.head.appendChild(script);
  })();