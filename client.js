// NOMOS AI Frontend Client
class NomosAIClient {
  constructor() {
    this.baseURL = 'http://localhost:3001';
    this.currentModel = 'ollama'; // Default to Ollama
    this.selectedOllamaModel = 'llama3.2';
  }

  // Get available models
  async getModels() {
    try {
      const response = await fetch(`${this.baseURL}/api/models`);
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  }

  // Send chat request
  async sendChat(prompt, model = null, provider = null) {
    const currentProvider = provider || this.currentModel;
    const endpoint = currentProvider === 'ollama' ? '/api/chat' : '/api/gemini';
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: currentProvider === 'ollama' ? (model || this.selectedOllamaModel) : undefined
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending chat:', error);
      return { error: 'Failed to get response' };
    }
  }

  // Stream chat response
  async streamChat(prompt, model = null, provider = null, onChunk = null) {
    const currentProvider = provider || this.currentModel;
    const endpoint = currentProvider === 'ollama' ? '/api/chat/stream' : '/api/gemini';
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: currentProvider === 'ollama' ? (model || this.selectedOllamaModel) : undefined
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        if (onChunk) onChunk(chunk);
      }
      
    } catch (error) {
      console.error('Error streaming chat:', error);
      if (onChunk) onChunk('Error: Failed to get response');
    }
  }

  // Set current model
  setCurrentModel(model, provider) {
    this.currentModel = provider;
    if (provider === 'ollama' && model) {
      this.selectedOllamaModel = model;
    }
  }
}

// Initialize client
const client = new NomosAIClient();

// Export for use in HTML
window.NomosAIClient = NomosAIClient;
window.nomosClient = client;
