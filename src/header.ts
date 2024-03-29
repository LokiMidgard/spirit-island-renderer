import chalk from "chalk"
import { version } from "./const"

const trunk = chalk.keyword('brown')
const leaf = chalk.keyword('green')
const water = chalk.keyword('blue')
const sand = chalk.keyword('yellow')


export const header = `
 ____        _      _ _                        ${leaf(`__ _.--..--._ _`)}
/ ___| _ __ (_)_ __(_) |_                   ${leaf(`.-' _/   _/\\_   \\_'-.`)}
\\___ \\| '_ \\| | '__| | __|                 ${leaf(`|__ /   _/`)}${trunk(`\\__/`)}${leaf(`\\_   \\__|`)}
 ___) | |_) | | |  | | |_                     ${leaf(`|___/\\_`)}${trunk(`\\__/`)}${leaf(`  \\___|`)}
|____/| .__/|_|_|  |_|\\__| _                         ${trunk(`\\__/`)}
|_ _|_|_| | __ _ _ __   __| |                        ${trunk(`\\__/`)}
 | |/ __| |/ _\` | '_ \\ / _\` |                     ${trunk(`    \\__/`)}
 | |\\__ \\ | (_| | | | | (_| |                          ${trunk(`\\__/`)}
|___|___/_|\\__,_|_| |_|\\__,_|                       ${sand(`____`)}${trunk(`\\__/`)}${sand(`___`)}
|  _ \\ ___ _ __   __| | ___ _ __ ___ _ __    ${sand(` . - '             ' -.`)}
| |_) / _ \\ '_ \\ / _\` |/ _ \\ '__/ _ \\ '__| ${sand(`  /                      \\`)}
|  _ <  __/ | | | (_| |  __/ | |  __/ |${water(`~~~~~~~  ~~~~~ ~~~~~  ~~~ ~~~  ~~~~~`)}
|_| \\_\\___|_| |_|\\__,_|\\___|_|  \\___|_| ${water(` ~~~   ~~~~~   ~ ~~   ~~ ~  ~ ~ ~~ ~`)}
Version: ${version}`