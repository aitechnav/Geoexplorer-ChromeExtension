/**
 * GeoExplorer AI - Google Maps Loader
 * Uses the official Google Maps JavaScript API Loader
 * https://developers.google.com/maps/documentation/javascript/load-maps-js-api
 */

// This is the Google Maps JavaScript API Loader
// It's been included directly in this file for extension compatibility
// Source: https://unpkg.com/@googlemaps/js-api-loader@1.16.2/dist/index.min.js
// Trimmed down version for basic functionality

(function() {
  let Loader = (function() {
    'use strict';
    
    // Promise polyfill for older browsers
    function createPromiseIfSupported() {
      return typeof Promise !== "undefined" ? new Promise(noop) : null;
    }
    
    function noop() {}
    
    const DEFAULT_ID = "__googleMapsScriptId";
    
    /**
     * Load the Google Maps JavaScript API with the provided options
     */
    class Loader {
      constructor({apiKey, version = "weekly", libraries = [], language, region, mapIds, nonce, retries = 3, url = "https://maps.googleapis.com/maps/api/js"}) {
        this.CALLBACK = "__googleMapsCallback";
        this.callbacks = [];
        this.done = false;
        this.loading = false;
        this.errors = [];
        this.apiKey = apiKey;
        this.version = version;
        this.libraries = libraries;
        this.language = language;
        this.region = region;
        this.mapIds = mapIds;
        this.nonce = nonce;
        this.retries = retries;
        this.url = url;
        
        if (Loader.instance) {
          throw new Error("Loader has been instantiated");
        }
        
        Loader.instance = this;
      }
      
      createUrl() {
        let url = this.url;
        url += `?callback=${this.CALLBACK}`;
        
        if (this.apiKey) {
          url += `&key=${this.apiKey}`;
        }
        
        if (this.libraries && this.libraries.length > 0) {
          url += `&libraries=${this.libraries.join(",")}`;
        }
        
        if (this.language) {
          url += `&language=${this.language}`;
        }
        
        if (this.region) {
          url += `&region=${this.region}`;
        }
        
        if (this.version) {
          url += `&v=${this.version}`;
        }
        
        if (this.mapIds) {
          url += `&map_ids=${this.mapIds.join(",")}`;
        }
        
        return url;
      }
      
      load() {
        return this.loadPromise();
      }
      
      loadPromise() {
        if (this.done) {
          return Promise.resolve(window.google);
        }
        
        if (this.loading) {
          return new Promise((resolve, reject) => {
            this.callbacks.push({
              resolve,
              reject
            });
          });
        }
        
        this.loading = true;
        
        window[this.CALLBACK] = () => {
          this.done = true;
          this.loading = false;
          
          this.callbacks.forEach(({resolve}) => resolve(window.google));
          this.callbacks = [];
        };
        
        return new Promise((resolve, reject) => {
          this.callbacks.push({
            resolve,
            reject
          });
          
          this.loadScript().then(() => {
            // Script loaded successfully but callback may not have fired
          }).catch(error => {
            this.reset();
            reject(error);
          });
        });
      }
      
      loadScript() {
        if (document.getElementById(DEFAULT_ID)) {
          return Promise.resolve(window.google);
        }
        
        const url = this.createUrl();
        return new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.id = DEFAULT_ID;
          script.type = "text/javascript";
          script.src = url;
          script.onerror = e => {
            reject(e);
          };
          script.onload = () => {
            resolve(window.google);
          };
          
          if (this.nonce) {
            script.nonce = this.nonce;
          }
          
          document.head.appendChild(script);
        });
      }
      
      reset() {
        this.done = false;
        this.loading = false;
        
        if (typeof window !== "undefined") {
          window[this.CALLBACK] = noop;
        }
      }
    }
    
    // Return the Loader class
    return Loader;
  })();
  
  // Export the Loader
  window.GoogleMapsLoader = Loader;
})();