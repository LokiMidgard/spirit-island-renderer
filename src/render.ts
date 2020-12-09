import nodeHtmlToImage from 'node-html-to-image'
import http from 'http'
import https from 'https'
import url from 'url'
import fs from 'fs'
import Sprit, { Element, Growth, ImagePath, InatePowerLevel, InatePowers, MovePresents, PresenceTrackOptions, Target } from './spiritType'
import { GetCardBackTemplate, GetCardTemplate, ToCards } from './cards'
import path from 'path'

import unzip from 'unzipper'
import { StartServer } from './server'
import { GetFrontTemplate, GetLoreTemplate, ToFront, ToLore } from './spirit-board'





async function main() {
    if (!fs.existsSync('./out/'))
        await fs.promises.mkdir('./out/')

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



        for (let i = 0; i < inputs.length; i++) {
            const spiritInputFile = inputs[i];

            const root = path.resolve(process.cwd(), path.dirname(spiritInputFile));


            const inputbuffer = await fs.promises.readFile(spiritInputFile, 'utf8')

            var spirit = JSON.parse(inputbuffer) as Sprit


            const cardContetn = ReplacePlacehoder(ToCards(spirit, root));
            const loreContetn = (ToLore(spirit, root));
            const frontContetn = (ToFront(spirit, root));

            const cardBackTemplate = GetCardBackTemplate(spirit, root)


            await nodeHtmlToImage({
                output: './out/' + path.basename(spiritInputFile) + '-cards.png',
                html: cardTemplate,
                transparent: true,

                content: { content: cardContetn },
                waitUntil: ['domcontentloaded', 'load', 'networkidle0']
            })

            await nodeHtmlToImage({
                output: './out/' + path.basename(spiritInputFile) + '-cards-back.png',
                html: cardBackTemplate,
                transparent: true,


                waitUntil: ['domcontentloaded', 'load', 'networkidle0']
            })


            await nodeHtmlToImage({
                output: './out/' + path.basename(spiritInputFile) + '-lore.png',
                html: loreTemplate,
                transparent: true,

                content: { content: loreContetn },
                waitUntil: ['domcontentloaded', 'load', 'networkidle0']
            })
            await nodeHtmlToImage({
                output: './out/' + path.basename(spiritInputFile) + '-front.png',
                html: frontTemplate,
                transparent: true,

                content: { content: frontContetn },
                waitUntil: ['domcontentloaded', 'load', 'networkidle0']
            })

            console.log(`finished ${spiritInputFile}`)
        }
    } catch (error) {
        console.error(error)
    } finally {
        server.close()
    }


}
main().catch(x =>
    console.error(x));




export function GetImageUrl(image: ImagePath, relativeTo: string) {
    const imagePath = typeof image == 'string'
        ? image
        : image.path

    const imageSrc = fs.readFileSync(path.resolve(relativeTo, imagePath))
    const base64Image = Buffer.from(imageSrc).toString('base64')
    const dataURI = 'data:image/jpeg;base64,' + base64Image
    return dataURI
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
        input = input.replace(new RegExp(`{${p}}`, "g"), `<icon class="${p}"></icon>`)
    }
    return input;

}

async function GetMissingFonts() {
    await ResolveFonts('https://dl.dafont.com/dl/?f=dk_snemand', '../dependencys/fonts/Snemand/DK Snemand.otf', '../dependencys/fonts/Snemand/License & FAQ.pdf')
    await ResolveFonts('https://dl.dafont.com/dl/?f=gobold', '../dependencys/fonts/Gobold/Gobold Extra2.otf', '../dependencys/fonts/Gobold/Read Me.txt')
}


const inputs = process.argv.slice(2)//['sample-spirit.xml']


async function ResolveFonts(url: string, ...filePath: string[]) {


    const missingPathes = filePath.map(x => path.resolve(__dirname, x))
        .filter(x => !fs.existsSync(x))

    if (missingPathes.length > 0) {


        const zipPath = path.resolve(__dirname, '../temp.zip')
        console.log(`Missing ${missingPathes}. Try to download...`)
        await new Promise<void>((resolve, reject) => {

            const file = fs.createWriteStream(zipPath)
            https.get(url, (res) => {
                res.on('error', error => reject(error))
                res.on('data', data => file.write(data))
                res.on('end', () => {
                    file.end()
                    resolve()
                })
            })
        })

        if (!fs.existsSync(path.dirname(missingPathes[0]))) {
            fs.promises.mkdir(path.dirname(missingPathes[0]), { recursive: true })
        }

        // for (let index = 0; index < missingPathes.length; index++) {
        //     const expectedPath = missingPathes[index];



        let filenames = missingPathes.map(x => {
            return {
                name: path.basename(x),
                path: x
            }
        })



        console.log('Extracting...')

        await new Promise<void>((resolve, reject) => {

            let fileFound = 0
            fs.createReadStream(zipPath)
                .pipe(unzip.Parse())
                .on('entry', async (entry: unzip.Entry) => {
                    const potentialFile = filenames.filter(x => x.name == entry.path)
                    if (potentialFile.length > 0) {
                        const currentFile = potentialFile[0]
                        fileFound++
                        await new Promise<void>(resolve =>
                            entry.pipe(fs.createWriteStream(currentFile.path))
                                .on('close', () => resolve()))
                        console.log(`DId write ${currentFile.name}`)
                        filenames = filenames.filter(x => x.name != currentFile.name)
                    } else {
                        entry.autodrain()
                    }
                })
                .on('close', () => {
                    if (fileFound)
                        resolve()
                    else
                        reject(new Error(`Did not find ${filenames} in zip.`))
                })

        })
        console.log(`${filePath} resolved`)
        // }
        await fs.promises.unlink(zipPath)
    }
}
