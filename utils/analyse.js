
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

function loadOptionalDomSnippet(domPath) {
    if (!fs.existsSync(domPath)) return null;
    return fs.readFileSync(domPath, 'utf-8');
}

function loadScreenshotBase64(imagePath) {
    if (!fs.existsSync(imagePath)) return null;
    return fs.readFileSync(imagePath).toString('base64');
}

export default async function analyseFailures() {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not set');
    }
    let results = []
    const reportPath = path.join(process.cwd(), 'results.json');
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    for (const suite of report.suites ?? []) {
        for (const spec of suite.specs ?? []) {
            let failures = []
            for (const test of spec.tests ?? []) {
                for (const result of test.results ?? []) {
                    if (result.status !== 'passed') {
                        for (const error of result.errors ?? []) {
                            if (!error.location) continue
                            failures.push({
                                title: spec.title,
                                error: error.message,
                                stack: result.error.stack,
                                location: error.location
                            })
                        };
                    }
                }
            }

            if (!failures.length) return { message: 'No failures' };

            const failure = failures[0]; // analyze first failure only (important!)

            const testResultDir = path.join(
                process.cwd(),
                'test-results',
                failure.title,
                'ai-context'
            );

            const domSnippet = loadOptionalDomSnippet(
                path.join(testResultDir, `${failure.title}.html`)
            );

            const screenshotBase64 = loadScreenshotBase64(
                path.join(testResultDir, `${failure.title}.png`)
            );

            const prompt = `
Analyze the following Playwright failure using only provided data and provide solutions based on the provided DOM snippet.

Failure:
${JSON.stringify(failure, null, 2)}

Rules:
- If it is a timing/selector issue, provide new selector by analysing the DOM snippet
- Confidence <= 50 if DOM does not confirm selector.

DOM snippet:
${domSnippet ?? 'NOT PROVIDED'}

Return ONLY valid JSON:
{
  "title": "",
  "summary": "...",
  "DOM Snippet Analysed": "true|false",
  "failureType": "selector | timing | assertion | environment | unknown",
  "fileLocation": "...",
  "confidence": 0,
  "selectorSuggestions": [
    {
      "old": "...",
      "new": "...",
      "reason": "..."
    }
  ]
}
`;

            const messages = [
                {
                    role: 'system',
                    content: 'You are a senior automation test engineer. Proficient using playwright JS/TS.'
                },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        ...(screenshotBase64
                            ? [{
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/png;base64,${screenshotBase64}`
                                }
                            }]
                            : [])
                    ]
                }
            ];

            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages,
                temperature: 0.2
            });

            const raw = response.choices[0].message.content;

            const cleaned = raw
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            results.push(JSON.parse(cleaned));
        }
    }
    return results
}

