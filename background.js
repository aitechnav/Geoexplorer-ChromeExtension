/**
 * GeoExplorer AI - Background Service Worker
 * Handles API requests and data persistence
 */

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("GeoExplorer AI Extension installed");
    
    // Initialize saved locations
    chrome.storage.local.set({ savedLocations: [] });
    
    // Open options page for API key setup on first install
    chrome.runtime.openOptionsPage();
  }
});

// Listen for browser action click
chrome.action.onClicked.addListener((tab) => {
  // Open the app in a new tab
  chrome.tabs.create({ url: "app/index.html" });
});

// Listen for messages from popup or app
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle different message types
  switch (request.type) {
    case "GENERATE_CONTENT":
      generateContent(request.lat, request.lng, request.address)
        .then(content => sendResponse({ success: true, content }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Keep channel open for async response
      
    case "SAVE_LOCATION":
      saveLocation(request.location)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case "GET_SAVED_LOCATIONS":
      getSavedLocations()
        .then(locations => sendResponse({ success: true, locations }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case "DELETE_LOCATION":
      deleteLocation(request.index)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case "GENERATE_CHAT_RESPONSE":
      generateChatResponse(request.message, request.lat, request.lng, request.address)
        .then(response => sendResponse({ success: true, response }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case "GET_MAPS_API_KEY":
      getMapsApiKey()
        .then(apiKey => sendResponse({ success: true, apiKey }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case "INJECT_MAPS_API":
      injectMapsApi()
        .then(apiKey => sendResponse({ success: true, apiKey }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case "PREPARE_GOOGLE_MAPS_LOADER":
      prepareGoogleMapsLoader()
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
  }
});

// Get Google Maps API key
async function getMapsApiKey() {
  const config = await chrome.storage.local.get("apiKeys");
  if (!config.apiKeys || !config.apiKeys.googleMapsApiKey) {
    throw new Error("Google Maps API key not configured. Please visit the options page.");
  }
  return config.apiKeys.googleMapsApiKey;
}

/**
 * Generate content about a location using Gemini API
 */
async function generateContent(lat, lng, address = null) {
  try {
    // Get API key from storage
    const config = await chrome.storage.local.get("apiKeys");
    if (!config.apiKeys || !config.apiKeys.geminiApiKey) {
      throw new Error("Gemini API key not configured. Please visit the options page.");
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.apiKeys.geminiApiKey}`;
    
    let prompt = `Provide a brief but informative description (2-3 paragraphs) about the location at latitude: ${lat}, longitude: ${lng}.`;
    
    if (address) {
      prompt += ` The address is: ${address}.`;
    }
    
    prompt += ` Include notable landmarks, historical significance, cultural relevance, or interesting facts if applicable. Also briefly mention the current typical weather conditions for this time of year.`;
    
    const requestBody = {
      "contents": [{
        "parts": [{ "text": prompt }]
      }]
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.error("Unexpected response format:", data);
      throw new Error("Unable to retrieve information about this location.");
    }
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}

/**
 * Generate chat response
 */
async function generateChatResponse(message, lat, lng, address = null) {
  try {
    // Get API key from storage
    const config = await chrome.storage.local.get("apiKeys");
    if (!config.apiKeys || !config.apiKeys.geminiApiKey) {
      throw new Error("Gemini API key not configured. Please visit the options page.");
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.apiKeys.geminiApiKey}`;
    
    const prompt = `
      You are a helpful location assistant for GeoExplorer AI.
      
      The user is currently looking at a map centered at:
      - Latitude: ${lat}
      - Longitude: ${lng}
      ${address ? `- Address: ${address}` : ''}
      
      The user's question is: ${message}
      
      Provide a helpful, informative response about this location relevant to their question.
      Include geographical, historical, or cultural information that would be useful.
      Keep your response concise but informative (2-3 paragraphs maximum).
    `;
    
    const requestBody = {
      "contents": [{
        "parts": [{ "text": prompt }]
      }]
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Unexpected API response format");
    }
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw error;
  }
}

/**
 * Save a location to storage
 */
async function saveLocation(location) {
  try {
    const data = await chrome.storage.local.get("savedLocations");
    const savedLocations = data.savedLocations || [];
    
    savedLocations.push({
      ...location,
      timestamp: new Date().toISOString()
    });
    
    await chrome.storage.local.set({ savedLocations });
    return true;
  } catch (error) {
    console.error("Error saving location:", error);
    throw error;
  }
}

/**
 * Get all saved locations from storage
 */
async function getSavedLocations() {
  try {
    const data = await chrome.storage.local.get("savedLocations");
    return data.savedLocations || [];
  } catch (error) {
    console.error("Error getting saved locations:", error);
    throw error;
  }
}

/**
 * Delete a location from storage
 */
async function deleteLocation(index) {
  try {
    const data = await chrome.storage.local.get("savedLocations");
    const savedLocations = data.savedLocations || [];
    
    if (index >= 0 && index < savedLocations.length) {
      savedLocations.splice(index, 1);
      await chrome.storage.local.set({ savedLocations });
    } else {
      throw new Error("Invalid location index");
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting location:", error);
    throw error;
  }
}

/**
 * Get the Google Maps API key and ensure it's configured
 */
async function injectMapsApi() {
  try {
    // Get API key from storage
    const config = await chrome.storage.local.get("apiKeys");
    if (!config.apiKeys || !config.apiKeys.googleMapsApiKey) {
      throw new Error("Google Maps API key not configured. Please visit the options page.");
    }
    
    // Return the API key for use in the popup
    return config.apiKeys.googleMapsApiKey;
  } catch (error) {
    console.error("Error getting Maps API key:", error);
    throw error;
  }
}

/**
 * Prepare Google Maps API loader
 * This function returns the URL for the modified loader script with the API key inserted
 */
async function prepareGoogleMapsLoader() {
  try {
    // Get API key from storage
    const config = await chrome.storage.local.get("apiKeys");
    if (!config.apiKeys || !config.apiKeys.googleMapsApiKey) {
      throw new Error("Google Maps API key not configured. Please visit the options page.");
    }

    return { 
      success: true, 
      apiKey: config.apiKeys.googleMapsApiKey
    };
  } catch (error) {
    console.error("Error preparing Google Maps loader:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}