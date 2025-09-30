# Plumb PDF Processing Scripts

This directory contains scripts to process Plumb's Veterinary Drug Handbook PDF and generate the embeddings file required by the PlumbRAG system.

## Quick Start

### Option 1: Windows Batch Script (Easiest)
1. Place your Plumb PDF file in any location on your computer
2. Double-click `process_plumb.bat`
3. Follow the prompts to enter your PDF path and OpenAI API key
4. Wait for processing to complete

### Option 2: Python Script (Cross-platform)
1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the processing script:
   ```bash
   python process_plumb_pdf.py "path/to/your/plumb-pdf.pdf" "your-openai-api-key"
   ```

## What the Script Does

1. **PDF Text Extraction**: Uses PyPDF2 to extract all text from the PDF
2. **Text Chunking**: Splits the text into manageable chunks (500 words each, 50 word overlap)
3. **Embedding Generation**: Creates OpenAI embeddings for each chunk using `text-embedding-3-small`
4. **JSON Output**: Saves chunks and embeddings to `data/plumb_embeddings.json`

## File Structure After Processing

```
data/
└── plumb_embeddings.json    # Generated embeddings file
    ├── chunks: string[]     # Text chunks from PDF
    └── embeddings: number[][] # OpenAI embeddings
```

## Requirements

- **Python 3.7+**
- **OpenAI API Key** (get from https://platform.openai.com/api-keys)
- **Plumb's Veterinary Drug Handbook PDF**

## Dependencies

- `chromadb` - Vector database (for testing)
- `openai` - OpenAI API client
- `PyPDF2` - PDF text extraction

## Processing Time

- **Small PDF** (< 100 pages): 2-5 minutes
- **Medium PDF** (100-500 pages): 10-30 minutes  
- **Large PDF** (500+ pages): 30+ minutes

Processing time depends on:
- PDF size and complexity
- OpenAI API rate limits
- Internet connection speed

## Troubleshooting

### Common Issues

1. **"PDF file not found"**
   - Check the file path is correct
   - Ensure the PDF file exists

2. **"OpenAI API key not provided"**
   - Get an API key from https://platform.openai.com/api-keys
   - Make sure you have credits in your OpenAI account

3. **"Missing required package"**
   - Run: `pip install -r requirements.txt`

4. **"Rate limit exceeded"**
   - The script includes rate limiting (100ms between requests)
   - If you still hit limits, increase the delay in the script

### API Key Security

⚠️ **Important**: Never commit your OpenAI API key to version control!

- Use environment variables: `set OPENAI_API_KEY=your-key-here`
- Or pass it as a command line argument
- The batch script will prompt you for the key securely

## Output

After successful processing, you'll see:
- ✅ Confirmation messages
- 📊 Statistics (chunks, embeddings, file size)
- 🧪 Test query results
- 📁 Location of the generated file

The generated `plumb_embeddings.json` file will be automatically used by your PlumbRAG system.

## Testing the Results

After processing, you can test the embeddings by running:

```python
# Test script (optional)
python -c "
import json
with open('data/plumb_embeddings.json', 'r') as f:
    data = json.load(f)
print(f'Loaded {len(data[\"chunks\"])} chunks')
print(f'First chunk: {data[\"chunks\"][0][:100]}...')
"
```

## Next Steps

Once processing is complete:
1. The PlumbRAG system will automatically load the embeddings
2. Your SOAP note generation will include evidence-based treatments
3. The system will suggest drugs and dosages from the Plumb handbook

## Support

If you encounter issues:
1. Check the error messages carefully
2. Ensure all dependencies are installed
3. Verify your OpenAI API key is valid and has credits
4. Check that the PDF file is not corrupted or password-protected

