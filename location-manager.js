/**
 * GeoExplorer AI - Location Manager
 * Handles interactions with locations on the map
 * Adapted for Chrome Extension usage with messaging to background script
 */

/**
 * Handle map clicks - show info for clicked location
 * @param {Object} latLng - Clicked position with lat() and lng() methods
 */
async function handleMapClick(latLng) {
    console.log("handleMapClick called with:", latLng);
    
    if (!map || !infoWindow) {
        console.error("Map or InfoWindow not initialized");
        return;
    }
    
    // Extract latitude and longitude
    let lat, lng;
    
    // Handle both function and property patterns
    if (typeof latLng.lat === 'function') {
        lat = latLng.lat();
        lng = latLng.lng();
    } else {
        lat = latLng.lat;
        lng = latLng.lng;
    }
    
    console.log("Extracted coordinates:", lat, lng);
    
    currentPosition = { lat, lng };
    
    // Update UI with coordinates
    document.getElementById("coordinatesDisplay").textContent = 
        `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`;
    
    // Enable save button
    document.getElementById("saveLocation").disabled = false;
    
    // Clear previous marker
    if (currentMarker) {
        currentMarker.setMap(null);
    }
    
    // Add new marker
    currentMarker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        animation: google.maps.Animation.DROP
    });
    
    // Show loading message
    infoWindow.setContent("<div class='info-window'>Loading information...</div>");
    infoWindow.setPosition({ lat, lng });
    infoWindow.open(map, currentMarker);
    
    let address = null;
    
    try {
        // Get address from coordinates
        address = await reverseGeocode({ lat, lng });
        document.getElementById("addressDisplay").textContent = `Address: ${address}`;
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        document.getElementById("addressDisplay").textContent = "Address: Not available";
    }
    
    try {
        // Generate content using Gemini API via background script
        console.log("Requesting content from background script...");
        const response = await chrome.runtime.sendMessage({
            type: "GENERATE_CONTENT",
            lat,
            lng,
            address
        });
        
        console.log("Background script response:", response);
        
        if (response && response.success) {
            // Update InfoWindow with the generated content
            infoWindow.setContent(`<div class='info-window'>
                <h3>${address || 'Location Information'}</h3>
                <p>${response.content}</p>
            </div>`);
        } else {
            infoWindow.setContent(`<div class='info-window'>
                <h3>${address || 'Location Information'}</h3>
                <p>Error retrieving information: ${response?.error || 'Unknown error'}</p>
            </div>`);
        }
    } catch (error) {
        console.error("Error generating content:", error);
        infoWindow.setContent(`<div class='info-window'>
            <h3>${address || 'Location Information'}</h3>
            <p>Error retrieving information. Please check your API keys in the options page.</p>
        </div>`);
    }
}

/**
 * Perform reverse geocoding to find address from coordinates
 * @param {Object} latLng - Location coordinates
 * @returns {Promise<string|null>} - Formatted address or null if not found
 */
function reverseGeocode(latLng) {
    console.log("Reverse geocoding for:", latLng);
    
    return new Promise((resolve, reject) => {
        if (!geocoder) {
            console.error("Geocoder not initialized");
            reject(new Error("Geocoder not initialized"));
            return;
        }
        
        geocoder.geocode({ location: latLng }, (results, status) => {
            console.log("Geocoder response:", status, results);
            
            if (status === "OK" && results && results[0]) {
                resolve(results[0].formatted_address);
            } else {
                reject(new Error(`Reverse geocoding failed: ${status}`));
            }
        });
    });
}

/**
 * Perform geocoding to find a location by address
 * @param {string} address - Location address or name
 * @returns {Promise<Object>} - Coordinates or null if not found
 */
function geocodeAddress(address) {
    console.log("Geocoding address:", address);
    
    return new Promise((resolve, reject) => {
        if (!geocoder) {
            console.error("Geocoder not initialized");
            reject(new Error("Geocoder not initialized"));
            return;
        }
        
        geocoder.geocode({ address: address }, (results, status) => {
            console.log("Geocoder response:", status, results);
            
            if (status === "OK" && results && results[0]) {
                resolve(results[0].geometry.location);
            } else {
                reject(new Error(`Geocoding failed: ${status}`));
            }
        });
    });
}

/**
 * Save current location to favorites
 */
async function saveLocation() {
    console.log("Saving location:", currentPosition);
    
    if (!currentPosition) {
        console.error("No current position to save");
        return;
    }
    
    try {
        // Try to get address for location name
        const address = await reverseGeocode(currentPosition);
        const locationName = address.split(',')[0];
        
        const locationTitle = prompt("Enter a name for this location:", locationName);
        
        if (locationTitle) {
            const newLocation = {
                title: locationTitle,
                lat: currentPosition.lat,
                lng: currentPosition.lng
            };
            
            console.log("Sending save request to background script:", newLocation);
            
            // Save location via background script
            const response = await chrome.runtime.sendMessage({
                type: "SAVE_LOCATION",
                location: newLocation
            });
            
            console.log("Background script response:", response);
            
            if (response && response.success) {
                // Reload saved locations
                await loadSavedLocations();
            } else {
                console.error("Error saving location:", response?.error);
                alert("Error saving location. Please try again.");
            }
        }
    } catch (error) {
        console.error("Error in saveLocation:", error);
        
        const locationTitle = prompt("Enter a name for this location:", "Unnamed Location");
        
        if (locationTitle) {
            const newLocation = {
                title: locationTitle,
                lat: currentPosition.lat,
                lng: currentPosition.lng
            };
            
            // Save location via background script
            try {
                const response = await chrome.runtime.sendMessage({
                    type: "SAVE_LOCATION",
                    location: newLocation
                });
                
                if (response && response.success) {
                    // Reload saved locations
                    await loadSavedLocations();
                } else {
                    console.error("Error saving location:", response?.error);
                    alert("Error saving location. Please try again.");
                }
            } catch (err) {
                console.error("Error saving location:", err);
                alert("Error saving location. Please try again.");
            }
        }
    }
}

/**
 * Load saved locations from storage via background script
 */
async function loadSavedLocations() {
    console.log("Loading saved locations");
    
    try {
        const response = await chrome.runtime.sendMessage({
            type: "GET_SAVED_LOCATIONS"
        });
        
        console.log("Background script response:", response);
        
        if (response && response.success) {
            savedLocations = response.locations || [];
            updateSavedLocationsUI();
        } else {
            console.error("Error loading saved locations:", response?.error);
            savedLocations = [];
            updateSavedLocationsUI();
        }
    } catch (error) {
        console.error("Error loading saved locations:", error);
        savedLocations = [];
        updateSavedLocationsUI();
    }
}

/**
 * Delete a saved location
 * @param {number} index - Index of location to delete
 */
async function deleteLocation(index) {
    console.log("Deleting location at index:", index);
    
    if (confirm("Delete this saved location?")) {
        try {
            const response = await chrome.runtime.sendMessage({
                type: "DELETE_LOCATION",
                index: index
            });
            
            console.log("Background script response:", response);
            
            if (response && response.success) {
                await loadSavedLocations(); // Reload the list
            } else {
                console.error("Error deleting location:", response?.error);
                alert("Error deleting location. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting location:", error);
            alert("Error deleting location. Please try again.");
        }
    }
}

/**
 * Search for a location by address
 * @param {string} address - Location to search for
 */
async function searchLocation(address) {
    console.log("Searching for location:", address);
    
    try {
        const location = await geocodeAddress(address);
        console.log("Search result:", location);
        
        map.setCenter(location);
        handleMapClick(location);
    } catch (error) {
        console.error("Search error:", error);
        alert("Could not find location: " + error.message);
    }
}