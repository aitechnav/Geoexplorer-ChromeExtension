/**
 * GeoExplorer AI - Map Configuration
 * This file handles the creation and configuration of the Google Map
 * Adapted for Chrome Extension usage
 */

// Map configuration
function getMapConfig() {
    return {
        // Initial map center (Washington DC)
        center: { lat: 38.8920621, lng: -77.0199124 },
        zoom: 13,
        mapTypeId: "roadmap",
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_RIGHT,
        },
        fullscreenControl: true,
        streetViewControl: true,
        zoomControl: true
    };
}

// Initialize map and related services
function initializeMap(mapElement) {
    console.log("Map initialization started");
    
    // Create map
    map = new google.maps.Map(mapElement, getMapConfig());
    
    // Create layers
    trafficLayer = new google.maps.TrafficLayer();
    transitLayer = new google.maps.TransitLayer();
    bicyclingLayer = new google.maps.BicyclingLayer();
    
    // Create InfoWindow
    infoWindow = new google.maps.InfoWindow({
        maxWidth: 300
    });
    
    // Try to get user's location
    getUserLocation();
    
    // Add click listener
    map.addListener("click", async (event) => {
        // Create a LatLng object from the clicked position
        const latLng = {
            lat: () => event.latLng.lat(),
            lng: () => event.latLng.lng()
        };
        await handleMapClick(latLng);
    });
    
    return map;
}

// Try to get the user's current location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                map.setCenter(userLocation);
                
                // Add marker for user's location
                new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: "#4285F4",
                        fillOpacity: 1,
                        strokeColor: "#FFFFFF",
                        strokeWeight: 2,
                    },
                    title: "Your Location",
                });
            },
            () => {
                console.log("Error: The Geolocation service failed.");
            }
        );
    }
}

// Apply a map style
function applyMapStyle(styleValue) {
    if (!map) return;
    
    if (styleValue === "default") {
        map.setMapTypeId("roadmap");
        map.setOptions({ styles: [] });
    } else if (styleValue === "satellite") {
        map.setMapTypeId("satellite");
    } else if (styleValue === "terrain") {
        map.setMapTypeId("terrain");
    } else if (mapStyles[styleValue]) {
        map.setMapTypeId("roadmap");
        map.setOptions({ styles: mapStyles[styleValue] });
    }
}

// Toggle map layers
function toggleLayer(layer, isVisible) {
    if (!map) return;
    isVisible ? layer.setMap(map) : layer.setMap(null);
}