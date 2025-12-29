import fs from 'fs';
import analysefailures from './analyse.js';
import path from 'path';

export async function writeAISuggestions() {
    const results = await analysefailures();
    console.log(results)
    if (
        !results ||
        results.length === 0
    ) {
        console.log('No safe AI suggestions to apply.');
        return;
    }

    for (const result of results) {

        // Guard 2: Confidence threshold
        if (result.confidence < 40) {
            console.log(`Confidence too low. Skipping auto-fix for file ${result.title}`);
            return;
        }

        const suggestion = result.selectorSuggestions[0];
        const { old, new: replacement } = suggestion;

        const absolutePath = result.fileLocation;
        const relativePath = path.relative(process.cwd(), absolutePath);
        const filePath = path.join(process.cwd(), relativePath);

        // Read file as STRING
        const fileData = fs.readFileSync(filePath, 'utf-8');

        // Guard 3: Old selector must exist
        if (!fileData.includes(old)) {
            console.log('Old selector not found in file. Aborting.');
            return;
        }

        // Replace ONLY first occurrence
        const updatedData = fileData.replace(old, replacement);

        // Guard 4: Ensure replacement actually changed content
        if (updatedData === fileData) {
            console.log('No changes made. Aborting.');
            return;
        }

        // Write back to file
        fs.writeFileSync(filePath, updatedData, 'utf-8');

        console.log(`✅ AI fix applied to ${filePath}`);
    }
}

await writeAISuggestions()