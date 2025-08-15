// Configuration for hybrid deployment (local backend + online frontend)

// Configuration object
const Config = {
    // Backend URL - can be updated dynamically
    backendURL: (() => {
        // Check for stored URL first
        const stored = localStorage.getItem('nomos-backend-url');
        if (stored) return stored;
        
        // Check if running locally
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3001';
        }
        
        // For production, use current origin or prompt user
        return window.location.origin;
    })(),

    // Method to update backend URL
    setBackendURL: function(url) {
        this.backendURL = url;
        localStorage.setItem('nomos-backend-url', url);
        console.log('Backend URL updated to:', url);
    },

    // Get current backend URL
    getBackendURL: function() {
        return this.backendURL;
    },

    // Check if backend is accessible
    checkBackend: async function() {
        try {
            const response = await fetch(`${this.backendURL}/api/health`);
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { 
                success: false, 
                error: 'Cannot connect to backend. Please ensure your local server is running and ngrok is active.' 
            };
        }
    }
};

// Make Config globally available
window.NomosConfig.setBackendURL('https://55245468afb0.ngrok-free.app');

