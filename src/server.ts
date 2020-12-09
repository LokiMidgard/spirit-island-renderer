import nodeHtmlToImage from 'node-html-to-image'
import http from 'http'
import https from 'https'
import url from 'url'
import fs from 'fs'
import Sprit, { Element, Growth, ImagePath, InatePowerLevel, InatePowers, MovePresents, PresenceTrackOptions, Target } from './spiritType'
import { GetCardTemplate, ToCards } from './cards'
import path from 'path'

import unzip from 'unzipper'
import { GetImageUrl } from './render'


export function StartServer(): Promise<http.Server> {
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

    return new Promise<http.Server>(resolve => {
        server.listen(0, () => resolve(server))
    })
}
