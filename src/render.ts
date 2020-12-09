import nodeHtmlToImage from 'node-html-to-image'
import fs from 'fs'
import Sprit, {  } from './spiritType'
import { GetCardBackTemplate, GetCardTemplate, ToCards } from './cards'
import path from 'path'

import { StartServer } from './server'
import { GetFrontTemplate, GetLoreTemplate, ToFront, ToLore } from './spirit-board'


import { GetMissingFonts } from './additionalFontHandling'
import { parsed } from './main'



export async function HandleRender(cmd: parsed) {

    if (!cmd.input)
        throw new Error('Input was not set.') // this should have been checked bevor this method is calld

    const outdir = cmd.output[cmd.output.length - 1] != '/' || cmd.output[cmd.output.length - 1] != '\\'
        ? cmd.output + '/'
        : cmd.output
    if (!fs.existsSync(outdir))
        await fs.promises.mkdir(outdir)


    await GetMissingFonts()

    const server = await StartServer()
    const serverAddress = server.address()
    const port = typeof serverAddress === 'object'
        ? serverAddress?.port
        : parseInt(serverAddress.split(':')[1])
    try {



        const cardTemplate = GetCardTemplate(port)

        const frontTemplate = GetFrontTemplate(port)


        const loreTemplate = GetLoreTemplate(port)

        const inputs = typeof cmd.input === 'string'
            ? [cmd.input]
            : cmd.input

        for (let i = 0; i < inputs.length; i++) {
            const spiritInputFile = inputs[i]

            const root = path.resolve(process.cwd(), path.dirname(spiritInputFile))


            const inputbuffer = await fs.promises.readFile(spiritInputFile, 'utf8')

            var spirit = JSON.parse(inputbuffer) as Sprit


            const cardContetn = ReplacePlacehoder(ToCards(spirit, root))
            const loreContetn = (ToLore(spirit, root))
            const frontContetn = (ToFront(spirit, root))

            const cardBackTemplate = GetCardBackTemplate(spirit, root)


            await nodeHtmlToImage({
                output: outdir + path.basename(spiritInputFile) + '-cards.png',
                html: cardTemplate,
                transparent: true,

                content: { content: cardContetn },
                waitUntil: ['domcontentloaded', 'load', 'networkidle0']
            })

            await nodeHtmlToImage({
                output: outdir + path.basename(spiritInputFile) + '-cards-back.png',
                html: cardBackTemplate,
                transparent: true,


                waitUntil: ['domcontentloaded', 'load', 'networkidle0']
            })


            await nodeHtmlToImage({
                output: outdir + path.basename(spiritInputFile) + '-lore.png',
                html: loreTemplate,
                transparent: true,

                content: { content: loreContetn },
                waitUntil: ['domcontentloaded', 'load', 'networkidle0']
            })
            await nodeHtmlToImage({
                output: outdir + path.basename(spiritInputFile) + '-front.png',
                html: frontTemplate,
                transparent: true,

                content: { content: frontContetn },
                waitUntil: ['domcontentloaded', 'load', 'networkidle0']
            })

            console.log(`finished ${spiritInputFile} `)
        }
    } catch (error) {
        console.error(error)
    } finally {
        server.close()
    }
}


function ReplacePlacehoder(input: string): string {
    const placeholder = [
        'badland',
        'badlands',
        'beast',
        'beasts',
        'disease',
        'strife',
        'wild',
        'wilds',
        'fast',
        'slow',
        'blight',
        'dahan',
        'fear',
        'escalation',
        'explorer',
        'town',
        'city',
        'presence',
        'destroyed-presence',
        'sacred-site',
        'earth',
        'sun',
        'plant',
        'water',
        'moon',
        'fire',
        'air',
        'animal',
        'any-element',
        'jungle',
        'mountain',
        'sand',
        'wetland',
        'ocean',
    ]

    for (const p of placeholder) {
        input = input.replace(new RegExp(`{ ${p} } `, "g"), ` < icon class="${p}" > </icon>`)
    }
    return input;

}