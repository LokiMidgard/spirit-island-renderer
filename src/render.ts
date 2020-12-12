import nodeHtmlToImage from 'node-html-to-image'
import fs from 'fs'
import Sprit, { Element, PowerCard } from './spiritType'
import { GetCardBackTemplate, GetCardTemplate, ToCards } from './cards'
import path from 'path'

import { StartServer } from './server'
import { GetFrontTemplate, GetLoreTemplate, ToFront, ToLore } from './spirit-board'


import { GetMissingFonts } from './additionalFontHandling'
import { parsed } from './main'
import { spiritScript } from './bigconst'
import chalk from 'chalk'


type tableTopData = {
    [key: string]: [tableTopSpirit, tableTopDeck]
}
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
    const port = cmd.html
        ? undefined
        : typeof serverAddress === 'object'
            ? serverAddress?.port
            : parseInt(serverAddress.split(':')[1])
    try {



        const cardTemplate = GetCardTemplate(port)

        const frontTemplate = GetFrontTemplate(port)


        const loreTemplate = GetLoreTemplate(port)

        const inputs = typeof cmd.input === 'string'
            ? [cmd.input]
            : cmd.input

        const tabletopData: tableTopData = {}

        if (cmd.tabletop === null) {
            cmd.tabletop = `file:///${path.resolve(process.cwd(), outdir).replace(/\\/g, '/')}/`
        }

        if (cmd.tabletop) {
            await fs.promises.writeFile(outdir + 'SpiritImporter.json', await GenerateTableTopObject(cmd.tabletop), 'utf8')
            if (!fs.existsSync(outdir + '/spirit-importer')) {
                await fs.promises.mkdir(outdir + '/spirit-importer')
            }
            await fs.promises.copyFile(path.resolve(__dirname, '../resources/spirit-importer/front.png'), outdir + '/spirit-importer/front.png')
            await fs.promises.copyFile(path.resolve(__dirname, '../resources/spirit-importer/back.png'), outdir + '/spirit-importer/back.png')
        }

        for (let i = 0; i < inputs.length; i++) {
            const spiritInputFile = inputs[i]

            const root = path.resolve(process.cwd(), path.dirname(spiritInputFile))


            const inputbuffer = await fs.promises.readFile(spiritInputFile, 'utf8')

            var spirit = JSON.parse(inputbuffer) as Sprit


            const cardContetn = ReplacePlacehoder(ToCards(spirit, root))
            const loreContetn = (ToLore(spirit, root))
            const frontContetn = (ToFront(spirit, root))

            const cardBackTemplate = GetCardBackTemplate(spirit, root)

            // const prefix = 'file:///C:\\\\Users\\\\patri\\\\source\\\\repos\\\\spirit-island-renderer\\\\out\\\\';
            if (cmd.tabletop) {
                const prefix = cmd.tabletop
                const tabletopSpirit = createTableTopObject(spirit, prefix, spiritInputFile);
                const tabletopDeck = createTableTopDeck(spirit, prefix, spiritInputFile);
                if (tabletopData[spirit.name]) {
                    console.warn(chalk.yellow(`WARNING: Spirit ${spirit.name} defined twice!`))
                }
                tabletopData[spirit.name] = [tabletopSpirit, tabletopDeck]
            }

            if (cmd.html) {
                const htmlPath = (x: string) => path.join(outdir, path.dirname(x), path.basename(x, '.png') + '.html')

                await fs.promises.writeFile(htmlPath(GetCardsFrontName(spiritInputFile)), cardTemplate.replace('{{{content}}}', cardContetn))
                await fs.promises.writeFile(htmlPath(GetCardsBackName(spiritInputFile)), cardBackTemplate)
                await fs.promises.writeFile(htmlPath(GetSpiritLoreName(spiritInputFile)), loreTemplate.replace('{{{content}}}', loreContetn))
                await fs.promises.writeFile(htmlPath(GetSpiritFrontName(spiritInputFile)), frontTemplate.replace('{{{content}}}', frontContetn))


            } else {
                await nodeHtmlToImage({
                    output: outdir + GetCardsFrontName(spiritInputFile),
                    html: cardTemplate,
                    transparent: true,

                    content: { content: cardContetn },
                    waitUntil: ['domcontentloaded', 'load', 'networkidle0']
                })

                await nodeHtmlToImage({
                    output: outdir + GetCardsBackName(spiritInputFile),
                    html: cardBackTemplate,
                    transparent: true,


                    waitUntil: ['domcontentloaded', 'load', 'networkidle0']
                })


                await nodeHtmlToImage({
                    output: outdir + GetSpiritLoreName(spiritInputFile),
                    html: loreTemplate,
                    transparent: true,

                    content: { content: loreContetn },
                    waitUntil: ['domcontentloaded', 'load', 'networkidle0']
                })
                await nodeHtmlToImage({
                    output: outdir + GetSpiritFrontName(spiritInputFile),
                    html: frontTemplate,
                    transparent: true,

                    content: { content: frontContetn },
                    waitUntil: ['domcontentloaded', 'load', 'networkidle0']
                })
            }

            console.log(`finished ${spiritInputFile} `)
        }

        if (Object.keys(tabletopData).length > 0)
            await fs.promises.writeFile(outdir + 'tabletop.json', JSON.stringify(tabletopData))

    } catch (error) {
        console.error(error)
    } finally {
        server.close()
    }
}


function GetSpiritFrontName(spiritInputFile: string) {
    return path.basename(spiritInputFile) + '-front.png'
}

function GetSpiritLoreName(spiritInputFile: string) {
    return path.basename(spiritInputFile) + '-lore.png'
}

function GetCardsBackName(spiritInputFile: string) {
    return path.basename(spiritInputFile) + '-cards-back.png'
}

function GetCardsFrontName(spiritInputFile: string) {
    return path.basename(spiritInputFile) + '-cards.png'
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
        input = input.replace(new RegExp(`{${p}}`, "g"), `<icon class="${p}" ></icon>`)
    }
    return input;

}

type tableTopSpirit = {}
type tableTopDeck = {}

function createTableTopDeck(spirit: Sprit, prefix: string, inputFile: string): tableTopDeck {

    const deckBaseId = '456'

    const cardMatrixWidth = spirit.uniquePowers.length > 1 ? 2 : 1
    const cardMatrixHeight = Math.ceil(spirit.uniquePowers.length / 2)

    const zeroPad = (num: number, places: number) => String(num).padStart(places, '0')

    const cardId = (n: number) => deckBaseId + zeroPad(n, 2)

    const ManaToString = (power: PowerCard) => {

        const elementIndex = (e: Element) => {
            switch (e) {
                case 'sun':
                    return 0
                case 'moon':
                    return 1
                case 'fire':
                    return 2
                case 'air':
                    return 3
                case 'water':
                    return 4
                case 'earth':
                    return 5
                case 'plant':
                    return 6
                case 'animal':
                    return 7

                default:
                    return undefined
            }
        }

        let result = ['0', '0', '0', '0', '0', '0', '0', '0']
        if (typeof power.mana == 'string') {
            const index = elementIndex(power.mana)
            if (index !== undefined)
                result[index] = '1'
        } else if (power.mana) {
            for (const m of power.mana) {
                const index = elementIndex(m)
                if (index !== undefined)
                    result[index] = '1'
            }

        }

        return result.join('')
    }

    const cardTemplate = (power: PowerCard, index: number) => `
    {
        "Name": "Card",
        "Transform": {
          "posX": -110.019905,
          "posY": 0.90177685,
          "posZ": -15.9400063,
          "rotX": 0.004446839,
          "rotY": 180.000122,
          "rotZ": 9.08506E-08,
          "scaleX": 1.47602439,
          "scaleY": 1.0,
          "scaleZ": 1.47602439
        },
        "Nickname": "${power.name}",
        "Description": "",
        "GMNotes": "",
        "ColorDiffuse": {
          "r": 0.713235259,
          "g": 0.713235259,
          "b": 0.713235259
        },
        "Locked": false,
        "Grid": true,
        "Snap": true,
        "IgnoreFoW": false,
        "MeasureMovement": false,
        "DragSelectable": true,
        "Autoraise": true,
        "Sticky": true,
        "Tooltip": true,
        "GridProjection": false,
        "HideWhenFaceDown": true,
        "Hands": true,
        "CardID": ${cardId(index)},
        "SidewaysCard": false,
        "CustomDeck": {
          "${deckBaseId}": {
            "FaceURL": "${prefix}${GetCardsFrontName(inputFile)}",
            "BackURL": "${prefix}${GetCardsBackName(inputFile)}",
            "NumWidth": ${cardMatrixWidth},
            "NumHeight": ${cardMatrixHeight},
            "BackIsHidden": true,
            "UniqueBack": false,
            "Type": 0
          }
        },
        "LuaScript": "elements=\\\"${ManaToString(power)}\\\"\\nenergy=${power.energy}",
        "LuaScriptState": "",
        "XmlUI": "",
        "GUID": "f7c5d6"
      }`

    const result = `
    {
        "Name": "Deck",
        "Transform": {
          "posX": -20.26407,
          "posY": 1.00018668,
          "posZ": 12.7280445,
          "rotX": 4.543415E-07,
          "rotY": 180.026154,
          "rotZ": 180.0,
          "scaleX": 1.47602439,
          "scaleY": 1.0,
          "scaleZ": 1.47602439
        },
        "Nickname": "${spirit.name} Deck",
        "Description": "",
        "GMNotes": "",
        "ColorDiffuse": {
          "r": 0.713235259,
          "g": 0.713235259,
          "b": 0.713235259
        },
        "Locked": false,
        "Grid": true,
        "Snap": true,
        "IgnoreFoW": false,
        "MeasureMovement": false,
        "DragSelectable": true,
        "Autoraise": true,
        "Sticky": true,
        "Tooltip": true,
        "GridProjection": false,
        "HideWhenFaceDown": true,
        "Hands": false,
        "SidewaysCard": false,
        "DeckIDs": [
          ${spirit.uniquePowers.map((_, i) => cardId(i)).join(",\n")}
        ],
        "CustomDeck": {
          "${deckBaseId}": {
            "FaceURL": "${prefix}${GetCardsFrontName(inputFile)}",
            "BackURL": "${prefix}${GetCardsBackName(inputFile)}",
            "NumWidth": ${cardMatrixWidth},
            "NumHeight": ${cardMatrixHeight},
            "BackIsHidden": true,
            "UniqueBack": false,
            "Type": 0
          }
        },
        "LuaScript": "",
        "LuaScriptState": "",
        "XmlUI": "",
        "ContainedObjects": [
            ${spirit.uniquePowers.map(cardTemplate).join(',\n')}
        ],
        "GUID": "7c20c9"
      }`
    return JSON.parse(result)
}


function createTableTopObject(spirit: Sprit, prefix: string, inputFile: string): tableTopSpirit {

    const snapPoints: { x: number, y: number }[] = []

    const startX = 0.008
    const distanceX = (-1.33673549 - startX) / 6
    const energyY = -0.4
    const cardY = -0.09
    for (let i = 0; i < spirit.presence.energy.length - 1; i++) {
        snapPoints.push({ x: startX + i * distanceX, y: energyY })
    }
    for (let i = 0; i < spirit.presence.card.length - 1; i++) {
        snapPoints.push({ x: startX + i * distanceX, y: cardY })
    }

    const snappointTemplate = function (arg: { x: number, y: number }) {

        return `
      {
        "Position": {
          "x": ${arg.x},
          "y": 0.200071916,
          "z": ${arg.y}
        }
      }`
    }
    return JSON.parse(`
{
    "Name": "Custom_Tile",
    "Transform": {
      "posX": 0,
      "posY": 3,
      "posZ": 0,
      "rotX": 0,
      "rotY": 180,
      "rotZ": 0,
      "scaleX": 5.46,
      "scaleY": 1.0,
      "scaleZ": 5.46
    },
    "Nickname": "${spirit.name}",
    "Description": "Fanmade Spirit",
    "GMNotes": "",
    "ColorDiffuse": {
      "r": 1.0,
      "g": 1.0,
      "b": 1.0
    },
    "Locked": false,
    "Grid": true,
    "Snap": true,
    "IgnoreFoW": false,
    "MeasureMovement": false,
    "DragSelectable": true,
    "Autoraise": true,
    "Sticky": true,
    "Tooltip": true,
    "GridProjection": false,
    "HideWhenFaceDown": false,
    "Hands": false,
    "CustomImage": {
      "ImageURL": "${prefix}${GetSpiritFrontName(inputFile)}",
      "ImageSecondaryURL": "${prefix}${GetSpiritLoreName(inputFile)}",
      "ImageScalar": 1.0,
      "WidthScale": 0.0,
      "CustomTile": {
        "Type": 0,
        "Thickness": 0.2,
        "Stackable": false,
        "Stretch": true
      }
    },
    "LuaScript": "${spiritScript}",
    "LuaScriptState": "",
    "XmlUI": "",
    "GUID": "0499d0",
    "AttachedSnapPoints": [
${snapPoints.map(snappointTemplate).join(',\n')}
    ]
  }
`)
}


async function GenerateTableTopObject(prefix: string) {
    const script = (await fs.promises.readFile(path.resolve(__dirname, '../resources/spirit-importer/script.lua'), 'utf8'))
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '')
        .replace(/"/g, '\\"')

    const layout = (await fs.promises.readFile(path.resolve(__dirname, '../resources/spirit-importer/layout.xml'), 'utf8'))
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '')
        .replace(/"/g, '\\"')
        .replace('{{{prefix}}}', prefix)



    return `{
        "SaveName": "",
        "GameMode": "",
        "Date": "",
        "Gravity": 0.5,
        "PlayArea": 0.5,
        "GameType": "",
        "GameComplexity": "",
        "Tags": [],
        "Table": "",
        "Sky": "",
        "Note": "",
        "Rules": "",
        "TabStates": {},
        "ObjectStates": [
          {
            "Name": "Custom_Token",
            "Transform": {
              "posX": -6.676171,
              "posY": 1.06,
              "posZ": 8.140596,
              "rotX": -1.07035142E-07,
              "rotY": -5.59145E-08,
              "rotZ": 3.29649978E-08,
              "scaleX": 5.46,
              "scaleY": 1.0,
              "scaleZ": 5.46
            },
            "Nickname": "Spirit Importer",
            "Description": "Enter the location of the configuration file and press reload.\\n\\nThen you can choose a spirit on the left by cliking it's button. Thsi will spawn the spirit and its card's ready to play.",
            "GMNotes": "",
            "ColorDiffuse": {
              "r": 1.0,
              "g": 1.0,
              "b": 1.0
            },
            "Locked": false,
            "Grid": true,
            "Snap": true,
            "IgnoreFoW": false,
            "MeasureMovement": false,
            "DragSelectable": true,
            "Autoraise": true,
            "Sticky": true,
            "Tooltip": true,
            "GridProjection": false,
            "HideWhenFaceDown": false,
            "Hands": false,
            "CustomImage": {
              "ImageURL": "${prefix}spirit-importer/front.png",
              "ImageSecondaryURL": "${prefix}spirit-importer/back.png",
              "ImageScalar": 1.0,
              "WidthScale": 0.0,
              "CustomToken": {
                "Thickness": 0.2,
                "MergeDistancePixels": 15.0,
                "StandUp": false,
                "Stackable": false
              }
            },
            "LuaScript": "${script}",
            "LuaScriptState": "",
            "XmlUI": "${layout}",
            "GUID": "4b032b"
          }
        ],
        "LuaScript": "",
        "LuaScriptState": "",
        "XmlUI": "",
        "VersionNumber": ""
      }`
}