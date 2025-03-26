/**
 * GeoExplorer AI - Global Variables
 * Defines global variables used across the application
 */

// Global map variables
let map;
let infoWindow;
let geocoder;
let currentMarker;
let currentPosition;
let savedLocations = [];
let trafficLayer;
let transitLayer;
let bicyclingLayer;

// This will be called when Google Maps API loads
function initMap() {
    console.log("Google Maps API loaded");
}