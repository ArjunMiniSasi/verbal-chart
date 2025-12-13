# Translation Implementation for Medora Transcription

## Overview
This document outlines the changes needed to translate non-English transcripts to English automatically.

## Changes Required in `/app/functions/index.js`

### 1. Add Translation Helper Function

Add this function before the `exports.transcribe` section (around line 870):

```javascript
// Helper function to translate text to English using GPT-4o-mini
async function translateToEnglish(text, sourceLanguage) {
  try {
    // If already in English, return as-is
    if (sourceLanguage === 'en' || sourceLanguage === 'english') {
      console.log('✅ Text is already in English, skipping translation');
      return {
        translatedText: text,
        wasTranslated: false,
        sourceLanguage: sourceLanguage
      };
    }

    console.log(`🌐 Translating from ${sourceLanguage} to English...`);
    
    const translationPrompt = `Translate the following veterinary consultation transcript from ${sourceLanguage} to English. 
Maintain medical terminology accuracy and professional tone. Preserve all medical details, symptoms, and treatment information.

Original text in ${sourceLanguage}:
${text}

Provide ONLY the English translation, no additional commentary.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional medical translator specializing in veterinary medicine. Translate accurately while preserving all medical information.' 
        },
        { role: 'user', content: translationPrompt }
      ],
      temperature: 0.1, // Low temperature for consistent, accurate translations
      max_tokens: 2000
    });

    const translatedText = response.choices[0].message.content.trim();
    
    console.log('✅ Translation completed');
    console.log('📝 Original length:', text.length);
    console.log('📝 Translated length:', translatedText.length);

    return {
      translatedText: translatedText,
      wasTranslated: true,
      sourceLanguage: sourceLanguage
    };

  } catch (error) {
    console.error('❌ Translation error:', error);
    // Fallback: return original text if translation fails
    return {
      translatedText: text,
      wasTranslated: false,
      sourceLanguage: sourceLanguage,
      translationError: error.message
    };
  }
}
```

### 2. Modify the `transcribe` Function Response

Replace the current response section (lines 950-955) with:

```javascript
      // Translate to English if not already in English
      console.log('🔄 Starting translation process...');
      const translationResult = await translateToEnglish(
        transcription.text, 
        transcription.language
      );

      console.log('✅ Translation process completed');

      res.json({
        text: translationResult.translatedText,           // Translated text (or original if English)
        originalText: transcription.text,                  // Keep original for reference
        language: transcription.language,                  // Original detected language
        wasTranslated: translationResult.wasTranslated,    // Flag indicating if translation occurred
        duration: transcription.duration,
        words: transcription.words || []
      });
```

## Complete Modified `transcribe` Function

Here's the complete modified function:

```javascript
// 1. Transcribe Audio → Transcript with English Translation
exports.transcribe = functions
  .runWith({ timeoutSeconds: 540, memory: '2GB' })
  .https.onRequest(async (req, res) => {
    // Set CORS headers
    setCorsHeaders(res);

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return res.status(204).send('');
    }

    let tempFilePath = null;
    try {

      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      console.log('📥 Received transcription request');
      console.log('📋 Method:', req.method);
      console.log('📋 Content-Type:', req.headers['content-type']);
      console.log('📋 Content-Length:', req.headers['content-length']);

      const formData = await parseMultipartFormData(req);
      console.log('📦 Form data parsed:', {
        hasFile: !!formData.file,
        filePath: formData.file?.path,
        fileName: formData.file?.filename,
        fileSize: formData.file?.size,
        mimeType: formData.file?.mimetype,
        fields: Object.keys(formData.fields)
      });

      if (!formData.file || !formData.file.path) {
        console.error('❌ No file in form data');
        return res.status(400).json({ error: 'No audio file provided' });
      }

      tempFilePath = formData.file.path;
      console.log('📁 Processing audio file:', formData.file.filename);
      console.log('📁 Temp file path:', tempFilePath);
      console.log('📁 File size:', formData.file.size, 'bytes');
      console.log('📁 MIME type:', formData.file.mimetype);

      // Verify file exists
      if (!fs.existsSync(tempFilePath)) {
        throw new Error('Temporary file not found after upload');
      }

      const fileStats = fs.statSync(tempFilePath);
      console.log('📊 File stats:', fileStats.size, 'bytes');

      // Step 1: Transcribe using OpenAI Whisper
      console.log('🎤 Starting OpenAI Whisper transcription...');
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
        response_format: 'verbose_json',
        timestamp_granularities: ['word']
      });

      console.log('✅ Transcription successful');
      console.log('📝 Text length:', transcription.text?.length || 0);
      console.log('🌐 Language:', transcription.language);

      // Step 2: Translate to English if not already in English
      console.log('🔄 Starting translation process...');
      const translationResult = await translateToEnglish(
        transcription.text, 
        transcription.language
      );

      console.log('✅ Translation process completed');

      // Cleanup temp file
      try {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
          console.log('🧹 Cleaned up temp file');
        }
      } catch (cleanupErr) {
        console.warn('⚠️ Cleanup error:', cleanupErr);
      }

      // Return both translated and original text
      res.json({
        text: translationResult.translatedText,           // Translated text (or original if English)
        originalText: transcription.text,                  // Keep original for reference
        language: transcription.language,                  // Original detected language
        wasTranslated: translationResult.wasTranslated,    // Flag indicating if translation occurred
        duration: transcription.duration,
        words: transcription.words || []
      });
    } catch (error) {
      console.error('❌ Transcription error:', error);
      console.error('❌ Error stack:', error.stack);

      // Cleanup temp file on error
      try {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch (cleanupErr) {
        console.warn('⚠️ Cleanup error:', cleanupErr);
      }

      res.status(500).json({
        error: 'Transcription failed',
        message: error.message || String(error),
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });
```

## How It Works

### Workflow:
1. **Audio Upload**: Doctor records in Malayalam/Hindi/any language
2. **Whisper Transcription**: OpenAI Whisper transcribes in original language
3. **Language Detection**: Whisper automatically detects language (e.g., "ml" for Malayalam)
4. **Translation Check**: System checks if language is English
   - If **English**: Skip translation, return as-is
   - If **Not English**: Translate using GPT-4o-mini
5. **Return Response**: Send both:
   - `text`: Translated English version (for display)
   - `originalText`: Original language text (for reference)
   - `wasTranslated`: Boolean flag

### Response Format:

**For Malayalam audio:**
```json
{
  "text": "The patient presents with decreased appetite and lethargy for the past two days...",
  "originalText": "രോഗിക്ക് കഴിഞ്ഞ രണ്ട് ദിവസമായി വിശപ്പില്ലായ്മയും ക്ഷീണവും ഉണ്ട്...",
  "language": "ml",
  "wasTranslated": true,
  "duration": 45.3,
  "words": [...]
}
```

**For English audio:**
```json
{
  "text": "The patient presents with decreased appetite...",
  "originalText": "The patient presents with decreased appetite...",
  "language": "en",
  "wasTranslated": false,
  "duration": 45.3,
  "words": [...]
}
```

## Frontend Changes (Optional)

You may want to update the frontend to display both versions:

```typescript
// In VoiceButton.tsx or AudioUpload.tsx
const transcriptChunk = {
  id: `chunk_${Date.now()}`,
  text: result.text,                    // English (translated)
  originalText: result.originalText,    // Original language
  wasTranslated: result.wasTranslated,  // Boolean flag
  entities: [],
  timestamp: Date.now(),
  language: result.language,
  duration: result.duration
};
```

## Benefits

1. ✅ **Readable for Doctors**: All transcripts in English
2. ✅ **Preserved Original**: Original text kept for reference
3. ✅ **Medical Accuracy**: GPT-4o-mini maintains medical terminology
4. ✅ **Automatic**: No manual translation needed
5. ✅ **Language Agnostic**: Works for all 99 Whisper languages
6. ✅ **Fallback**: Returns original if translation fails

## Cost Considerations

- **Whisper**: ~$0.006 per minute of audio
- **GPT-4o-mini Translation**: ~$0.00015 per 1K tokens input, ~$0.0006 per 1K output
- **Example**: 5-minute consultation in Malayalam
  - Whisper: $0.03
  - Translation (500 tokens): ~$0.0004
  - **Total**: ~$0.03 per consultation

## Deployment Steps

1. Add the `translateToEnglish` function to `/app/functions/index.js`
2. Modify the `transcribe` function response
3. Deploy to Firebase: `firebase deploy --only functions:transcribe`
4. Test with non-English audio
5. Update frontend to handle `wasTranslated` flag (optional)

## Testing

```bash
# Test with Malayalam audio
curl -X POST https://us-central1-vetqure-pms.cloudfunctions.net/transcribe \
  -F "audio=@malayalam_consultation.mp3"

# Expected response will have:
# - text: in English
# - originalText: in Malayalam
# - language: "ml"
# - wasTranslated: true
```
