import axios from 'axios';
import { GEMINI_API_KEY } from '@env'; // Ensure you have the correct API key from your .env file

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;

export const generateFinancialAdvice = async (userInput) => {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: userInput }], // Sending dynamic user input (money-related query)
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Extract the response from Gemini AI
    const result = response.data.candidates[0]?.content?.parts[0]?.text;
    return result || 'Sorry, I didn’t get that.';
  } catch (error) {
    console.error('Gemini API error:', error.message);
    console.error('Full error:', error.response ? error.response.data : error);
    return 'Oops! Something went wrong while contacting the AI.';
  }
};
