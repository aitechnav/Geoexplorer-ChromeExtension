/**
 * GeoExplorer AI - API Service
 * Handles communication with external APIs
 * Adapted for Chrome Extension usage by delegating to background script
 * 
 * Note: In the extension version, most API calls are now handled by the background script
 * to avoid CORS issues. This file now acts as a wrapper around chrome.runtime.sendMessage
 * to maintain similar interface as the original web application.
 */

/**
 * Generate content about a location using Google's Gemini API via background script
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} address - Optional address information
 * @returns {Promise<string>} - Location description
 */
async function generateContent(lat, lng, address = null) {
    try {
        const response = await chrome.runtime.sendMessage({
            type: "GENERATE_CONTENT",
            lat,
            lng,
            address
        });
        
        if (response.success) {
            return response.content;
        } else {
            throw new Error(response.error || "Failed to generate content");
        }
    } catch (error) {
        console.error("Error generating content:", error);
        throw error;
    }
}

/**
 * Generate chat response using Google's Gemini API via background script
 * @param {string} message - User's message
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} address - Optional address information
 * @returns {Promise<string>} - AI response
 */
async function generateChatResponse(message, lat, lng, address = null) {
    try {
        const response = await chrome.runtime.sendMessage({
            type: "GENERATE_CHAT_RESPONSE",
            message,
            lat,
            lng,
            address
        });
        
        if (response.success) {
            return response.response;
        } else {
            throw new Error(response.error || "Failed to generate chat response");
        }
    } catch (error) {
        console.error("Error generating chat response:", error);
        throw error;
    }
}

/**
 * Save a location to storage via background script
 * @param {Object} location - Location data
 * @returns {Promise<boolean>} - Success indicator
 */
async function saveLocationToStorage(location) {
    try {
        const response = await chrome.runtime.sendMessage({
            type: "SAVE_LOCATION",
            location
        });
        
        return response.success;
    } catch (error) {
        console.error("Error saving location:", error);
        throw error;
    }
}

/**
 * Get saved locations from storage via background script
 * @returns {Promise<Array>} - Array of saved locations
 */
async function getSavedLocationsFromStorage() {
    try {
        const response = await chrome.runtime.sendMessage({
            type: "GET_SAVED_LOCATIONS"
        });
        
        if (response.success) {
            return response.locations;
        } else {
            throw new Error(response.error || "Failed to get saved locations");
        }
    } catch (error) {
        console.error("Error getting saved locations:", error);
        throw error;
    }
}

/**
 * Delete a location from storage via background script
 * @param {number} index - Index of location to delete
 * @returns {Promise<boolean>} - Success indicator
 */
async function deleteLocationFromStorage(index) {
    try {
        const response = await chrome.runtime.sendMessage({
            type: "DELETE_LOCATION",
            index
        });
        
        return response.success;
    } catch (error) {
        console.error("Error deleting location:", error);
        throw error;
    }
}