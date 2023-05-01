import { Configuration, OpenAIApi } from 'openai';
import config from "config";
import { createReadStream } from "fs";
class OpenAI {
    constructor() {
        this.roles = {
            ASSISTANT: 'assistant',
            USER: 'user',
            SYSTEM: 'system'
        };
        const configuration = new Configuration({
            apiKey: config.get('OPENAI_KEY')
        });
        this.openai = new OpenAIApi(configuration);
    }
    async chat(messages) {
        try {
            const res = await this.openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages
            });
            return res.data.choices[0].message;
        }
        catch (e) {
            console.log('Err while openai chat', e);
        }
    }
    async transcript(filepath) {
        try {
            const res = await this.openai.createTranscription(createReadStream(filepath), 'whisper-1');
            return res.data.text;
        }
        catch (e) {
            console.log('Err while openai transcript', e);
        }
    }
}
export const openai = new OpenAI();
//# sourceMappingURL=openai.js.map