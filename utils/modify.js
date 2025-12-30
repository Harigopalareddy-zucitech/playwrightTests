import fs from 'fs';
import path from 'path';
import analyseFailures from './analyse.js'

export async function writeAISuggestions() {
    const results = await analyseFailures();

    if (!results || results.length === 0) {
        console.log('No safe AI suggestions to apply.');
        return;
    }

    let appliedFix = false;

    for (const result of results) {
        if (result.confidence < 40) {
            console.log(`Low confidence. Skipping ${result.title}`);
            continue;
        }

        const suggestion = result.selectorSuggestions?.[0];
        if (!suggestion) continue;

        const { old, new: replacement } = suggestion;

        // 🔒 Ensure path is inside repo
        const repoRoot = process.cwd();
        const filePath = path.resolve(repoRoot, result.fileLocation);

        if (!filePath.startsWith(repoRoot)) {
            console.log(`Skipping file outside repo: ${filePath}`);
            continue;
        }

        if (!fs.existsSync(filePath)) {
            console.log(`File not found: ${filePath}`);
            continue;
        }

        const fileData = fs.readFileSync(filePath, 'utf-8');

        if (!fileData.includes(old)) {
            console.log(`Selector not found in ${filePath}`);
            continue;
        }

        const updatedData = fileData.split(old).join(replacement);

        if (updatedData === fileData) {
            console.log(`No effective change for ${filePath}`);
            continue;
        }

        fs.writeFileSync(filePath, updatedData, 'utf-8');
        console.log(`AI fix applied to ${filePath}`);
        appliedFix = true;
    }

    if (!appliedFix) {
        console.log('AI ran but produced no code changes.');
    }
}

await writeAISuggestions();
