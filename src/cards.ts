import path from 'path'
import { FileAsDataUrl } from "./main";
import Sprit, { Element, Target, TargetLand } from './spiritType'

export function ToCards(spirit: Sprit, relativeTo: string): string {
    return spirit.uniquePowers.map(power => {
        let spiritXml = `<card class='${power.speed}'>
<div class='image' style='background-image: url(${FileAsDataUrl(power.image, relativeTo)}); background-size: ${(typeof power.image == 'string' ? undefined : power.image)?.scale ?? 100}%; background-position-x: ${(typeof power.image == 'string' ? undefined : power.image)?.x ?? 0}px; background-position-y: ${(typeof power.image == 'string' ? undefined : power.image)?.y ?? 0}px; ' ></div>

<cost>${power.energy}</cost>
<name>${power.name}</name>
${power.mana ? (Array.isArray(power.mana) ? power.mana.map(e => `<element class='${e}' ></element>`).join('\n') : `<element class='${power.mana}' ></element>`) : ''}

<info-title>
  <info-title-speed>SPEED</info-title-speed>
  <info-title-range>RANGE</info-title-range>
  <info-title-target>${power.target.targetType == 'land' ? 'TARGET LAND' : 'TARGET'}</info-title-target>
</info-title>


<info>
  <info-speed ></info-speed>
  <info-range>
    ${power.target.targetType == 'land' ? GetSourceIcon(power.target.sourceLand) : ''}
    ${power.target.targetType == 'land' ? `<range>${power.target.range}</range>` : '<no-range ></no-range>'}
  </info-range>
  <info-target>
    ${GetTargetIcon(power.target)}
  </info-target>
</info>

<rules-container>
  <rules>
    <div>
      ${typeof power.effect === 'string' ? power.effect : power.effect[0]} 
    </div>
    ${typeof power.effect === 'string' ? '' : '<div class="or"></div><div>'}
    ${typeof power.effect === 'string' ? '' : power.effect[1]} 
    ${typeof power.effect === 'string' ? '' : '</div>'}
  </rules>
  ${GetThreshold(power.threshold)}
</rules-container>

${typeof power.image == 'string' ? '' : `<artist-name>${power.image.artistName}</artist-name>`}
</card>
`

        return spiritXml
    }).join('\n');

    function GetThreshold(threshold: {
        requirements: {
            mana: Element;
            ammount: number;
        }[] | {
            mana: Element;
            ammount: number;
        };
        effect: string;
    } | undefined): string {
        if (threshold)
            return `<threshold>
        <threshold-line></threshold-line>
        <threshold-title>IF YOU HAVE</threshold-title>
        <threshold-condition> ${Array.isArray(threshold.requirements) ? threshold.requirements.map(x => `${x.ammount ?? ''}<icon class="${x.mana}"></icon>`) : `${threshold.requirements.ammount ?? ''}<icon class="${threshold.requirements.mana}"></icon>`}:
        </threshold-condition>
        <div>
          ${threshold.effect}
        </div>
      </threshold>`
        return ''
    }

}

function GetTargetIcon(target: Target): string {
    if (target.targetType == 'spirit') {
        switch (target.targetSprite) {
            case 'another':
                return 'ANOTHER <icon class="spirit" ></icon>'
            case 'yourself':
                return 'YOURSELF'
            default:
            case 'any':
                return 'ANY <icon class="spirit" ></icon>'
        }
    } else {

        switch (target.targetLand) {

            case 'blight':
            case 'costal':
            case 'dahan':
            case 'inland':
            case 'invaders':
            case 'jungle':
            case 'mountain':
            case 'ocean':
            case 'sand':
            case 'wetland':
            case 'town':
            case 'city':
            case 'explorer':
                GetTargetLandIcon(target.targetLand)
            case undefined:
            case 'land':
                return 'ANY';

            default:

                if (Array.isArray(target.targetLand)) {

                    if (target.targetLand.length === 2) {
                        const first = target.targetLand[0];
                        const seccond = target.targetLand[1];
                        if (TestTwo('jungle', 'sand', first, seccond)) {
                            return '<icon class="jungle-sand" ></icon>'
                        }
                        if (TestTwo('jungle', 'wetland', first, seccond)) {
                            return '<icon class="jungle-wetland" ></icon>'
                        }

                        if (TestTwo('jungle', 'mountain', first, seccond)) {
                            return '<icon class="mountain-jungle" ></icon>'
                        }
                        if (TestTwo('sand', 'mountain', first, seccond)) {
                            return '<icon class="mountain-sand" ></icon>'
                        }
                        if (TestTwo('wetland', 'mountain', first, seccond)) {
                            return '<icon class="mountain-wetland" ></icon>'
                        }

                        if (TestTwo('sand', 'wetland', first, seccond)) {
                            return '<icon class="mountain-wetland" ></icon>'
                        }
                    }
                    return target.targetLand.map(x => GetTargetIcon).join('/')
                }

                return target.targetLand.toString()
        }
    }
}

function GetTargetLandIcon(target: TargetLand) {
    switch (target) {

        case 'blight':
            return '<icon class="blight" ></icon>'
        case 'costal':
            return 'COSTAL'
        case 'dahan':
            return '<icon class="dahan" ></icon>'
        case 'inland':
            return 'INLAND'
        case 'invaders':
            return 'INVADERS'
        case 'jungle':
            return '<icon class="jungle" ></icon>'
        case 'mountain':
            return '<icon class="mountain" ></icon>'
        case 'ocean':
            return '<icon class="ocean" ></icon>'
        case 'sand':
            return '<icon class="sand" ></icon>'
        case 'wetland':
            return '<icon class="wetland" ></icon>'
        case 'town':
            return '<icon class="town" ></icon>'
        case 'city':
            return '<icon class="city" ></icon>'
        case 'explorer':
            return '<icon class="explorer" ></icon>'

        case undefined:
        case 'land':
            return 'ANY';

        default:
            return target.toString()
    }
}

function GetSourceIcon(target: "land" | "ocean" | "jungle" | "mountain" | "sand" | "wetland" | "sacred" | undefined): string {
    switch (target) {
        case 'ocean':
            return '<icon class="ocean-presence" ></icon>'
        case 'jungle':
            return '<icon class="jungle-presence" ></icon>'
        case 'mountain':
            return '<icon class="mountain-presence" ></icon>'
        case 'sand':
            return '<icon class="sand-presence" ></icon>'
        case 'wetland':
            return '<icon class="wetland-presence" ></icon>'
        case 'sacred':
            return '<icon class="sacred-site" ></icon>'

        case undefined:
        case 'land':
        default:
            return ''
    }
}
function TestTwo<T1, T2, S1 extends T1 | T2, S2 extends T1 | T2>(toCheckFor1: T1, toCheckFor2: T2, input1: S1, input2: S2) {
    return (toCheckFor1 == input1 && toCheckFor2 == input2) || (toCheckFor1 == input2 && toCheckFor2 == input1)
}


export
    function GetCardTemplate(port: number | undefined) {

    const prefix = port
        ? `http://localhost:${port}`
        : path.resolve(__dirname, '../dependencys/spirit-island-template')

    return `<!DOCTYPE html>

    <head>
        <link href="${prefix}/font.css" rel="stylesheet" />
        <link href="${prefix}/_global/css/global.css" rel="stylesheet" />
        <link href="${prefix}/_global/css/card.css" rel="stylesheet" />
        <script type="text/javascript" src="${prefix}/_global/js/card.js" defer></script>
        <style>
        body {
          width: 976px;
          justify-content: start;
        }
        .or, or{
            mix-blend-mode: multiply;
        }
        rules,
        threshold-title {
            background-color: transparent;
        }
        threshold {
            background-color: rgb(255 246 84 / 60%);
        }

        threshold-line {
            width:calc((353px / 2) - (220px - (353px / 2)));
        }
        threshold-line::before{
            content:'';
            position: absolute;
            display: block;
            height: 1px;
            width: calc(353px - 220px);
            left: 220px;
            background-color:rgb(223, 196, 143);
            overflow: visible;
            color:white;
            margin-bottom:30px;
            z-index:1;
          }
          
          

        rules-container {
            background-position: center;
            background-image: url('${FileAsDataUrl('../resources/Parchment.jpg', __dirname)}');
          }
       rules{
            background-color: transparent important!;
        }
      </style>
    </head>
    
    <body>
        {{{content}}}
    </body>
    </html>`
}

export function GetCardBackTemplate(spirit: Sprit, relativeTo: string) {
    return `
            <!DOCTYPE html>
            <head>
            </head>
            <body style='width: 488px; height: 682px; padding:0px; margin:0px;'>
                <div style='width: 488px; height: 682px; position: absolute; left: 0px; top: 0px; background-image: url("${FileAsDataUrl(spirit.image, relativeTo)}"); background-size: ${spirit.imageCardBackPosition?.scale ?? 100}%; background-position-x: ${spirit.imageCardBackPosition?.x ?? 0}px; background-position-y: ${spirit.imageCardBackPosition?.y ?? 0}px; ' />
                <img style='width: 488px; height: 682px; position: absolute; left: 0px; top: 0px;' src="${FileAsDataUrl('../resources/Unique-Power-Back.png', __dirname)}" />
            </body>
            </html>
            `
}
