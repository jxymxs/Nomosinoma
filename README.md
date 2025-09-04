# NOMOS AI Web Application

A professional Kenyan legal assistant web application powered by both local Ollama models and Google Gemini API.

## 🚀 Features

- **Dual AI Provider Support**: Choose between local Ollama models and Google Gemini API
- **Real-time Chat**: Interactive chat interface with streaming support
- **Model Management**: Easy switching between different Ollama models
- **Professional Legal Assistant**: Specialized for Kenyan law and legal procedures
- **Responsive Design**: Works on desktop and mobile devices

## 📋 Prerequisites

- Node.js (v16 or higher)
- Ollama installed and running locally (for local models)
- Google Gemini API key (for cloud features)

## 🔧 Installation

1. **Clone or download the project**
   ```bash
   cd nomos
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your actual API keys:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   OLLAMA_BASE_URL=http://localhost:11434
   ```

4. **Set up Ollama** (for local models)
   ```bash
   # Install Ollama from https://ollama.ai
   # Pull a model (e.g., llama3.2)
   ollama pull llama3.2
   ```

5. **Start the server**
   ```bash
   npm start
   ```

## 🎯 Usage

### Starting the Application

1. **Start the server**:
   ```bash
   npm start
   ```

2. **Access the application**:
   - Main app: http://localhost:3001
   - Health check: http://localhost:3001/api/health

### API Endpoints

#### Ollama Endpoints
- `GET /api/models` - List available Ollama models
- `POST /api/chat` - Chat with Ollama (non-streaming)
- `POST /api/chat/stream` - Chat with Ollama (streaming)

#### Gemini Endpoints
- `POST /api/gemini` - Chat with Google Gemini

### Frontend Integration

The application includes a ready-to-use frontend interface at `public/index.html` with:
- Model selection dropdown
- Real-time chat interface
- Provider switching
- Responsive design

## 📖 API Usage Examples

### Chat with Ollama
```javascript
// Using the client
const response = await nomosClient.sendChat(
  "What are the requirements for starting a business in Kenya?",
  "llama3.2",
  "ollama"
);
console.log(response.response);
```

### Chat with Gemini
```javascript
const response = await nomosClient.sendChat(
  "Explain the Kenyan tax system for small businesses",
  null,
  "gemini"
);
console.log(response.response);
```

### Get Available Models
```javascript
const models = await nomosClient.getModels();
console.log(models);
```

## 🛠️ Development

### Available Scripts
- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload

### Adding New Models
1. Pull new models with Ollama:
   ```bash
   ollama pull mistral
   ```
2. The new model will automatically appear in the `/api/models` endpoint

### Customizing the System Prompt
Edit the `SYSTEM_PROMPT` variable in `index.js` to change the AI's behavior.

## 🔍 Troubleshooting

### Common Issues

1. **Ollama not found**
   - Ensure Ollama is running: `ollama serve`
   - Check if the URL in `.env` is correct

2. **Gemini API errors**
   - Verify your API key is set in `.env`
   - Check if the key has proper permissions

3. **CORS issues**
   - The server is configured to allow CORS from any origin
   - For production, update the CORS configuration

4. **Port already in use**
   - Change the port in `.env` file
   - Kill the process using the port: `lsof -ti:3001 | xargs kill -9`

## 📱 Mobile Support

The application is fully responsive and works on:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Android Chrome)
- Tablets and iPads

## 🔄 Switching Between Providers

### Local Ollama (Recommended for Privacy)
- ✅ No internet required
- ✅ Full privacy
- ✅ Customizable models
- ❌ Requires local setup

### Google Gemini (Recommended for Advanced Features)
- ✅ Advanced capabilities
- ✅ No local setup
- ✅ Always available
- ❌ Requires internet
- ❌ API usage costs

## 📝 Legal Disclaimer

This AI assistant provides general legal information and should not be considered as legal advice. Always consult with a qualified Kenyan lawyer for specific legal matters.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.
