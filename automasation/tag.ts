import process from 'process'
import simpleGit from 'simple-git'
import fs from 'fs'

const git = simpleGit()


async function Exec() {
    const tagMesssage = await fs.promises.readFile('out/tag.md', "utf8")
    const result = await git.addAnnotatedTag(`v${process.env.npm_package_version}`, tagMesssage)
    console.log(`created tag v${process.env.npm_package_version}`)
}


Exec().catch(e => {
    if (e.GitError)
        console.error(e.GitError)
    else
        console.error(e)
    process.exit(1)
})
