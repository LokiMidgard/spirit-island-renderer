import nodeHtmlToImage from 'node-html-to-image'

import fs from 'fs'

class TestClass {
    constructor(v: string) {
        this._value = v;
    }


    private _value: string;
    public get value(): string {
        return this._value;
    }
    public set value(v: string) {
        this._value = v;
    }


}

async function main() {


    console.log('Hello World')

    const t = new TestClass('Seccond')
    await fs.promises.mkdir('./out/')

    await nodeHtmlToImage({
        output: './out/image.png',
        html: '<html><body>Hello world!</body></html>'
    })
    console.log('Finished')
}
main();