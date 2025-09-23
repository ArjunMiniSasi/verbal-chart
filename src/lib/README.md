# SOAP Note Generator

This utility generates structured SOAP (Subjective, Objective, Assessment, Plan) notes from veterinary consultation transcripts using OpenAI's GPT-4o-mini model.

## Files

- `soapGenerator.ts` - Main utility functions
- `soapGenerator.test.ts` - Test and example functions

## Usage

### Basic Usage

```typescript
import { generateSoapNote } from '@/lib/soapGenerator';

const transcript = "The pet has been coughing for 3 days, owner says it worsens at night...";
const soapNote = await generateSoapNote(transcript);
console.log(soapNote.assessment);
```

### TypeScript Interface

```typescript
interface SoapNote {
  subjective: string;  // Owner's observations and history
  objective: string;   // Physical examination findings
  assessment: string;  // Clinical diagnosis
  plan: string;        // Treatment plan and recommendations
}
```

## Features

- **OpenAI Integration**: Uses GPT-4o-mini for intelligent SOAP note generation
- **Error Handling**: Graceful fallback to empty SOAP note if generation fails
- **JSON Parsing**: Robust parsing with regex fallback for malformed responses
- **Veterinary Focus**: Optimized prompts for veterinary consultations
- **TypeScript Support**: Full type safety and IntelliSense

## Environment Setup

Add to your `.env` file:

```
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

## Error Handling

The function handles several error scenarios:

1. **API Errors**: Network issues, rate limits, invalid API key
2. **JSON Parsing Errors**: Malformed responses from OpenAI
3. **Missing Fields**: Incomplete SOAP note structure
4. **Empty Transcripts**: No content to process

In all error cases, a fallback empty SOAP note is returned with appropriate error messages.

## Testing

You can test the function in the browser console:

```javascript
// Test with sample data
testSoapGeneration();

// Test with custom transcript
exampleUsage();
```

## Integration

The SOAP generator is automatically integrated into the VoiceButton component:

1. User records audio
2. Audio is transcribed using Whisper AI
3. Transcript is automatically converted to SOAP note
4. Both transcript and SOAP note are stored and displayed

## Cost Considerations

- Uses GPT-4o-mini (cheaper than GPT-4)
- Limited to 1000 tokens per request
- Temperature set to 0.3 for consistent results
- Optimized prompts to minimize token usage

