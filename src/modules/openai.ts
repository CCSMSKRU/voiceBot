import {ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi} from 'openai'
import config from "config"
import {createReadStream} from "fs"

interface IRoles {
    [key:string]:ChatCompletionRequestMessageRoleEnum
}

class OpenAI {
    roles:IRoles = {
        ASSISTANT:'assistant',
        USER:'user',
        SYSTEM:'system'
    }
    openai:any
    constructor() {
        const configuration = new Configuration({
            apiKey:config.get('OPENAI_KEY')
        })
        this.openai = new OpenAIApi(configuration)
    }

    async chat(messages:ChatCompletionRequestMessage[]){
        try {
            const res = await this.openai.createChatCompletion({
                model:'gpt-3.5-turbo',
                messages
            })
            return res.data.choices[0].message
        } catch (e) {
            console.log('Err while openai chat', e)
        }
    }

    async transcript(filepath:string):Promise<string|undefined>{
        try {
            const res = await this.openai.createTranscription(
                createReadStream(filepath),
                'whisper-1'
            )
            return res.data.text
        } catch (e) {
            console.log('Err while openai transcript', e)
        }
    }
}

export const openai = new OpenAI()
