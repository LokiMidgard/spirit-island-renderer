import nodeHtmlToImage from 'node-html-to-image'
import http from 'http'
import url from 'url'
import fs from 'fs'
import Sprit, { Growth, ImagePath } from './spiritType'
import { ToCards } from './cards'
import path from 'path'



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

    let spiritXml = `
    <div style='width: 100%; height: 100%; z-index: -1;  background-size: ${spirit.imageFrontPosition?.scale ?? 100}%; background-position-x: ${spirit.imageFrontPosition?.x ?? 0}px; background-position-y: ${spirit.imageFrontPosition?.y ?? 0}px; margin: 15px; position: absolute; background-image: url("${GetImageUrl(spirit.image, relativeTo)}");'  ></div>
    <board >
    <img class="spirit-border" src="${GetImageUrl(spirit.boarder, relativeTo)}" />
    <spirit-name>
      ${spirit.name}
    </spirit-name>

    <special-rules-container>
    <special-rules-subtitle>Mountain Home</special-rules-subtitle>
    <special-rule>
    For each {fire} showing on your {presence} tracks, do 1 Damage.
    </special-rule>
    <special-rules-subtitle>Collapse in a blast of lava and steam</special-rules-subtitle>
    <special-rule>
    Push all {beast} and any number of {dahan}.
    </special-rule>
    <special-rules-subtitle>volcanic blah blah blah</special-rules-subtitle>
    <special-rule>
    Cards gain <range-plus-1></range-plus-1> if {blight} and {strife} and {disease} and {town} and {city} and {explorer} and {beast} and {wilds} and {badlands} and {fear}
    </special-rule>${spirit.specialRules.map(SpecialRules).join('\n')}
    </special-rules-container>

    <growth title="${spirit.growth.title}">
        ${spirit.growth.choise.map(x => `<growth-group values="${GrowthTrack(x)}"></growth-group>`).join('\n')}
  
    </growth>

    <presence-tracks>
      <energy-track values="1,2,earth,3,water+earth,fire+plant,reclaim-one"></energy-track>
      <card-play-track values="1,fire,2+fire,3,move-presence(2),reclaim-one,5+reclaim-one,fire+reclaim-one"></card-play-track>
    </presence-tracks>

    <innate-powers>
      <quick-innate-power
        name="explosion"
        speed="fast"
        range="wetland-presence,1"
        target="blight"
        target-title="TARGET LAND"
        note="Destroy X (1 or more) of your {presence} in target land; {destroyed-presence} checks how many you destroyed. This Power does Damage (separately and equally) to both Invaders and {Dahan}. Ranges below can't be increased.">
        <level threshold="1-plant">
          1 Damage per 2 {fire} you have.
        </level>
        <level threshold="3-plant">
          Instead, 1 Damage per {fire} you have.
        </level>
        <level threshold="4-fire,2-air">
          You may split this Power's damage among any number of lands with {blight} where you have {presence}.
        </level>
      </quick-innate-power>
      <quick-innate-power
        name="explosion2"
        speed="slow"
        range="jungle-presence,2"
        target="player-spirit"
        target-title="TARGET"
        note="">
        <level threshold="1-plant">
          1 Damage per 2 {fire} you have.
        </level>
        <level threshold="3-plant">
          Instead, 1 Damage per {fire} you have.
        </level>
        <level threshold="4-fire,2-air">
          You may split this Power's damage among any number of lands with {blight} where you have {presence}.
        </level>
        <level threshold="7-fire">
          In {blight} where {presence} you {dahan} have {wilds} and {strife} then {badlands} and {disease}.
        </level>
      </quick-innate-power>
    </innate-powers>
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
        input = input.replace(`{${p}}`, `<icon class="${p}"></icon>`)
    }
    return input;

}


const inputs = process.argv.slice(2)//['sample-spirit.xml']

async function main() {

    if (!fs.existsSync('./out/'))
        await fs.promises.mkdir('./out/')



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
            background-image: url('${GetImageUrl('resources/Parchment.jpg', process.cwd())}');
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
            const loreContetn = ReplacePlacehoder(ToLore(json, root));
            const frontContetn = ReplacePlacehoder(ToFront(json, root));

            console.log(frontContetn)

            const cardBackTemplate = `
            <!DOCTYPE html>
            <head>
            </head>
            <body style='width: 488px; height: 682px; padding:0px; margin:0px;'>
                <div style='width: 488px; height: 682px; position: absolute; left: 0ox; top: 0px; background-image: url("${GetImageUrl(json.image, root)}"); background-size: ${json.imageCardBackPosition?.scale ?? 100}%; background-position-x: ${json.imageCardBackPosition?.x ?? 0}px; background-position-y: ${json.imageCardBackPosition?.y ?? 0}px; ' />
                <img style='width: 488px; height: 682px; position: absolute; left: 0ox; top: 0px;' src="${GetImageUrl('resources/Unique-Power-Back.png', process.cwd())}" />
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

        if (pathname == '/font.css') {
            const fontContent = `
            @font-face{
                font-family: 'DK Snemand';
                src: url(${GetImageUrl('dependencys/fonts/DK Snemand.otf', process.cwd())});
              }
              @font-face{
                font-family: 'Gobold Extra2';
                src: url(${GetImageUrl('dependencys/fonts/Gobold Extra2.otf', process.cwd())});
              }
              @font-face{
                font-family: JosefinSans-Regular;
                src: url(${GetImageUrl('dependencys/spirit-island-template/_global/fonts/josefin-sans/JosefinSans-Regular.ttf', process.cwd())});
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

        if (pathname[1] == '!') {
            fs.readFile('dependencys/fonts/' + pathname.substr(2).replace('%20', ' '), (err, data) => {

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
        }
        else {

            fs.readFile('dependencys/spirit-island-template/' + pathname.substr(1).replace('%20', ' '), (err, data) => {

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
        }
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
