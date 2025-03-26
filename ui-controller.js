/**
 * GeoExplorer AI - UI Controller
 * Handles user interface interactions and event listeners
 * Adapted for Chrome Extension usage
 */

/**
 * Set up all UI event listeners
 */
function setupEventListeners() {
    // Map style selector
    document.getElementById("mapStyle").addEventListener("change", function() {
        applyMapStyle(this.value);
    });
    
    // Layer toggles
    document.getElementById("trafficLayer").addEventListener("change", function() {
        toggleLayer(trafficLayer, this.checked);
    });
    
    document.getElementById("transitLayer").addEventListener("change", function() {
        toggleLayer(transitLayer, this.checked);
    });
    
    document.getElementById("bicyclingLayer").addEventListener("change", function() {
        toggleLayer(bicyclingLayer, this.checked);
    });
    
    // Save location button
    document.getElementById("saveLocation").addEventListener("click", function() {
        if (currentPosition) {
            saveLocation();
        }
    });
    
    // Search button
    document.getElementById("searchButton").addEventListener("click", function() {
        const address = document.getElementById("locationSearch").value;
        if (address) {
            searchLocation(address);
        }
    });
    
    // Search input enter key
    document.getElementById("locationSearch").addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            const address = this.value;
            if (address) {
                searchLocation(address);
            }
        }
    });
    
    // Options page link
    document.getElementById("openOptions").addEventListener("click", function() {
        chrome.runtime.openOptionsPage();
    });
}

/**
 * Update the UI to display saved locations
 */
function updateSavedLocationsUI() {
    const container = document.getElementById("savedLocations");
    
    if (!container) {
        console.error("Saved locations container not found");
        return;
    }
    
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
            <div style="font-size: 0.8em; color: #666;">
                ${location.timestamp ? new Date(location.timestamp).toLocaleDateString() : 'New'}
            </div>
            <div style="text-align: right;">
                <button class="delete-location" data-index="${index}" style="background-color: #f44336;">Delete</button>
            </div>
        `;
        
        locationEl.addEventListener("click", function(e) {
            // Don't trigger if the delete button was clicked
            if (e.target.classList.contains('delete-location')) return;
            
            const latLng = new google.maps.LatLng(location.lat, location.lng);
            map.setCenter(latLng);
            map.setZoom(15);
            handleMapClick(latLng);
        });
        
        container.appendChild(locationEl);
    });
    
    // Add delete button functionality
    document.querySelectorAll(".delete-location").forEach(button => {
        button.addEventListener("click", function(e) {
            e.stopPropagation();
            const index = parseInt(this.getAttribute("data-index"));
            deleteLocation(index);
        });
    });
}

/**
 * Show loading indicator
 * @param {string} message - Optional message to display
 */
function showLoading(message) {
    // Create loading div if it doesn't exist
    if (!document.getElementById('loading-container')) {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-container';
        loadingDiv.className = 'loading-indicator';
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p id="loading-message">${message || 'Loading...'}</p>
        `;
        document.body.appendChild(loadingDiv);
    } else {
        document.getElementById('loading-message').textContent = message || 'Loading...';
    }
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    const loadingDiv = document.getElementById('loading-container');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    hideLoading();
    
    // Create error div
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <p>${message}</p>
        <button id="errorOkButton">Go to Options</button>
    `;
    document.body.appendChild(errorDiv);
    
    // Add click handler for OK button
    document.getElementById('errorOkButton').addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
    });
}