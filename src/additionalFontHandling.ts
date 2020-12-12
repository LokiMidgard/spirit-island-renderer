import https from 'https'
import fs from 'fs'
import path from 'path'

import unzip from 'unzipper'




export async function GetMissingFonts() {
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
        console.log()
    }
}
