import { GetImageUrl } from "./render";
import Sprit, { Element, Target, TargetLand } from './spiritType'

export function ToCards(spirit: Sprit, relativeTo: string): string {
    return spirit.uniquePowers.map(power => {
        let spiritXml = `<card class='${power.speed}'>
<img class='image' src='${GetImageUrl(power.image, relativeTo)}' />
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
