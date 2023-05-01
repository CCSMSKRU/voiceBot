import axios from "axios"
import {createWriteStream} from "fs"

import ffmpeg from 'fluent-ffmpeg'
import installer from '@ffmpeg-installer/ffmpeg'

import {dirname, resolve} from 'path'
import {fileURLToPath} from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

class OggConvertor {
    constructor() {
        ffmpeg.setFfmpegPath(installer.path)
    }

    async toMp3(input:string, filename:string):Promise<string|undefined> {

        try {
            const outPath = resolve(dirname(input), `${filename}.mp3`)

            return new Promise((resolve, reject)=>{
                ffmpeg(input)
                    .inputOption('-t 30')
                    .output(outPath)
                    .on('end', ()=>resolve(outPath))
                    // .on('error', err=> reject(err.message))
                    .on('error', err=> reject(err.message))
                    .run()
            })
        } catch (e) {
            console.log('Error while toMp3', e)
        }
    }

    async create(url: string, filename: string):Promise<string|undefined> {

        const oggPath = resolve(__dirname, '../../audio', `${filename}.ogg`)

        try {
            const res = await axios({
                method: 'get',
                url,
                responseType: 'stream'
            })

            return new Promise((resolve, reject)=>{
                const stream = createWriteStream(oggPath)
                res.data.pipe(stream)

                stream.on('finish', ()=>resolve(oggPath))
            })


        } catch (e) {
            console.log('Err while get ogg file', {e, url})
        }
    }
}

export const ogg = new OggConvertor()
