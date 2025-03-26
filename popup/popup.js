/**
 * GeoExplorer AI Extension - Minimal Popup
 */

// Global variables
let map, infoWindow, geocoder, currentMarker, currentPosition, savedLocations = [];
let trafficLayer, transitLayer, bicyclingLayer;

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('GeoExplorer AI Popup initializing...');
  
  // Show placeholder in map div
  document.getElementById('map').innerHTML = '<div style="text-align:center;padding:20px;">Map display unavailable in extension popup due to API restrictions<br><br>API information will still be generated</div>';
  
  // Check if API keys are configured
  chrome.storage.local.get("apiKeys", function(config) {
    if (!config.apiKeys || !config.apiKeys.geminiApiKey) {
      showError("API keys not configured. Please visit the options page.");
      return;
    }
    
    // Initialize basic functionality
    initBasicFunctionality();
  });
});

// Initialize basic functionality without map dependency
function initBasicFunctionality() {
  // Set up event listeners
  document.getElementById("openOptions").addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });
  
  document.getElementById("searchButton").addEventListener('click', function() {
    const address = document.getElementById("locationSearch").value;
    if (address) {
      searchLocation(address);
    }
  });
  
  // Load saved locations if any
  loadSavedLocations();
  
  // Hide loading indicator
  hideLoading();
}

// Show loading indicator
function showLoading(message) {
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'loading-indicator';
  loadingDiv.innerHTML = `
    <div class="loading-spinner"></div>
    <p>${message || 'Loading...'}</p>
  `;
  document.body.appendChild(loadingDiv);
}

// Hide loading indicator
function hideLoading() {
  const loadingDivs = document.querySelectorAll('.loading-indicator');
  loadingDivs.forEach(div => div.remove());
}

// Show error message
function showError(message) {
  hideLoading();
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `
    <p>${message}</p>
    <button id="errorOkButton">Go to Options</button>
  `;
  document.body.appendChild(errorDiv);
  
  document.getElementById('errorOkButton').addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });
}

// Search for a location
function searchLocation(address) {
  // Update UI to show the search is being processed
  document.getElementById("coordinatesDisplay").textContent = `Searching for: ${address}`;
  document.getElementById("addressDisplay").textContent = "";
  
  // Instead of using the map, we'll just show the information
  document.getElementById("coordinatesDisplay").textContent = `Location: ${address}`;
  document.getElementById("addressDisplay").textContent = "Use Gemini AI to get information about this location";
  
  // Enable the save button
  document.getElementById("saveLocation").disabled = false;
  
  // Set a dummy current position
  currentPosition = { lat: 0, lng: 0, address: address };
}

// Load saved locations
function loadSavedLocations() {
  chrome.runtime.sendMessage({ type: "GET_SAVED_LOCATIONS" }, function(response) {
    if (response && response.success) {
      savedLocations = response.locations || [];
      updateSavedLocationsUI();
    } else {
      console.error("Error loading saved locations");
    }
  });
}

// Update saved locations in UI
function updateSavedLocationsUI() {
  const container = document.getElementById("savedLocations");
  
  if (!container) return;
  
  if (savedLocations.length === 0) {
    container.innerHTML = "<p>No saved locations yet.</p>";
    return;
  }
  
  container.innerHTML = "";
  
  savedLocations.forEach((location, index) => {
    const locationEl = document.createElement("div");
    locationEl.className = "saved-location";
    locationEl.innerHTML = `
      <div>${location.title}</div>
      <div style="text-align:right;">
        <button class="delete-location" data-index="${index}" style="background-color:#f44336;">Delete</button>
      </div>
    `;
    
    container.appendChild(locationEl);
  });
  
  // Add delete button functionality
  document.querySelectorAll(".delete-location").forEach(button => {
    button.addEventListener("click", function(e) {
      const index = parseInt(this.getAttribute("data-index"));
      if (confirm("Delete this saved location?")) {
        chrome.runtime.sendMessage({
          type: "DELETE_LOCATION",
          index: index
        }, function(response) {
          if (response && response.success) {
            loadSavedLocations();
          }
        });
      }
    });
  });
}