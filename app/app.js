/**
 * GeoExplorer AI - Main Application Script
 * Initializes the application and handles the main workflow
 */

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Check if API keys are configured
        const config = await chrome.storage.local.get("apiKeys");
        if (!config.apiKeys || !config.apiKeys.googleMapsApiKey || !config.apiKeys.geminiApiKey) {
            showError("API keys are not configured. Please go to the options page to set them up.");
            return;
        }
        
        // Show loading indicator
        showLoading("Loading maps and services...");
        
        // Get the Google Maps API key from the background script
        const response = await chrome.runtime.sendMessage({
            type: "PREPARE_GOOGLE_MAPS_LOADER"
        });
        
        if (!response.success) {
            throw new Error("Failed to get Google Maps API key: " + response.error);
        }
        
        // Load Google Maps API using the extension-maps.js stub
        // This is a workaround for CSP restrictions in Chrome extensions
        window.google = window.google || {};
        window.google.maps = window.google.maps || {};
        
        // Mock Google Maps initialization
        initGoogleMaps(response.apiKey);
        
        // Now initialize the app with the mock Google Maps
        initializeApp();
    } catch (error) {
        console.error("Error initializing app:", error);
        showError("Error initializing application: " + error.message);
    }
});

// Function to initialize Google Maps with a mocked version
function initGoogleMaps(apiKey) {
    console.log("Initializing mocked Google Maps with API key:", apiKey);
    
    // Use the extension-maps.js stub which provides minimal Google Maps functionality
    // This is already included in your code
    
    // For debugging
    console.log("Google maps object:", window.google.maps);
    
    // Simulate the maps loading callback
    if (typeof window.googleMapsLoaded === 'function') {
        window.googleMapsLoaded();
    }
}

// Function to initialize the app after Google Maps is loaded
function initializeApp() {
    try {
        // Initialize Google Maps components
        geocoder = new google.maps.Geocoder();
        const mapElement = document.getElementById('map');
        
        // Initialize the map
        initializeMap(mapElement);
        
        // Set up event listeners for UI controls
        setupEventListeners();
        
        // Load saved locations
        loadSavedLocations();
        
        // Initialize chat interface
        initChatInterface();
        
        // Hide loading indicator
        hideLoading();
    } catch (error) {
        console.error("Error in app initialization:", error);
        showError("Error initializing application: " + error.message);
    }
}