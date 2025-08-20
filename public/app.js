// NOMOS AI Frontend Application
document.addEventListener('DOMContentLoaded', () => {
    const client = window.nomosClient;
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const modelSelect = document.getElementById('modelSelect');
    const providerRadios = document.querySelectorAll('input[name="provider"]');
    const statusIndicator = document.getElementById('statusIndicator');
    const charCount = document.getElementById('charCount');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Initialize
    let isStreaming = false;

    // Update character count
    messageInput.addEventListener('input', () => {
        const length = messageInput.value.length;
        charCount.textContent = `${length}/2000`;
        sendButton.disabled = length === 0;
    });

    // Change provider
    providerRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const selectedProvider = e.target.value;
            client.setCurrentModel(modelSelect.value, selectedProvider);
            updateModelSelectVisibility(selectedProvider);
            clearChat();
        });
    });

    // Change model
    modelSelect.addEventListener('change', (e) => {
        const selectedProvider = document.querySelector('input[name="provider"]:checked').value;
        client.setCurrentModel(e.target.value, selectedProvider);
    });

    // Show or hide model select based on provider
    function updateModelSelectVisibility(provider) {
        if (provider === 'ollama') {
            modelSelect.parentElement.style.display = 'block';
            loadModels();
        } else {
            modelSelect.parentElement.style.display = 'none';
        }
    }

    // Load available models
    async function loadModels() {
        try {
            const models = await client.getModels();
            modelSelect.innerHTML = '';
            
            if (models.length === 0) {
                const option = document.createElement('option');
                option.value = 'llama3.2';
                option.textContent = 'llama3.2';
                modelSelect.appendChild(option);
            } else {
                models.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model.name || model;
                    option.textContent = model.name || model;
                    modelSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Failed to load models:', error);
            statusIndicator.innerHTML = '<i class="fas fa-circle"></i> Models Unavailable';
        }
    }

    // Clear chat
    window.clearChat = () => {
        chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <h3>Welcome to NOMOS AI</h3>
                <p>I'm your professional Kenyan legal assistant. Ask me anything about Kenyan law, legal procedures, or regulations.</p>
                <div class="suggestions">
                    <span class="suggestion" onclick="loadSampleQuestion('business')">Business registration</span>
                    <span class="suggestion" onclick="loadSampleQuestion('property')">Property ownership</span>
                    <span class="suggestion" onclick="loadSampleQuestion('employment')">Employment rights</span>
                </div>
            </div>
        `;
    };

    // Load sample questions
    window.loadSampleQuestion = (topic) => {
        const samples = {
            business: 'What are the requirements for starting a business in Kenya?',
            property: 'How do I transfer property ownership in Kenya?',
            employment: 'What are my rights as an employee in Kenya?',
            criminal: 'What are the penalties for theft under Kenyan law?'
        };
        messageInput.value = samples[topic] || '';
        charCount.textContent = `${messageInput.value.length}/2000`;
        sendButton.disabled = messageInput.value.length === 0;
        messageInput.focus();
    };

    // Enhanced message rendering with markdown support
    function appendMessage(text, sender = 'ai') {
        const messageEl = document.createElement('div');
        messageEl.classList.add('message', sender);

        const avatarEl = document.createElement('div');
        avatarEl.classList.add('message-avatar');
        avatarEl.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

        const contentEl = document.createElement('div');
        contentEl.classList.add('message-content');

        const textEl = document.createElement('div');
        textEl.classList.add('message-text');
        
        // Process markdown formatting
        let processedText = text
            // Handle bold text (**text** or __text__)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            // Handle italic text (*text* or _text_)
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            // Handle headings (# ## ###)
            .replace(/^### (.*?)$/gm, '<h4>$1</h4>')
            .replace(/^## (.*?)$/gm, '<h3>$1</h3>')
            .replace(/^# (.*?)$/gm, '<h2>$1</h2>')
            // Handle bullet points
            .replace(/^[\*\-] (.*?)$/gm, '<li>$1</li>')
            // Handle numbered lists
            .replace(/^\d+\. (.*?)$/gm, '<li>$1</li>')
            // Handle line breaks
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            // Wrap lists in ul/ol
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            // Clean up empty paragraphs
            .replace(/<p><\/p>/g, '');

        textEl.innerHTML = processedText;

        contentEl.appendChild(textEl);
        messageEl.appendChild(avatarEl);
        messageEl.appendChild(contentEl);

        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Send message
    window.sendMessage = async () => {
        const prompt = messageInput.value.trim();
        if (!prompt) return;

        appendMessage(prompt, 'user');
        messageInput.value = '';
        charCount.textContent = '0/2000';
        sendButton.disabled = true;

        // Remove welcome message if present
        const welcomeMsg = chatMessages.querySelector('.welcome-message');
        if (welcomeMsg) welcomeMsg.remove();

        loadingOverlay.classList.add('active');

        const provider = document.querySelector('input[name="provider"]:checked').value;
        const model = provider === 'ollama' ? modelSelect.value : null;

        try {
            if (provider === 'ollama') {
                // Streaming for Ollama
                const messageEl = document.createElement('div');
                messageEl.classList.add('message', 'ai');
                messageEl.innerHTML = `
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-text"></div>
                    </div>
                `;
                chatMessages.appendChild(messageEl);
                
                const textEl = messageEl.querySelector('.message-text');
                let fullResponse = '';

                await client.streamChat(prompt, model, provider, (chunk) => {
                    fullResponse += chunk;
                    // Filter out <think>...</think> sections
                    let filteredResponse = fullResponse.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
                    
                    // Apply markdown formatting to streaming response
                    filteredResponse = filteredResponse
                        // Handle bold text (**text** or __text__)
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/__(.*?)__/g, '<strong>$1</strong>')
                        // Handle italic text (*text* or _text_)
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/_(.*?)_/g, '<em>$1</em>')
                        // Handle headings (# ## ###)
                        .replace(/^### (.*?)$/gm, '<h4>$1</h4>')
                        .replace(/^## (.*?)$/gm, '<h3>$1</h3>')
                        .replace(/^# (.*?)$/gm, '<h2>$1</h2>')
                        // Handle bullet points
                        .replace(/^[\*\-] (.*?)$/gm, '<li>$1</li>')
                        // Handle numbered lists
                        .replace(/^\d+\. (.*?)$/gm, '<li>$1</li>')
                        // Handle line breaks
                        .replace(/\n\n/g, '</p><p>')
                        .replace(/\n/g, '<br>')
                        // Wrap lists in ul/ol
                        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
                        // Clean up empty paragraphs
                        .replace(/<p><\/p>/g, '');
                    
                    textEl.innerHTML = filteredResponse;
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                });
            } else {
                // Non-streaming for Gemini
                const response = await client.sendChat(prompt, null, 'gemini');
                if (response.error) {
                    appendMessage(response.error, 'ai');
                } else {
                    appendMessage(response.response, 'ai');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            appendMessage('Sorry, I encountered an error. Please try again.', 'ai');
        } finally {
            loadingOverlay.classList.remove('active');
            sendButton.disabled = false;
        }
    };

    // Check server health - simplified for static deployment
    async function checkServerHealth() {
        try {
            // Use the configured backend URL from the client
            const backendURL = client.baseURL;
            const response = await fetch(`${backendURL}/api/health`);
            const data = await response.json();
            
            if (data.status === 'ok') {
                statusIndicator.innerHTML = '<i class="fas fa-circle"></i> Connected';
                statusIndicator.className = 'status-indicator connected';
                loadModels();
            } else {
                statusIndicator.innerHTML = '<i class="fas fa-circle"></i> Server Error';
                statusIndicator.className = 'status-indicator disconnected';
            }
        } catch (error) {
            console.error('Server health check failed:', error);
            statusIndicator.innerHTML = '<i class="fas fa-circle"></i> Connecting...';
            statusIndicator.className = 'status-indicator connecting';
            
            // For static deployment, just attempt to load models anyway
            // since we have the ngrok URL hardcoded
            loadModels();
        }
    }

    // Initialize
    updateModelSelectVisibility('ollama');
    clearChat();
    sendButton.disabled = true;
    checkServerHealth();
});
