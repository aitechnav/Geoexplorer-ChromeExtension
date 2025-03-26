/**
 * GeoExplorer AI - Mocked Google Maps Implementation
 * This provides a lightweight implementation of Google Maps API
 * for Chrome Extensions to bypass CSP restrictions
 */
(function() {
  // Define the google maps namespace if it doesn't exist
  window.google = window.google || {};
  window.google.maps = window.google.maps || {};
  
  // Map constructor
  window.google.maps.Map = function(element, options) {
    console.log("Creating mock Map with options:", options);
    this.element = element;
    this.options = options || {};
    this.center = options.center || { lat: 0, lng: 0 };
    this.zoom = options.zoom || 10;
    this.mapTypeId = options.mapTypeId || "roadmap";
    this.styles = options.styles || [];
    
    // Add a placeholder map image to show something
    element.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background-color: #e0e0e0;">
        <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
          <h3>Map Placeholder</h3>
          <p>Centered at: ${this.center.lat}, ${this.center.lng}</p>
          <p>Due to Chrome Extension restrictions, a real map cannot be displayed.</p>
          <p>Please see the console for map interactions.</p>
        </div>
      </div>
    `;
    
    // Return methods
    return {
      setCenter: (center) => {
        console.log("Map.setCenter called with:", center);
        this.center = center;
      },
      getCenter: () => {
        console.log("Map.getCenter called");
        return {
          lat: () => this.center.lat,
          lng: () => this.center.lng
        };
      },
      setZoom: (zoom) => {
        console.log("Map.setZoom called with:", zoom);
        this.zoom = zoom;
      },
      setOptions: (options) => {
        console.log("Map.setOptions called with:", options);
        this.options = { ...this.options, ...options };
      },
      setMapTypeId: (mapTypeId) => {
        console.log("Map.setMapTypeId called with:", mapTypeId);
        this.mapTypeId = mapTypeId;
      },
      addListener: (eventName, callback) => {
        console.log(`Map.addListener called for event: ${eventName}`);
        
        // For click events, allow clicking on the map element
        if (eventName === 'click') {
          this.element.addEventListener('click', (e) => {
            // Simulate a map click event with mock coordinates
            const mockEvent = {
              latLng: {
                lat: () => this.center.lat + (Math.random() * 0.01 - 0.005),
                lng: () => this.center.lng + (Math.random() * 0.01 - 0.005)
              }
            };
            
            callback(mockEvent);
          });
        }
        
        return {
          remove: () => {
            console.log(`Listener for ${eventName} removed`);
          }
        };
      }
    };
  };
  
  // Marker constructor
  window.google.maps.Marker = function(options) {
    console.log("Creating marker at:", options?.position);
    
    return {
      setMap: function(map) {
        console.log("Marker.setMap called with:", map);
        return this;
      },
      getPosition: function() {
        return options?.position || { lat: 0, lng: 0 };
      },
      setPosition: function(position) {
        console.log("Marker.setPosition called with:", position);
        options.position = position;
      }
    };
  };
  
  // InfoWindow constructor
  window.google.maps.InfoWindow = function(options) {
    console.log("Creating InfoWindow with options:", options);
    let content = options?.content || "";
    let position = options?.position || null;
    
    return {
      setContent: function(newContent) {
        console.log("InfoWindow.setContent called with:", newContent);
        content = newContent;
      },
      setPosition: function(newPosition) {
        console.log("InfoWindow.setPosition called with:", newPosition);
        position = newPosition;
      },
      open: function(map, marker) {
        console.log("InfoWindow.open called with map:", map, "and marker:", marker);
        console.log("InfoWindow content:", content);
      },
      close: function() {
        console.log("InfoWindow.close called");
      }
    };
  };
  
  // Geocoder constructor
  window.google.maps.Geocoder = function() {
    return {
      geocode: function(request, callback) {
        console.log("Geocoder.geocode called with request:", request);
        
        setTimeout(function() {
          if (request.address) {
            // Simulating geocoding an address
            callback([{
              formatted_address: request.address,
              geometry: {
                location: {
                  lat: () => 38.8977 + (Math.random() * 0.01 - 0.005),
                  lng: () => -77.0365 + (Math.random() * 0.01 - 0.005)
                }
              }
            }], "OK");
          } else if (request.location) {
            // Simulating reverse geocoding
            let address = "Mock Address, Mock City, Mock Country";
            
            // Try to generate a more realistic address based on coordinates
            const lat = typeof request.location.lat === 'function' ? 
                        request.location.lat() : request.location.lat;
            const lng = typeof request.location.lng === 'function' ? 
                        request.location.lng() : request.location.lng;
                        
            // Very rough approximation for demonstration
            if (lat > 0) {
              address = lat > 30 ? "North America" : "Equatorial Region";
            } else {
              address = "Southern Hemisphere";
            }
            
            if (lng > 0) {
              address += ", Eastern Hemisphere";
            } else {
              address += ", Western Hemisphere";
            }
            
            address = `${lat.toFixed(4)}, ${lng.toFixed(4)}, ${address}`;
            
            callback([{
              formatted_address: address,
              geometry: {
                location: {
                  lat: () => lat,
                  lng: () => lng
                }
              }
            }], "OK");
          } else {
            callback([], "ZERO_RESULTS");
          }
        }, 300); // Simulate network delay
      }
    };
  };
  
  // Layer constructors
  window.google.maps.TrafficLayer = function() {
    return { setMap: function() { return this; } };
  };
  
  window.google.maps.TransitLayer = function() {
    return { setMap: function() { return this; } };
  };
  
  window.google.maps.BicyclingLayer = function() {
    return { setMap: function() { return this; } };
  };
  
  // LatLng constructor
  window.google.maps.LatLng = function(lat, lng) {
    return {
      lat: function() { return lat; },
      lng: function() { return lng; }
    };
  };
  
  // Constants
  window.google.maps.Animation = { DROP: "DROP" };
  window.google.maps.SymbolPath = { CIRCLE: "CIRCLE" };
  window.google.maps.ControlPosition = { 
    TOP_RIGHT: "TOP_RIGHT",
    TOP_LEFT: "TOP_LEFT",
    BOTTOM_RIGHT: "BOTTOM_RIGHT",
    BOTTOM_LEFT: "BOTTOM_LEFT"
  };
  window.google.maps.MapTypeControlStyle = { HORIZONTAL_BAR: "HORIZONTAL_BAR" };
  
  // Notify that our mocked API is ready
  console.log("Mocked Google Maps API is ready");
  
  // Call the initMap function if it exists
  if (typeof window.initMap === 'function') {
    window.initMap();
  }
})();