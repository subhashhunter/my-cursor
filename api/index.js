import OpenAI from "openai";
import { exec } from "node:child_process";
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";


const openai = new OpenAI({
    apiKey:process.env.OPENAI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

async function executecommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, function (err, stdout, stderr) {
            if (err) return reject(err);
            resolve(`stdout: ${stdout}\n${stderr}`);
        });
    });
}

function getWeather(cityName) {
    return `${cityName} has temp 42 degree C`;
}

function writeFile({ filename, content }) {
    writeFileSync(filename, content, "utf8");
    return `Written to ${filename}`;
}

// Tool map
const TOOL_MAP = {
    getWeather,
    executecommand,
    writeFile
};

// System prompt
const SYSTEM_PROMPT = `
You are a helpful AI assistant who resolves the user's query.
You work in phases: start → think → action → observe → output.

START: User gives a query.
THINK: Think 3-4 times. Decide if a tool is needed.
ACTION: Call the required tool with input.
OBSERVE: Wait for tool output.
THINK: Reflect on the observation.
OUTPUT: Final response.

Rules:
- Always wait for next step.
- Output a single step in each message.
- Respond strictly in JSON.
- Use only available tools.

Available Tools:
- getWeather(city: string): string
- executecommand(command: string): string
- writeFile({ filename: string, content: string }): string

Example:
START: What is weather in patiala?
THINK: The user is asking for the weather of Patiala.
THINK: I should call getWeather.
ACTION: getWeather("patiala")
OBSERVE: "32 degree C"
THINK: The result from getWeather is 32 degree C.
OUTPUT: The weather in Patiala is 32°C.

Output format:
{"step":"string","tool":"string","content":"string","input":"string | object"}
`;


async function init() {
    const messages = [
        {
            role: "system",
            content: SYSTEM_PROMPT
        }
    ];

    const user_query = "First create a folder named WEATHER in current directory and then create a weather applocation using html,css and js inside that folder which must be completely running"
    messages.push({ role: 'user', content: user_query });

    while (true) {
        const response = await openai.chat.completions.create({
            model: "gemini-2.0-flash",
            response_format: { type: "json_object" },
            messages: messages
        });

        const message = response.choices[0].message.content;
        console.log("AI Response:", message);

        messages.push({ role: "assistant", content: message });

        const parsed_response = JSON.parse(message);

        if (parsed_response.step === "think") {
            console.log("🤔", parsed_response.content);
            continue;
        }

        if (parsed_response.step === "output") {
            console.log("✅", parsed_response.content);
            break;
        }

        if (parsed_response.step === "action") {
            const tool = parsed_response.tool;
            const input = parsed_response.input;

            // Parse input if it's a JSON stringified object
            const parsedInput = typeof input === "string" && input.trim().startsWith("{")
                ? JSON.parse(input)
                : input;

            console.log(`🔧 Calling tool: ${tool} with`, parsedInput);
            const value = await TOOL_MAP[tool](parsedInput);

            messages.push({
                role: "assistant",
                content: JSON.stringify({
                    step: "observe",
                    content: value
                })
            });

            continue;
        }
    }
}

init().catch(console.error);

