/**
 * GeoExplorer AI - Options Page Script
 * Handles saving and loading extension options
 */

// DOM elements
const googleMapsApiKeyInput = document.getElementById('googleMapsApiKey');
const geminiApiKeyInput = document.getElementById('geminiApiKey');
const saveButton = document.getElementById('saveButton');
const statusElement = document.getElementById('status');

// Load saved options when the page loads
document.addEventListener('DOMContentLoaded', loadOptions);

// Add event listener for the save button
saveButton.addEventListener('click', saveOptions);

/**
 * Load saved options from Chrome storage
 */
function loadOptions() {
  chrome.storage.local.get('apiKeys', (result) => {
    if (result.apiKeys) {
      googleMapsApiKeyInput.value = result.apiKeys.googleMapsApiKey || '';
      geminiApiKeyInput.value = result.apiKeys.geminiApiKey || '';
    }
  });
}

/**
 * Save options to Chrome storage
 */
function saveOptions() {
  const googleMapsApiKey = googleMapsApiKeyInput.value.trim();
  const geminiApiKey = geminiApiKeyInput.value.trim();
  
  // Validate inputs
  if (!googleMapsApiKey) {
    showStatus('Please enter a Google Maps API key', 'error');
    return;
  }
  
  if (!geminiApiKey) {
    showStatus('Please enter a Google Gemini API key', 'error');
    return;
  }
  
  // Save to Chrome storage
  chrome.storage.local.set({
    apiKeys: {
      googleMapsApiKey,
      geminiApiKey
    }
  }, () => {
    if (chrome.runtime.lastError) {
      showStatus('Error saving settings: ' + chrome.runtime.lastError.message, 'error');
    } else {
      showStatus('Settings saved successfully!', 'success');
      
      // Notify the background script that the API keys have been updated
      chrome.runtime.sendMessage({ type: 'API_KEYS_UPDATED' });
    }
  });
}

/**
 * Display a status message
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'error'
 */
function showStatus(message, type) {
  statusElement.textContent = message;
  statusElement.className = 'status ' + type;
  
  // Clear the status after 3 seconds
  setTimeout(() => {
    statusElement.textContent = '';
    statusElement.className = 'status';
  }, 3000);
}