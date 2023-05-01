import {session, Telegraf} from "telegraf"
import config from 'config'
import {message} from "telegraf/filters"
import {URL} from "url"
import {ogg} from "./modules/ogg.js"
import {unlink} from "fs/promises"
import {openai} from "./modules/openai.js"
import {code} from "telegraf/format"

const initState = ()=>{
    return {
        messages:[]
    }
}

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

bot.use(session())

const start = async (ctx:any)=>{
    // @ts-ignore
    ctx.session = initState()

    await ctx.reply('Hello! This bot was written by Ivan using the tutorial by Vladilen Minin.')
}

bot.command('new', start)
bot.command('start', start)

bot.on(message('text'), async ctx=>{
    // @ts-ignore
    ctx.session ??= initState()
    // Здесь обрабатываем текстовые сообщения
    await ctx.reply(code(`Please, wait...`))
    try {
        // @ts-ignore
        ctx.session.messages.push({
            role:openai.roles.USER,
            content:ctx.message.text
        })

        // @ts-ignore
        const res = await openai.chat(ctx.session.messages)
        // @ts-ignore
        ctx.session.messages.push({
            role:openai.roles.ASSISTANT,
            content:res.content
        })
        await ctx.reply(res.content)

    } catch (e) {
        console.log('Err while working with openai', e)
    }
})

bot.on(message('voice'), async ctx=>{
    // @ts-ignore
    ctx.session ??= initState()
    // Здесь обрабатываем голосовые сообщения
    await ctx.reply(code(`Please, wait...`))
    const userId = String(ctx.message.from.id)
    const link:URL = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
    const filename = `${userId}_${new Date().valueOf()}`

    const oggPath = await ogg.create(link.href, filename)
    if (!oggPath) {
        console.log('Error while creating ogg file')
        return
    }
    const mp3Path = await ogg.toMp3(oggPath, filename)
    if (!mp3Path){
        console.log('mp3Path is not defined')
        return
    }
    // unlink
    try {
        await unlink(oggPath)
    } catch (e) {
        console.log('Err while unlink oggPath', e)
    }

    try {
        const txt = await openai.transcript(mp3Path)
        // unlink mp3
        try {
            await unlink(mp3Path)
        } catch (e) {
            console.log('Err while unlink mp3Path', e)
        }
        if (!txt){
            console.log('txt is empty')
            await ctx.reply(code(`Empty message. Please, try again`))
            return
        }
        await ctx.reply(code(`Your request: ${txt}`))

        // @ts-ignore
        ctx.session.messages.push({
            role:openai.roles.USER,
            content:txt
        })

        // @ts-ignore
        const res = await openai.chat(ctx.session.messages)
        // @ts-ignore
        ctx.session.messages.push({
            role:openai.roles.ASSISTANT,
            content:res.content
        })
        await ctx.reply(res.content)

    } catch (e) {
        console.log('Err while working with openai', e)
    }

})

// bot.command('start', async ctx =>{
//     await ctx.reply('Hello! This bot was written by Ivan using the tutorial by Vladilen Minin.')
// })

bot.launch()

process.once('SIGINT', ()=>bot.stop('SIGINT'))
process.once('SIGTERM', ()=>bot.stop('SIGTERM'))
// process.once('SIGKILL', ()=>bot.stop('SIGKILL'))
// process.once('SIGSTOP', ()=>bot.stop('SIGSTOP'))
