import chalk from 'chalk'
import fs from 'fs'
import path from 'path'



import { parsed } from './main'


export async function HandleSample(cmd: parsed): Promise<void> {
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
            console.log(chalk.greenBright(`\tnpx spirit-island-renderer ${chalk.blue(relativJsonPath)} `))
        }
    }
}
