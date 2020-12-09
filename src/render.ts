import nodeHtmlToImage from 'node-html-to-image'
import chalk from 'chalk'
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


import commandlineargs from 'command-line-args'
import commandlineussage from 'command-line-usage'
import commandLineUsage from 'command-line-usage'


interface parsed {
    generateSample: undefined | string | null,
    help: boolean,
    input: string[] | string | undefined,
    output: string,
    noHeader: boolean
}


const optionDefinitions: (commandlineargs.OptionDefinition & commandlineussage.OptionDefinition)[] = [
    {
        name: 'help',
        alias: 'h',
        description: 'Display this usage guide.',
        type: Boolean,
        defaultValue: false,
    },
    {
        name: 'no-header',
        description: 'supresses the header',
        defaultValue: false,
        type: Boolean
    },
    {
        name: 'generate-sample',
        alias: 's',
        type: String,
        description: 'Writes a sample spirit and all nessesarry additional files in the folder.  (defaults to current folder)',
        typeLabel: '[<target folder>]'
    },
    {
        name: 'input',
        alias: 'i',
        type: String,
        multiple: true,
        defaultOption: true,
        description: 'The input files to process. The files must be in spirit json format.',
        typeLabel: ' <spirit file> [<aditonal spirits>...]'

    },
    {
        name: 'output',
        alias: 'o',
        type: String,
        description: 'The location where the rendered spiret will be saved. (defaults to ./out/)',
        typeLabel: '<folder>',
        defaultValue: './out/'
    }
]


const trunk = chalk.keyword('brown')
const leaf = chalk.keyword('green')
const water = chalk.keyword('blue')
const sand = chalk.keyword('yellow')


const header = `
 ____        _      _ _                        ${leaf(`__ _.--..--._ _`)}
/ ___| _ __ (_)_ __(_) |_                   ${leaf(`.-' _/   _/\\_   \\_'-.`)}
\\___ \\| '_ \\| | '__| | __|                 ${leaf(`|__ /   _/`)}${trunk(`\\__/`)}${leaf(`\\_   \\__|`)}
 ___) | |_) | | |  | | |_                     ${leaf(`|___/\\_`)}${trunk(`\\__/`)}${leaf(`  \\___|`)}
|____/| .__/|_|_|  |_|\\__| _                         ${trunk(`\\__/`)}
|_ _|_|_| | __ _ _ __   __| |                        ${trunk(`\\__/`)}
 | |/ __| |/ _\` | '_ \\ / _\` |                     ${trunk(`    \\__/`)}
 | |\\__ \\ | (_| | | | | (_| |                          ${trunk(`\\__/`)}
|___|___/_|\\__,_|_| |_|\\__,_|                       ${sand(`____`)}${trunk(`\\__/`)}${sand(`___`)}
|  _ \\ ___ _ __   __| | ___ _ __ ___ _ __    ${sand(` . - '             ' -.`)}
| |_) / _ \\ '_ \\ / _\` |/ _ \\ '__/ _ \\ '__| ${sand(`  /                      \\`)}
|  _ <  __/ | | | (_| |  __/ | |  __/ |${water(`~~~~~~~  ~~~~~ ~~~~~  ~~~ ~~~  ~~~~~`)}
|_| \\_\\___|_| |_|\\__,_|\\___|_|  \\___|_| ${water(` ~~~   ~~~~~   ~ ~~   ~~ ~  ~ ~ ~~ ~`)}
Version: ${process.env.npm_package_version}`
async function main() {


    const cmd = commandlineargs(optionDefinitions, {
        camelCase: true
    }) as parsed

    if (!cmd.noHeader) {
        console.log(header)
        console.log()
    }

    if (cmd.generateSample !== undefined) {
        if (cmd.input) {
            console.warn(chalk.yellow(`Input parameters ${cmd.input} ignored when generating sample`))
        }
        const outputDir = path.resolve(process.cwd(), cmd.generateSample ? cmd.generateSample : '.')
        console.log(`Generate sample spirit in ${chalk.blue(outputDir)}`)


        if (!fs.existsSync(outputDir)) {
            await fs.promises.mkdir(outputDir, { recursive: true })
        }

        const sampleDir = path.resolve(__dirname, '../sample')
        const sampleDirIteration = await fs.promises.readdir(sampleDir)

        const spiritArray: { path: string, name: string }[] = [];

        for (let i = 0; i < sampleDirIteration.length; i++) {
            const fileName = sampleDirIteration[i];
            const sourcePath = path.resolve(sampleDir, fileName)
            const targetPath = path.resolve(outputDir, fileName)

            if (path.extname(fileName) == '.json') {
                let spiritContent: string
                let spiritName: string
                if (fs.existsSync(targetPath)) {

                    try {

                        spiritContent = await fs.promises.readFile(targetPath,
                            {
                                encoding: 'utf8'
                            })
                    } catch (error) {
                        console.error(`Failed to read file\n\tfrom: ${chalk.blue(sourcePath)}\n\n\t${chalk.red(error)}`)
                        continue;
                    }
                    const spirtJson = JSON.parse(spiritContent);
                    spiritName = spirtJson.name

                    console.warn(chalk.yellow(`Skip existing file: ${chalk.blue(targetPath)}`))
                } else {
                    try {

                        spiritContent = await fs.promises.readFile(sourcePath,
                            {
                                encoding: 'utf8'
                            })
                    } catch (error) {
                        console.error(`Failed to read file\n\tfrom: ${chalk.blue(sourcePath)}\n\n\t${chalk.red(error)}`)
                        continue;
                    }
                    const spirtJson = JSON.parse(spiritContent);
                    spirtJson['$schema'] = `https://raw.githubusercontent.com/LokiMidgard/spirit-island-renderer/v${process.env.npm_package_version}/spirit-schema.json`
                    spiritName = spirtJson.name



                    try {
                        await fs.promises.writeFile(targetPath, JSON.stringify(spirtJson, undefined, 2), {
                            encoding: 'utf8',
                            mode: fs.constants.O_CREAT
                        })
                    } catch (error) {
                        console.error(`Failed to write file\n\tto:   ${chalk.blue(targetPath)}\n\n\t${chalk.red(error)}`)
                        continue;
                    }
                }
                spiritArray.push({ path: targetPath, name: spiritName })
            } else {
                try {
                    if (fs.existsSync(targetPath)) {
                        console.warn(chalk.yellow(`Skip existing file: ${chalk.blue(targetPath)}`))
                        continue;
                    }

                    await fs.promises.copyFile(sourcePath, targetPath, fs.constants.COPYFILE_EXCL)
                } catch (error) {
                    console.error(`Failed to copy file\n\tfrom: ${chalk.blue(sourcePath)}\n\tto:   ${chalk.blue(targetPath)}\n\n\t${chalk.red(error)}`)
                    continue;
                }
            }
        }

        for (let i = 0; i < spiritArray.length; i++) {
            const spirit = spiritArray[i];
            console.log()
            console.log(`To create the spirit ${chalk.gray(spirit.name)} execute following command:`)
            const relativJsonPath = path.relative(process.cwd(), spirit.path)
            if (relativJsonPath.includes(' ')) {
                console.error(chalk.red(`\tThe path ${chalk.blue(relativJsonPath)} contains spaces. Unfortunatly npx does not support spaces ${chalk.yellowBright('(¬_¬;)')} `))
            }
            else {
                console.log(chalk.greenBright(`\tnpx sir ${chalk.blue(relativJsonPath)} `))
            }
        }

        return;
    }

    if (!cmd.input || cmd.help) {

        const usage = commandLineUsage([

            {
                header: 'Options',
                optionList: optionDefinitions,
            },
            {
                content: 'Project home: {underline https://github.com/LokiMidgard/spirit-island-renderer}'
            }
        ])

        console.log(usage)

        console.log()
        return;
    }

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
            const spiritInputFile = inputs[i];

            const root = path.resolve(process.cwd(), path.dirname(spiritInputFile));


            const inputbuffer = await fs.promises.readFile(spiritInputFile, 'utf8')

            var spirit = JSON.parse(inputbuffer) as Sprit


            const cardContetn = ReplacePlacehoder(ToCards(spirit, root));
            const loreContetn = (ToLore(spirit, root));
            const frontContetn = (ToFront(spirit, root));

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
        input = input.replace(new RegExp(`{ ${p} } `, "g"), ` < icon class="${p}" > </icon>`)
    }
    return input;

}

async function GetMissingFonts() {
    await ResolveFonts('https://dl.dafont.com/dl/?f=dk_snemand', '../dependencys/fonts/Snemand/DK Snemand.otf', '../dependencys/fonts/Snemand/License & FAQ.pdf')
    await ResolveFonts('https://dl.dafont.com/dl/?f=gobold', '../dependencys/fonts/Gobold/Gobold Extra2.otf', '../dependencys/fonts/Gobold/Read Me.txt')
}




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
