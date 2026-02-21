/**
 * OpenAI Configuration
 * 
 * IMPORTANT: Never commit your actual API key to version control!
 * 
 * For local development:
 * 1. Create a .env file in the project root (add to .gitignore)
 * 2. Add your key: OPENAI_API_KEY=your_actual_key_here
 * 3. Load it using: import { OPENAI_API_KEY } from '@env'
 * 
 * For production:
 * - Use a secure backend API that holds the key
 * - Call your backend endpoint instead of directly using OpenAI API
 */

// Try to load from environment first, fallback to empty string
const API_KEY = process.env.OPENAI_API_KEY ;

export const OPENAI_API_KEY = API_KEY;
export const OPENAI_MODEL = 'gpt-4o-mini';

// Warn if API key is not configured
if (!API_KEY) {
    console.warn(
        'OpenAI API key not configured. AI chat features will be unavailable. ' +
        'Please set the OPENAI_API_KEY environment variable.'
    );
}

