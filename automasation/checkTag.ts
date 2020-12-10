import process from 'process'
import simpleGit from 'simple-git'
import fs from 'fs'

const git = simpleGit()


async function Exec() {
    const tag = await git.tags([`v${process.env.npm_package_version}`])
    if (tag.all.length > 0) {
        console.error(tag.all)
        console.error(`FOUND v${process.env.npm_package_version}`)
        process.exit(1)
    }
    console.log(`v${process.env.npm_package_version} not found`)
}


Exec().catch(e => {
    if (e.GitError)
        console.error(e.GitError)
    else
        console.error(e)
    process.exit(1)
})
