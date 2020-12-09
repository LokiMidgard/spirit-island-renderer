import chalk from 'chalk'
import fs from 'fs'
import { ImagePath } from './spiritType'
import path from 'path'



import commandlineargs from 'command-line-args'
import commandlineussage from 'command-line-usage'
import commandLineUsage from 'command-line-usage'
import { header } from './header'
import { HandleRender } from './render'
import { HandleSample } from './generateSample'


export interface parsed {
    generateSample: undefined | string | null,
    help: boolean,
    input: string[] | string | undefined,
    tabletop: string | undefined
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
    },
    {
        name: 'tabletop',
        alias: 't',
        type: String,
        description: 'This will generate a json file with all infos to automaticly load the spirit in tabletop simulator.',
        typeLabel: '<url prefix>',
    }
]

async function main() {
    const cmd = commandlineargs(optionDefinitions, {
        camelCase: true
    }) as parsed


    if (!cmd.noHeader) {
        console.log(header)
        console.log()
    }


    if (cmd.help) {
        HandleHelp()
    } else if (cmd.generateSample !== undefined) {
        HandleSample(cmd)
    } else if (cmd.input) {
        await HandleRender(cmd)
    } else {
        console.log(chalk.yellow('No arguments suplied.\n'))
        HandleHelp()
    }


}
main().catch(x =>
    console.error(x));





function HandleHelp() {
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
}

export function FileAsDataUrl(image: ImagePath, relativeTo: string) {
    const imagePath = typeof image == 'string'
        ? image
        : image.path

    const imageSrc = fs.readFileSync(path.resolve(relativeTo, imagePath))
    const base64Image = Buffer.from(imageSrc).toString('base64')
    const dataURI = 'data:image/jpeg;base64,' + base64Image
    return dataURI
}

