/**
 * OpenAI Configuration - EXAMPLE/TEMPLATE
 * 
 * DO NOT commit your actual API key to git!
 * This file shows how to configure the OpenAI API for your project.
 * 
 * SETUP INSTRUCTIONS:
 * ==================
 * 
 * Option 1: Using Environment Variables (RECOMMENDED)
 * ---------------------------------------------------
 * 1. Install react-native-dotenv package (if not already installed):
 *    npm install react-native-dotenv
 * 
 * 2. Create a .env file in the project root:
 *    OPENAI_API_KEY=sk-your-actual-key-here
 *    OPENAI_MODEL=gpt-4o-mini
 * 
 * 3. Add .env to your .gitignore:
 *    echo ".env" >> .gitignore
 * 
 * 4. In config.ts, load from environment:
 *    import { OPENAI_API_KEY, OPENAI_MODEL } from '@env'
 *    export { OPENAI_API_KEY, OPENAI_MODEL }
 * 
 * 
 * Option 2: Using Backend API (BEST FOR PRODUCTION)
 * -------------------------------------------------
 * Instead of exposing your API key in the mobile app:
 * 
 * 1. Create a backend endpoint that accepts user messages
 * 2. Your backend sends requests to OpenAI using the secure API key
 * 3. The mobile app calls your backend, not OpenAI directly
 * 4. Example: POST /api/chat { "message": "..." }
 * 
 * This prevents your API key from being exposed in the app binary.
 * 
 * 
 * Getting Your OpenAI API Key:
 * ============================
 * 1. Go to https://platform.openai.com/api-keys
 * 2. Sign up or log in to your account
 * 3. Create a new API key
 * 4. Copy it and add to your .env file
 * 5. NEVER share this key or commit it to version control
 */

// Example configuration (update with your actual values)
export const OPENAI_API_KEY = 'sk-your-api-key-here'; // Replace with actual key
export const OPENAI_MODEL = 'gpt-4o-mini'; // or 'gpt-3.5-turbo' for faster/cheaper

/**
 * Rename this file to config.ts and update the values above.
 * Then add src/services/ai/config.ts to your .gitignore
 */
