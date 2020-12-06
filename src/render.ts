import nodeHtmlToImage from 'node-html-to-image'
import http from 'http'
import url from 'url'
import fs from 'fs'
import Sprit, { ImagePath } from './spiritType'
import { ToCards } from './cards'




function ToFront(spirit: Sprit): string {

    let spiritXml = ''

    return spiritXml
}

function ToLore(spirit: Sprit): string {

    let spiritXml = ''

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

        const cardBackTemplate = `
<!DOCTYPE html>
<head>
</head>
<body style='width: 488px; height: 682px;'>
    <img style='width: 488px; height: 682px; position: absolute; left: 0ox; top: 0px;' src="{{{image}}}" />
    <img style='width: 488px; height: 682px; position: absolute; left: 0ox; top: 0px;' src="${GetImageUrl('resources/Unique-Power-Back.png')}" />
</body>
</html>
`


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
            background-image: url('${GetImageUrl('resources/Parchment.jpg')}');
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
                output: './out/' + spiritInputFile + '-cards-back.png',
                html: cardBackTemplate,
                transparent: true,

                content: { image: GetImageUrl(json.image) },
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
                src: url(${GetImageUrl('dependencys/fonts/DK Snemand.otf')});
              }
              @font-face{
                font-family: 'Gobold Extra2';
                src: url(${GetImageUrl('dependencys/fonts/Gobold Extra2.otf')});
              }
              @font-face{
                font-family: JosefinSans-Regular;
                src: url(${GetImageUrl('dependencys/spirit-island-template/_global/fonts/josefin-sans/JosefinSans-Regular.ttf')});
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

export function GetImageUrl(image: ImagePath) {
    const imagePath = typeof image == 'string'
        ? image
        : image.path
    const imageSrc = fs.readFileSync(imagePath)
    const base64Image = Buffer.from(imageSrc).toString('base64')
    const dataURI = 'data:image/jpeg;base64,' + base64Image
    return dataURI
}
