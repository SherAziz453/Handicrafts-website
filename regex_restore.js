const fs = require('fs');
const transcriptPath = 'C:\\Users\\UNIVERSAL\\.gemini\\antigravity\\brain\\6d2f438d-8176-4868-9861-c130eebf759b\\.system_generated\\logs\\transcript.jsonl';
const data = fs.readFileSync(transcriptPath, 'utf8');

function extractFile(filename) {
    // Find the last write_to_file for the given filename before my overwrites
    // We'll search for "TargetFile":"d:\\coding projects\\ffc\\<filename>"
    const regex = new RegExp(`"TargetFile":"d:\\\\\\\\coding projects\\\\\\\\ffc\\\\\\\\${filename}".*?"CodeContent":"(.*?)"`, 'g');
    let match;
    let lastMatch = null;
    while ((match = regex.exec(data)) !== null) {
        lastMatch = match[1];
    }
    
    if (lastMatch) {
        // Try to unescape the string
        try {
            let unescaped = JSON.parse(`"${lastMatch}"`);
            fs.writeFileSync(`d:\\coding projects\\ffc\\${filename}`, unescaped);
            console.log(`Successfully extracted ${filename}`);
        } catch (e) {
            console.log(`Failed to parse ${filename}, saving raw...`);
            // Basic unescaping
            let raw = lastMatch.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            fs.writeFileSync(`d:\\coding projects\\ffc\\${filename}`, raw);
            console.log(`Saved raw extracted ${filename}`);
        }
    } else {
        console.log(`Could not find ${filename}`);
    }
}

extractFile('style.css');
extractFile('app.js');
