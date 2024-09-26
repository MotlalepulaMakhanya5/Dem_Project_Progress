const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

// Route to serve the HTML file for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chatBot.html'));
});

// Chatbot API endpoint
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  try {
    const result = await model.generateContent(userMessage);
    res.json({ response: result.response.text() });
  } catch (error) {
    console.error('Error communicating with Gemini API:', error.message);
    res.status(500).send('Error communicating with chatbot.');
  }
});

// Endpoint for generating text-only content
app.post('/text-gen-text-only', async (req, res) => {
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = req.body.prompt;

  try {
    const result = await model.generateContent(prompt);
    res.json({ response: result.response.text() });
  } catch (error) {
    console.error('Error generating text:', error.message);
    res.status(500).send('Error generating text.');
  }
});

// Endpoint for streaming text-only content
app.post('/text-gen-text-only-stream', async (req, res) => {
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = req.body.prompt;

  try {
    const result = await model.generateContentStream(prompt);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
    }
    res.end();
  } catch (error) {
    console.error('Error generating text stream:', error.message);
    res.status(500).send('Error generating text stream.');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
console.log('API Key:', process.env.API_KEY);
