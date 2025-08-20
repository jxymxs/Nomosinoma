// Configuration for hybrid deployment (local backend + online frontend)

// Configuration object
const Config = {
    // Backend URL - hardcoded ngrok URL for production
    backendURL: 'https://854fa5157fe9.ngrok-free.app',
    
    // Method to update backend URL (for dynamic updates if needed)
    setBackendURL: function(url) {
        this.backendURL = url.replace(/\/$/, ''); // Remove trailing slash
        localStorage.setItem('nomos-backend-url', this.backendURL);
        console.log('Backend URL updated to:', this.backendURL);
    },
    
    // Get current backend URL
    getBackendURL: function() {
        return this.backendURL;
    },
    
    // Check if backend is accessible
    checkBackend: async function() {
        try {
            const response = await fetch(`${this.backendURL}/api/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { 
                success: false, 
                error: 'Cannot connect to backend. Please ensure your local server is running and ngrok is active. URL: ' + this.backendURL
            };
        }
    }
};

// Make Config globally available
window.NomosConfig = Config;
