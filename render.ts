import nodeHtmlToImage from 'node-html-to-image'
import http from 'http'
import url from 'url'
import fs from 'fs'


type Land = 'ocean'
    | 'land'
    | 'jungle'
    | 'mountain'
    | 'sand'
    | 'wetland'
    | 'costal'
    | 'inland'

type Element = 'fire'
    | 'water'
    | 'air'
    | 'moon'
    | 'sun'
    | 'animal'
    | 'plant'

type Growth = GrowthEntry | GrowthEntry[]

type GrowthEntry = 'reclaim-one'
    | 'reclaim-all'
    | 'gain-powercard'
    | {
        type: 'gain-energy',
        number: number
    }
    | {
        type: 'gain-element'
        element: Element | Element[]
    }
    | {
        type: 'add-presence'
        range: number,
        land: Land | Land[] | undefined
    }
    | MovePresents

type MovePresents = {
    type: 'move-presence'
    range: number,
    land: Land | Land[] | undefined
}

type ImagePath = string | {
    path: string,
    artistName: string
}

type TargetLand = Land
    | 'invaders'
    | 'dahan'
    | 'blight'
    | InvaderUnit
    | Counter


type InvaderUnit = 'explorer' | 'town' | 'city'

type Counter = 'desease'
    | 'wildness'
    | 'beast'
    | 'strife'
    | 'badlands'

/** Target for powers */
type Target = {
    targetType: 'land',
    sourceLand: Exclude<Land, 'costal' | 'inland'> | 'sacred' | undefined,
    range: number,
    /** If target is negated */
    negateTarget: boolean | undefined,
    targetLand: TargetLand | TargetLand[] | undefined
}
    | {
        targetType: 'spirit',
        targetSprite: 'another' | 'any' | 'yourself'
    }

export type Sprit = {
    name: string,
    image: ImagePath,
    boarder: ImagePath,
    lore: string,
    setup: string,
    playStyle: string,
    conplexety: 1 | 2 | 3 | 4 | 5,
    summaryPower: {
        offense: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
        control: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
        fear: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
        defense: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
        utility: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
    },
    specialRules: {
        title: string,
        text: string
    }[],
    growth: {
        title: string,
        choise: Growth[]
    }
    presence: {
        energy: (number | Element | (number | Element)[])[]
        card: (number | Element | 'reclaim-one' | MovePresents | (number | Element | 'reclaim-one' | MovePresents)[])[]
    },
    inatePowers: {
        speed: 'fast' | 'slow',
        name: string,
        target: Target,
        note: string,
        levels: {
            requires: {
                mana: Element,
                amount: number | undefined
            }[],
            effect: string,
        }[]
    }[],
    uniquePowers: {
        name: string,
        image: ImagePath,
        speed: 'fast' | 'slow',
        energy: number,
        mana: Element[] | Element | undefined,
        target: Target,
        effect: [string, string] | string,
        threshold: {
            requirements: {
                mana: Element
                ammount: number
            }[] | {
                mana: Element
                ammount: number
            },
            effect: string,
        } | undefined
    }[]
};


function ToFront(spirit: Sprit): string {

    let spiritXml = ''

    return spiritXml
}

function ToLore(spirit: Sprit): string {

    let spiritXml = ''

    return spiritXml
}

function ToCards(spirit: Sprit): string {
    return spirit.uniquePowers.map(power => {
        let spiritXml = `<card class='${power.speed}'>
<img class='image' src='${GetImageUrl(power.image)}' />
<cost>${power.energy}</cost>
<name>${power.name}</name>
${power.mana ? (Array.isArray(power.mana) ? power.mana.map(e => `<element class='${e}' ></element>`).join('\n') : `<element class='${power.mana}' ></element>`) : ''}

<info-title>
  <info-title-speed>SPEED</info-title-speed>
  <info-title-range>RANGE</info-title-range>
  <info-title-target>${power.target.targetType == 'land' ? 'TARGET LAND' : 'TARGET'}</info-title-target>
</info-title>


<info>
  <info-speed ></info-speed>
  <info-range>
    ${power.target.targetType == 'land' ? GetSourceIcon(power.target.sourceLand) : ''}
    ${power.target.targetType == 'land' ? `<range>${power.target.range}</range>` : '<no-range ></no-range>'}
  </info-range>
  <info-target>
    ${GetTargetIcon(power.target)}
  </info-target>
</info>

<rules-container>
  <rules>
    <div>
      ${typeof power.effect === 'string' ? power.effect : power.effect[0]} 
    </div>
    ${typeof power.effect === 'string' ? '' : '<div class="or"></div><div>'}
    ${typeof power.effect === 'string' ? '' : power.effect[1]} 
    ${typeof power.effect === 'string' ? '' : '</div>'}
  </rules>
  ${GetThreshold(power.threshold)}
</rules-container>

${typeof power.image == 'string' ? '' : `<artist-name>${power.image.artistName}</artist-name>`}
</card>
`

        return spiritXml
    }).join('\n');

    function GetThreshold(threshold: {
        requirements: {
            mana: Element;
            ammount: number;
        }[] | {
            mana: Element;
            ammount: number;
        };
        effect: string;
    } | undefined): string {
        if (threshold)
            return `<threshold>
        <threshold-line></threshold-line>
        <threshold-title>IF YOU HAVE</threshold-title>
        <threshold-condition> ${Array.isArray(threshold.requirements) ? threshold.requirements.map(x => `${x.ammount ?? ''}<icon class="${x.mana}"></icon>`) : `${threshold.requirements.ammount ?? ''}<icon class="${threshold.requirements.mana}"></icon>`}:
        </threshold-condition>
        <div>
          ${threshold.effect}
        </div>
      </threshold>`
        return ''
    }



    function GetTargetIcon(target: Target): string {
        if (target.targetType == 'spirit') {
            switch (target.targetSprite) {
                case 'another':
                    return 'ANOTHER <icon class="spirit" ></icon>'
                case 'yourself':
                    return 'YOURSELF'
                default:
                case 'any':
                    return 'ANY <icon class="spirit" ></icon>'
            }
        } else {

            switch (target.targetLand) {

                case 'blight':
                case 'costal':
                case 'dahan':
                case 'inland':
                case 'invaders':
                case 'jungle':
                case 'mountain':
                case 'ocean':
                case 'sand':
                case 'wetland':
                case 'town':
                case 'city':
                case 'explorer':
                    GetTargetLandIcon(target.targetLand)
                case undefined:
                case 'land':
                    return 'ANY';

                default:

                    if (Array.isArray(target.targetLand)) {

                        if (target.targetLand.length === 2) {
                            const first = target.targetLand[0];
                            const seccond = target.targetLand[1];
                            if (TestTwo('jungle', 'sand', first, seccond)) {
                                return '<icon class="jungle-sand" ></icon>'
                            }
                            if (TestTwo('jungle', 'wetland', first, seccond)) {
                                return '<icon class="jungle-wetland" ></icon>'
                            }

                            if (TestTwo('jungle', 'mountain', first, seccond)) {
                                return '<icon class="mountain-jungle" ></icon>'
                            }
                            if (TestTwo('sand', 'mountain', first, seccond)) {
                                return '<icon class="mountain-sand" ></icon>'
                            }
                            if (TestTwo('wetland', 'mountain', first, seccond)) {
                                return '<icon class="mountain-wetland" ></icon>'
                            }

                            if (TestTwo('sand', 'wetland', first, seccond)) {
                                return '<icon class="mountain-wetland" ></icon>'
                            }
                        }
                        return target.targetLand.map(x => GetTargetIcon).join('/')
                    }

                    return target.targetLand.toString()
            }
        }
    }

    function GetTargetLandIcon(target: TargetLand) {
        switch (target) {

            case 'blight':
                return '<icon class="blight" ></icon>'
            case 'costal':
                return 'COSTAL'
            case 'dahan':
                return '<icon class="dahan" ></icon>'
            case 'inland':
                return 'INLAND'
            case 'invaders':
                return 'INVADERS'
            case 'jungle':
                return '<icon class="jungle" ></icon>'
            case 'mountain':
                return '<icon class="mountain" ></icon>'
            case 'ocean':
                return '<icon class="ocean" ></icon>'
            case 'sand':
                return '<icon class="sand" ></icon>'
            case 'wetland':
                return '<icon class="wetland" ></icon>'
            case 'town':
                return '<icon class="town" ></icon>'
            case 'city':
                return '<icon class="city" ></icon>'
            case 'explorer':
                return '<icon class="explorer" ></icon>'

            case undefined:
            case 'land':
                return 'ANY';

            default:
                return target.toString()
        }
    }

    function GetSourceIcon(target: "land" | "ocean" | "jungle" | "mountain" | "sand" | "wetland" | "sacred" | undefined): string {
        switch (target) {
            case 'ocean':
                return '<icon class="ocean-presence" ></icon>'
            case 'jungle':
                return '<icon class="jungle-presence" ></icon>'
            case 'mountain':
                return '<icon class="mountain-presence" ></icon>'
            case 'sand':
                return '<icon class="sand-presence" ></icon>'
            case 'wetland':
                return '<icon class="wetland-presence" ></icon>'
            case 'sacred':
                return '<icon class="sacred-site" ></icon>'

            case undefined:
            case 'land':
            default:
                return ''
        }
    }
}

function TestTwo<T1, T2, S1 extends T1 | T2, S2 extends T1 | T2>(toCheckFor1: T1, toCheckFor2: T2, input1: S1, input2: S2) {
    return (toCheckFor1 == input1 && toCheckFor2 == input2) || (toCheckFor1 == input2 && toCheckFor2 == input1)
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


    const cardTemplate = `<!DOCTYPE html>

    <head>
        <link href="http://localhost:8080/_global/css/global.css" rel="stylesheet" />
        <link href="http://localhost:8080/_global/css/card.css" rel="stylesheet" />
        <script type="text/javascript" src="http://localhost:8080/_global/js/card.js" defer></script>
        <style>
        body {
          width: 976px;
        }
      </style>
    </head>
    
    <body>
    
        {{{content}}}
    
    </body>
    </html>`

    const frontTemplate = `<!DOCTYPE html>

    <head>
      <link href="http://localhost:8080/_global/css/global.css" rel="stylesheet" />
      <link href="http://localhost:8080/_global/css/board_front.css" rel="stylesheet" />
      <script type="text/javascript" src="http://localhost:8080/_global/js/board_front.js"></script>
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


    const loreTemplate = `<!DOCTYPE html>

    <head>
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

        const inputbuffer = await fs.promises.readFile(spiritInputFile, 'utf8')

        var json = JSON.parse(inputbuffer) as Sprit


        const cardContetn = ReplacePlacehoder(ToCards(json));
        const loreContetn = ReplacePlacehoder(ToLore(json));
        const frontContetn = ReplacePlacehoder(ToFront(json));


        await nodeHtmlToImage({
            output: './out/' + spiritInputFile + '-cards.png',
            html: cardTemplate,
            transparent: true,

            content: { content: cardContetn },
            waitUntil: ['domcontentloaded', 'load', 'networkidle0']
        })


        await nodeHtmlToImage({
            output: './out/' + spiritInputFile + '-lore.png',
            html: loreTemplate,
            transparent: true,

            content: { content: loreContetn },
            waitUntil: ['domcontentloaded', 'load', 'networkidle0']
        })
        await nodeHtmlToImage({
            output: './out/' + spiritInputFile + '-front.png',
            html: frontTemplate,
            transparent: true,

            content: { content: frontContetn },
            waitUntil: ['domcontentloaded', 'load', 'networkidle0']
        })

        console.log(`finished ${spiritInputFile}`)
    }

    server.close()

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

        fs.readFile('dependencys/spirit-island-template/' + pathname.substr(1), (err, data) => {

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


                res.writeHead(200, { 'Content-Type': contentType })
                res.write(data)
            }

            res.end()
        })
    })

    server.listen(8080)
    return server
}

function GetImageUrl(image: ImagePath) {
    const imagePath = typeof image == 'string'
        ? image
        : image.path
    const imageSrc = fs.readFileSync(imagePath)
    const base64Image = Buffer.from(imageSrc).toString('base64')
    const dataURI = 'data:image/jpeg;base64,' + base64Image
    return dataURI
}
