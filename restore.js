const fs = require('fs');
const readline = require('readline');

async function restore() {
    const transcriptPath = 'C:\\Users\\UNIVERSAL\\.gemini\\antigravity\\brain\\6d2f438d-8176-4868-9861-c130eebf759b\\.system_generated\\logs\\transcript.jsonl';
    
    const fileStates = {
        'd:\\coding projects\\ffc\\index.html': '',
        'd:\\coding projects\\ffc\\style.css': '',
        'd:\\coding projects\\ffc\\app.js': ''
    };
    
    const fileStream = fs.createReadStream(transcriptPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        try {
            const data = JSON.parse(line);
            if (data.step_index >= 450) break; // Stop before my recent overwrites

            if (data.tool_calls) {
                for (const tool of data.tool_calls) {
                    const args = tool.args || {};
                    let targetFile = args.TargetFile;
                    
                    if (typeof targetFile === 'string' && targetFile.startsWith('"') && targetFile.endsWith('"')) {
                        targetFile = targetFile.slice(1, -1);
                    }
                    
                    if (!targetFile) continue;
                    targetFile = targetFile.toLowerCase().replace(/\\\\/g, '\\');
                    
                    const isTrackedFile = Object.keys(fileStates).some(k => k.toLowerCase() === targetFile);
                    if (!isTrackedFile) continue;
                    
                    const actualKey = Object.keys(fileStates).find(k => k.toLowerCase() === targetFile);

                    if (tool.name === 'write_to_file') {
                        let content = args.CodeContent;
                        if (typeof content === 'string' && content.startsWith('"') && content.endsWith('"')) {
                            content = JSON.parse(content); // Unescape JSON string
                        } else if (typeof content === 'string') {
                            try { content = JSON.parse('"' + content.replace(/"/g, '\\"') + '"'); } catch (e) { }
                        }
                        fileStates[actualKey] = content;
                    } else if (tool.name === 'replace_file_content') {
                        let target = JSON.parse(args.TargetContent || '""');
                        let replacement = JSON.parse(args.ReplacementContent || '""');
                        fileStates[actualKey] = fileStates[actualKey].replace(target, replacement);
                    } else if (tool.name === 'multi_replace_file_content') {
                        let chunks = args.ReplacementChunks;
                        if (typeof chunks === 'string') chunks = JSON.parse(chunks);
                        for (const chunk of chunks) {
                            fileStates[actualKey] = fileStates[actualKey].replace(chunk.TargetContent, chunk.ReplacementContent);
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Error parsing line:', e);
        }
    }
    
    for (const [path, content] of Object.entries(fileStates)) {
        if (content) {
            fs.writeFileSync(path, content);
            console.log(`Restored ${path}`);
        }
    }
}

restore();
