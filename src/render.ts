import nodeHtmlToImage from 'node-html-to-image'
import http from 'http'
import https from 'https'
import url from 'url'
import fs from 'fs'
import Sprit, { Element, Growth, ImagePath, InatePowerLevel, InatePowers, MovePresents, PresenceTrackOptions, Target } from './spiritType'
import { ToCards } from './cards'
import path from 'path'

import unzip from 'unzipper'



function ToFront(spirit: Sprit, relativeTo: string): string {

    function GrowthTrack(g: Growth): string {
        if (Array.isArray(g)) {
            return g.map(GrowthTrack).join(';')
        } else if (typeof g === 'object') {
            if (g.type == 'add-presence') {
                return g.land && g.land !== "land"
                    ? `add-presence(${g.range}, ${g.land})`
                    : `add-presence(${g.range})`
            } else if (g.type == "gain-element") {
                return `gain-element(${g.element})`
            } else if (g.type === 'move-presence') {
                return `move-presence(${g.range})`
            } else {
                return `gain-energy(${g.number})`
            }
        } else {
            return g;
        }
    }

    function SpecialRules(rule: { title: string, text: string }): string {
        return `
      <special-rules-subtitle>${rule.title}</special-rules-subtitle>
      <special-rule>
      ${rule.text}
      </special-rule>`
    }

    function TrackConvert(entry: PresenceTrackOptions | PresenceTrackOptions[]): string {
        if (Array.isArray(entry)) {
            return entry.map(TrackConvert).join('+')
        }
        else if (typeof entry == "object") {
            if (entry.type == 'move-presence') {
                return `move-presence(${entry.range})`
            }
            else {
                return 'undefined'
            }
        }
        else {
            return entry.toString();
        }
    }
    function InatePower(power: InatePowers): string {
        function Range(target: Target): string {
            if (target.targetType == 'land') {
                if (target.sourceLand) {
                    return `${target.sourceLand},${target.range}`
                }
                return `${target.range}`
            }
            else {
                return 'none'
            }
        }
        function Target(target: Target) {
            if (target.targetType === 'land') {
                return target.targetLand ?? 'ANY'
            } else {
                switch (target.targetSprite) {
                    case "another":
                        return 'player-spirit'
                    case "yourself":
                        return 'YOURSELF'
                    case "any":
                    default:
                        return 'ANY player-spirit'

                }
            }
        }
        function Level(level: InatePowerLevel) {
            return `
<level threshold="${level.requires.map(x => `${x.amount ?? 1}-${x.mana}`).join(',')}">
    ${level.effect}
</level>`

        }
        return `
<quick-innate-power
    name="${power.name}"
    speed="${power.speed}"
    range="${Range(power.target)}"
    target="${Target(power.target)}"
    target-title="${power.target.targetType == 'land' ? 'TARGET LAND' : 'TARGET'}"
    note="${power.note ?? ''}">
    ${power.levels.map(Level).join('\n')}
  </quick-innate-power>
`
    }

    let spiritXml = `
    <div style='width: 100%; height: 100%; z-index: -1;  background-size: ${spirit.imageFrontPosition?.scale ?? 100}%; background-position-x: ${spirit.imageFrontPosition?.x ?? 0}px; background-position-y: ${spirit.imageFrontPosition?.y ?? 0}px; margin: 15px; position: absolute; background-image: url("${GetImageUrl(spirit.image, relativeTo)}");'  ></div>
    <board >
    <img class="spirit-border" src="${GetImageUrl(spirit.boarder, relativeTo)}" />
    <spirit-name>
      ${spirit.name}
    </spirit-name>

    <special-rules-container>
${spirit.specialRules.map(SpecialRules).join('\n')}
    </special-rules-container>

    <growth title="${spirit.growth.title}">
        ${spirit.growth.choise.map(x => `<growth-group values="${GrowthTrack(x)}"></growth-group>`).join('\n')}
  
    </growth>

    <presence-tracks>
      <energy-track values="${spirit.presence.energy.map(TrackConvert).join(',')}"></energy-track>
      <card-play-track values="${spirit.presence.card.map(TrackConvert).join(',')}"></card-play-track>
    </presence-tracks>

    <innate-powers>
        ${spirit.inatePowers.map(InatePower)}
   
    </innate-powers>
    <artist-name>${typeof spirit.image == 'object' ? spirit.image.artistName : ''}</artist-name>
  </board>
`

    return spiritXml
}

function ToLore(spirit: Sprit, relativeTo: string): string {

    function ComplexetyNumber(i: "low" | "moderate" | "high" | "very high"): number {
        switch (i) {
            case 'low':
                return 3
            case 'moderate':
                return 4
            case 'high':
                return 5
            case 'very high':
                return 6
            default:
                return 0;
        }
    }

    let spiritXml = `
    <div style='width: 100%; height: 100%; z-index: -1;  background-size: ${spirit.imageLorePosition?.scale ?? 100}%; background-position-x: ${spirit.imageLorePosition?.x ?? 0}px; background-position-y: ${spirit.imageLorePosition?.y ?? 0}px; border-radius: 15.1px; position: absolute; background-image: url("${GetImageUrl(spirit.image, relativeTo)}");'  ></div>
    <board>
    <spirit-name>
        ${spirit.name}
    </spirit-name>
    <lore-description>
        ${spirit.lore}
    </lore-description>
    <second-section-container>
        <setup>
            <setup-title>SETUP:</setup-title>
            <setup-description>
                ${spirit.setup}
            </setup-description>
        </setup>
        <play-style>
            <play-style-title>Play Style:</play-style-title>
            <play-style-description>
                ${spirit.playStyle}
            </play-style-description>
        </play-style>

        <complexity>
            <complexity-title>COMPLEXITY</complexity-title>
            <!--The value property will be used to create the red box-->
            <complexity-value value="${ComplexetyNumber(spirit.complexety)}">${spirit.complexety}</complexity-value>
            <red-box></red-box>
        </complexity>
        <!--The values on each of these properties will be used to create the colored boxes-->
        <summary-of-powers>
            <table class="powers-summary">
                <tr class="power-bar">
                    <td>
                        <div class="summary-of-powers-title">Summary of Powers</summary-of-powers-title>
                    </td>
                    <td valign="bottom">
                        <div class="offense" value = "${spirit.summaryPower.offense}"></div>
                    </td>
                    <td valign="bottom">
                        <div class="control" value = "${spirit.summaryPower.control}"></div>
                    </td>
                    <td valign="bottom">
                        <div class="fear" value = "${spirit.summaryPower.fear}"></div>
                    </td>
                    <td valign="bottom">
                        <div class="defense" value = "${spirit.summaryPower.defense}"></div>
                    </td>
                    <td valign="bottom">
                        <div class="utility" value = "${spirit.summaryPower.utility}"></div>
                    </td>
                </tr>
                <tr>
                    <td></td>
                    <td>
                        <div>OFFENSE</div>
                    </td>
                    <td>
                        <div>CONTROL</div>
                    </td>
                    <td>
                        <div>FEAR</div>
                    </td>
                    <td>
                        <div>DEFENSE</div>
                    </td>
                    <td>
                        <div>UTILITY</div>
                    </td>
                </tr>
            </table>
        </div>
    </second-section-container>
</board>

    `

    return spiritXml
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

async function main() {
    if (!fs.existsSync('./out/'))
        await fs.promises.mkdir('./out/')

    await GetMissingFonts()

    const server = StartServer()
    try {



        const cardTemplate = `<!DOCTYPE html>

    <head>
        <link href="http://localhost:8080/font.css" rel="stylesheet" />
        <link href="http://localhost:8080/_global/css/global.css" rel="stylesheet" />
        <link href="http://localhost:8080/_global/css/card.css" rel="stylesheet" />
        <script type="text/javascript" src="http://localhost:8080/_global/js/card.js" defer></script>
        <style>
        body {
          width: 976px;
          justify-content: start;
        }
        .or, or{
            mix-blend-mode: multiply;
        }
        rules,
        threshold-title {
            background-color: transparent;
        }
        threshold {
            background-color: rgb(255 246 84 / 60%);
        }

        threshold-line {
            width:calc((353px / 2) - (220px - (353px / 2)));
        }
        threshold-line::before{
            content:'';
            position: absolute;
            display: block;
            height: 1px;
            width: calc(353px - 220px);
            left: 220px;
            background-color:rgb(223, 196, 143);
            overflow: visible;
            color:white;
            margin-bottom:30px;
            z-index:1;
          }
          
          

        rules-container {
            background-position: center;
            background-image: url('${GetImageUrl('../resources/Parchment.jpg', __dirname)}');
          }
       rules{
            background-color: transparent important!;
        }
      </style>
    </head>
    
    <body>
        {{{content}}}
    </body>
    </html>`

        const frontTemplate = `<!DOCTYPE html>

    <head>
      <link href="http://localhost:8080/font.css" rel="stylesheet" />
      <link href="http://localhost:8080/_global/css/global.css" rel="stylesheet" />
      <link href="http://localhost:8080/_global/css/board_front.css" rel="stylesheet" />
      <script type="text/javascript" src="http://localhost:8080/_global/js/board_front.js"></script>
        <style>
        body {
          width: 1766px;
        }
        innate-powers-title{
            width: unset;
        }
        presence-tracks{
            z-index:1;
        }
        artist-name {
            position: absolute;
            left: 79px;
            top: 1164px;
            width: 253px;
            height: 14px;
            color: rgba(255, 255, 255, 255);
            font-family: 'JosefinSans-Regular';
            font-size: 11px;
        }
        artist-name::before {
            content: 'Artist: ';
            color: rgba(255, 255, 255, 255);
            font-family: 'JosefinSans-Regular';
            font-size: 11px;
        }
      </style>
    </head>
    
    <body>
    
        {{{content}}}
    
    </body>
    </html>`


        const loreTemplate = `<!DOCTYPE html>

    <head>
      <link href="http://localhost:8080/font.css" rel="stylesheet" />
      <link href="http://localhost:8080/_global/css/global.css" rel="stylesheet" />
      <link href="http://localhost:8080/_global/css/board_lore.css" rel="stylesheet" />
      <script type="text/javascript" src="http://localhost:8080/_global/js/board_lore.js"></script>
        <style>
        body {
          width: 1766px;
        }
      </style>
    </head>
    
    <body>
    
        {{{content}}}
    
    </body>
    </html>`



        for (let i = 0; i < inputs.length; i++) {
            const spiritInputFile = inputs[i];

            const root = path.resolve(process.cwd(), path.dirname(spiritInputFile));


            const inputbuffer = await fs.promises.readFile(spiritInputFile, 'utf8')

            var json = JSON.parse(inputbuffer) as Sprit


            const cardContetn = ReplacePlacehoder(ToCards(json, root));
            const loreContetn = (ToLore(json, root));
            const frontContetn = (ToFront(json, root));

            const cardBackTemplate = `
            <!DOCTYPE html>
            <head>
            </head>
            <body style='width: 488px; height: 682px; padding:0px; margin:0px;'>
                <div style='width: 488px; height: 682px; position: absolute; left: 0ox; top: 0px; background-image: url("${GetImageUrl(json.image, root)}"); background-size: ${json.imageCardBackPosition?.scale ?? 100}%; background-position-x: ${json.imageCardBackPosition?.x ?? 0}px; background-position-y: ${json.imageCardBackPosition?.y ?? 0}px; ' />
                <img style='width: 488px; height: 682px; position: absolute; left: 0ox; top: 0px;' src="${GetImageUrl('../resources/Unique-Power-Back.png', __dirname)}" />
            </body>
            </html>
            `


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


function StartServer() {
    const server = http.createServer((req, res) => {

        if (!req.url) {
            res.end()
            return
        }

        let pathname = url.parse(req.url).pathname

        if (!pathname) {
            res.end()
            return
        }


        if (pathname == '/') {

            pathname = '/index.html'
        }

        pathname = pathname.replace(/%20/g, ' ')

        if (pathname == '/font.css') {
            const fontContent = `
            @font-face{
                font-family: 'DK Snemand';
                src: url(${GetImageUrl('../dependencys/fonts/Snemand/DK Snemand.otf', __dirname)});
              }
              @font-face{
                font-family: 'Gobold Extra2';
                src: url(${GetImageUrl('../dependencys/fonts/Gobold/Gobold Extra2.otf', __dirname)});
              }
              @font-face{
                font-family: JosefinSans-Regular;
                src: url(${GetImageUrl('../dependencys/spirit-island-template/_global/fonts/josefin-sans/JosefinSans-Regular.ttf', __dirname)});
              }
              `
            // const fontContent = `@font-face{
            //     font-family: DK Snemand;
            //     src: url('!DK Snemand.otf');
            //   }

            //   @font-face{
            //     font-family: Gobold Extra2;
            //     src: url('!Gobold Extra2.otf');
            //     font-style: normal;
            //   }

            //   @font-face{
            //     font-family: Gobold Extra2;
            //     src: url('!Gobold Extra2 Italic.otf');
            //     font-style: italic;
            //   }

            //   `
            const contentType = 'text/css'
            res.writeHead(200, { 'Content-Type': contentType })
            res.write(fontContent)
            res.end()
            return
        }



        fs.readFile(path.resolve(__dirname, '../dependencys/spirit-island-template/' + pathname.substr(1)), (err, data) => {

            if (err) {

                console.error(err)

                res.writeHead(404, { 'Content-Type': 'text/plain' })
                res.write('404 - file not found')

            } else {


                let contentType = 'text/html'
                if (pathname?.endsWith('.js'))
                    contentType = 'application/javascript'
                else if (pathname?.endsWith('.png'))
                    contentType = 'Image/Png'
                else if (pathname?.endsWith('.css'))
                    contentType = 'text/css'
                else if (pathname?.endsWith('.otf'))
                    contentType = 'application/x-font-opentype'
                else if (pathname?.endsWith('.ttf'))
                    contentType = 'application/x-font-ttf'


                res.writeHead(200, { 'Content-Type': contentType })
                res.write(data)
            }

            res.end()
        })
    })

    server.listen(8080)
    return server
}

export function GetImageUrl(image: ImagePath, relativeTo: string) {
    const imagePath = typeof image == 'string'
        ? image
        : image.path

    const imageSrc = fs.readFileSync(path.resolve(relativeTo, imagePath))
    const base64Image = Buffer.from(imageSrc).toString('base64')
    const dataURI = 'data:image/jpeg;base64,' + base64Image
    return dataURI
}
