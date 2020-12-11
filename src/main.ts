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
    license: boolean,
    input: string[] | string | undefined,
    tabletop: string | undefined
    output: string,
    noHeader: boolean,
    html: boolean
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
        name: 'license',
        description: 'Displays license information.',
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
    },
    {
        name: 'html',
        type: Boolean,
        description: 'Will Output HTML files instead of images',
    }
]

async function main() {

    let cmd: parsed
    try {
        cmd = commandlineargs(optionDefinitions, {
            camelCase: true
        }) as parsed

    } catch (error) {
        if (error?.optionName) {
            console.error(chalk.red(`Failed to parse option: ${error?.optionName}`))
        } else {
            console.error(chalk.red(error))
        }
        HandleHelp();
        return;
    }


    if (!cmd.noHeader) {
        console.log(header)
        console.log()
    }

    if (cmd.license) {
        console.log(chalk.underline('Licenses'))
        console.log()
        console.log('The images/icons come from the Spirit Island Wiki which state:')
        console.log(chalk.gray(`\tContent is available under ${chalk.green('Creative Commons Attribution-NonCommercial-ShareAlike')} unless otherwise noted.`))
        console.log()

        console.log('The HTML Templates are from spirit-island-template project and under:')
        console.log(chalk.green('\tMIT'))
        console.log()

        console.log('The Fonts')
        console.log(chalk.magenta('JosefinSans-Regular'))
        console.log(chalk.green('\tOpen Font License') + chalk.grey.italic(' included'))
        console.log()
        console.log(chalk.magenta('Gobold Extra2'))
        console.log(chalk.green('\tFree for private use') + chalk.gray.italic(' downloaded on demand'))
        console.log(chalk.grey(`\tsee:\n\t${chalk.blue(path.resolve(__dirname, '../dependencys/fonts/Gobold/Read Me.txt'))}`))
        console.log()
        console.log(chalk.magenta('DK Snemand (demo)'))
        console.log(chalk.green('\tFree for private use') + chalk.grey.italic(' downloaded on demand'))
        console.log(chalk.grey(`\tsee:\n\t${chalk.blue(path.resolve(__dirname, '../dependencys/fonts/Snemand/License & FAQ.pdf'))}`))
        console.log()
    }

    if (cmd.help) {
        HandleHelp()
    } else if (cmd.generateSample !== undefined) {
        HandleSample(cmd)
    } else if (cmd.input) {
        await HandleRender(cmd)
    } else if (cmd.license) {
        // already handled
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

