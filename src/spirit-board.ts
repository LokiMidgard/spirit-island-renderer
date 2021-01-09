import Sprit, { Growth, GrowthEntry, GrowthOption, HasCost, HasSubGrowth, InatePowerLevel, InatePowers, IsGrowth, PresenceTrackOptions, SubGrowth, Target } from './spiritType'
import path from 'path'
import { FileAsDataUrl } from './main'



export function ToFront(spirit: Sprit, relativeTo: string): string {

    function Growth(growth: Growth): string {

        if (HasSubGrowth(growth)) {

            return `<growth title="${growth.title}">${growth.subGrowth.map(x => `<sub-growth title='${x.title}' >
    ${x.choice.map(GrowthTracks).join('\n')}
</sub-growth>'`).join('\n')}
</growth>`

        } else {

            return `<growth title="${growth.title}">
            ${growth.choice.map(GrowthTracks).join('\n')}
  
    </growth>`
        }
    }

    function GrowthTracks(g: GrowthOption): string {

        if (Array.isArray(g)) {
            return `<growth-group values="${GrowthValues(g)}"></growth-group>`
        } else if (HasCost(g)) {
            return `<growth-group cost="${g.cost}" values="${GrowthValues(g.growth)}"></growth-group>`
        } else {

            return `<growth-group values="${GrowthValues(g)}"></growth-group>`
        }
    }

    function GrowthValues(g: GrowthEntry | GrowthEntry[]): string {
        if (Array.isArray(g)) {
            return g.map(GrowthValues).join(';')
        } else if (typeof g === 'object') {
            if (g.type == 'add-presence') {
                return g.land && g.land !== "land"
                    ? `add-presence(${g.range}, ${g.land})`
                    : `add-presence(${g.range})`
            } else if (g.type == "gain-element") {
                return `gain-element(${g.element})`
            } else if (g.type === 'move-presence') {
                return `move-presence(${g.range})`
            } else if (g.type === 'push') {
                return `push(${g.push})`
            } else {
                return `gain-energy(${g.number})`
            }
        } else {
            return g;
        }
    }

    function SpecialRules(rule: { title: string, text: string }): string {
        return `
      <special-rules-subtitle>${rule.title}</special-rules-subtitle>
      <special-rule>
      ${rule.text}
      </special-rule>`
    }

    function TrackConvert(entry: PresenceTrackOptions | PresenceTrackOptions[]): string {
        if (Array.isArray(entry)) {
            return entry.map(TrackConvert).join('+')
        }
        else if (typeof entry == "object") {
            if (entry.type == 'move-presence') {
                return `move-presence(${entry.range})`
            }
            if (entry.type == 'push') {
                return `push(${entry.push})`
            }
            else {
                return 'undefined'
            }
        }
        else {
            return entry.toString();
        }
    }
    function InatePower(power: InatePowers): string {
        function Range(target: Target): string {
            if (target.targetType == 'land') {
                if (target.sourceLand) {
                    return `${target.sourceLand},${target.range}`
                }
                return `${target.range}`
            }
            else {
                return 'none'
            }
        }
        function Target(target: Target) {
            if (target.targetType === 'land') {
                switch (target.targetLand) {
                    case 'costal':
                    case 'inland':
                    case 'invaders':
                    case undefined:
                        return target.targetLand ?? 'ANY'
                    case 'land':
                        return 'ANY'
                    default:
                        return `{${target.targetLand}}`
                }

            } else {
                switch (target.targetSprite) {
                    case "another":
                        return 'player-spirit'
                    case "yourself":
                        return 'YOURSELF'
                    case "any":
                    default:
                        return 'ANY player-spirit'

                }
            }
        }
        function Level(level: InatePowerLevel) {
            return `
<level threshold="${level.requires.map(x => `${x.amount ?? 1}-${x.mana}`).join(',')}">
    ${level.effect}
</level>`

        }
        return `
<quick-innate-power
    name="${power.name}"
    speed="${power.speed}"
    range="${Range(power.target)}"
    target="${Target(power.target)}"
    target-title="${power.target.targetType == 'land' ? 'TARGET LAND' : 'TARGET'}"
    note="${power.note ?? ''}">
    ${power.levels.map(Level).join('\n')}
  </quick-innate-power>
`
    }

    const trackBackground = Array.isArray(spirit.trackBackground)
        ? `<style>
        energy-track-table
        {
            background-image:url(${FileAsDataUrl(spirit.trackBackground[0], relativeTo)});
        }
        card-play-track-table 
        {
            background-image:url(${FileAsDataUrl(spirit.trackBackground[1], relativeTo)});
        }
    
      </style>`
        : spirit.trackBackground
            ? `<style>
      energy-track-table,
      card-play-track-table 
      {
          background-image:url(${FileAsDataUrl(spirit.trackBackground, relativeTo)});
      }
  
    </style>`
            : ''

    let spiritXml = `

    ${trackBackground}

    <board spirit-border='${FileAsDataUrl(spirit.boarder, relativeTo)}'>
    <div class='background-graphic' style='background-size: ${spirit.imageFrontPosition?.scale ?? 100}%; background-position-x: ${spirit.imageFrontPosition?.x ?? 0}px; background-position-y: ${spirit.imageFrontPosition?.y ?? 0}px; background-image: url("${FileAsDataUrl(spirit.image, relativeTo)}");'  ></div>
    <spirit-name>
      ${spirit.name}
    </spirit-name>

    <special-rules-container>
        <section-title>SPECIAL RULES</section-title>
${spirit.specialRules.map(SpecialRules).join('\n')}
    </special-rules-container>
<right>
    ${Growth(spirit.growth)}

    <presence-tracks>
      <energy-track values="${spirit.presence.energy.map(TrackConvert).join(',')}"></energy-track>
      <card-play-track values="${spirit.presence.card.map(TrackConvert).join(',')}"></card-play-track>
    </presence-tracks>

    <innate-powers>
        ${spirit.inatePowers.map(InatePower)}
   
    </innate-powers>
    </right>
    <artist-name>${typeof spirit.image == 'object' ? spirit.image.artistName : ''}</artist-name>
  </board>
`

    return spiritXml
}

export function ToLore(spirit: Sprit, relativeTo: string): string {

    function ComplexetyNumber(i: "low" | "moderate" | "high" | "very high"): number {
        switch (i) {
            case 'low':
                return 3
            case 'moderate':
                return 4
            case 'high':
                return 5
            case 'very high':
                return 6
            default:
                return 0;
        }
    }

    let spiritXml = `
    <div class='background-graphic' style='background-size: ${spirit.imageLorePosition?.scale ?? 100}%; background-position-x: ${spirit.imageLorePosition?.x ?? 0}px; background-position-y: ${spirit.imageLorePosition?.y ?? 0}px;  background-image: url("${FileAsDataUrl(spirit.image, relativeTo)}");'  ></div>
    <board>
    <spirit-name>
        ${spirit.name}
    </spirit-name>
    <lore-description>
        ${spirit.lore}
    </lore-description>
    <second-section-container>
        <setup>
            <setup-title>SETUP:</setup-title>
            <setup-description>
                ${spirit.setup}
            </setup-description>
        </setup>
        <play-style>
            <play-style-title>Play Style:</play-style-title>
            <play-style-description>
                ${spirit.playStyle}
            </play-style-description>
        </play-style>

        <complexity>
            <complexity-title>COMPLEXITY</complexity-title>
            <!--The value property will be used to create the red box-->
            <complexity-value value="${ComplexetyNumber(spirit.complexety)}">${spirit.complexety}</complexity-value>
            <red-box></red-box>
        </complexity>
        <!--The values on each of these properties will be used to create the colored boxes-->
        <summary-of-powers>
            <table class="powers-summary">
                <tr class="power-bar">
                    <td>
                        <div class="summary-of-powers-title">Summary of Powers</summary-of-powers-title>
                    </td>
                    <td valign="bottom">
                        <div class="offense" value = "${spirit.summaryPower.offense}"></div>
                    </td>
                    <td valign="bottom">
                        <div class="control" value = "${spirit.summaryPower.control}"></div>
                    </td>
                    <td valign="bottom">
                        <div class="fear" value = "${spirit.summaryPower.fear}"></div>
                    </td>
                    <td valign="bottom">
                        <div class="defense" value = "${spirit.summaryPower.defense}"></div>
                    </td>
                    <td valign="bottom">
                        <div class="utility" value = "${spirit.summaryPower.utility}"></div>
                    </td>
                </tr>
                <tr>
                    <td></td>
                    <td>
                        <div>OFFENSE</div>
                    </td>
                    <td>
                        <div>CONTROL</div>
                    </td>
                    <td>
                        <div>FEAR</div>
                    </td>
                    <td>
                        <div>DEFENSE</div>
                    </td>
                    <td>
                        <div>UTILITY</div>
                    </td>
                </tr>
            </table>
        </div>
    </second-section-container>
</board>

    `

    return spiritXml
}


export function GetLoreTemplate(port: number | undefined) {

    const prefix = port
        ? `http://localhost:${port}`
        : path.resolve(__dirname, '../dependencys/spirit-island-template')

    return `<!DOCTYPE html>

    <head>
      <link href="${prefix}/font.css" rel="stylesheet" />
      <link href="${prefix}/_global/css/global.css" rel="stylesheet" />
      <link href="${prefix}/_global/css/board_lore.css" rel="stylesheet" />
      <script type="text/javascript" src="${prefix}/_global/js/board_lore.js"></script>
        <style>
        body {
          width: 1766px;
        }
        .background-graphic{
            width: 1766px;
            height: 1177px;
            z-index: -1;
            border-radius: 15.1px;
            position: absolute;
        }
      </style>
    </head>
    
    <body>
    
        {{{content}}}
    
    </body>
    </html>`
}

export function GetFrontTemplate(port: number | undefined) {

    const prefix = port
        ? `http://localhost:${port}`
        : path.resolve(__dirname, '../dependencys/spirit-island-template')

    return `<!DOCTYPE html>

    <head>
      <link href="${prefix}/font.css" rel="stylesheet" />
      <link href="${prefix}/_global/css/global.css" rel="stylesheet" />
      <link href="${prefix}/_global/css/board_front.css" rel="stylesheet" />
      <script type="text/javascript" src="${prefix}/_global/js/general.js"></script>
      <script type="text/javascript" src="${prefix}/_global/js/board_front.js"></script>
        <style>
        body {
          width: 1766px;
        }
        innate-powers-title{
            width: unset;
        }
        presence-tracks{
            z-index:1;
        }
        board {
            display:block;
        }
        .background-graphic{
            width: 1766px;
            height: 1177px;
            z-index: -1;
            border-radius: 15.1px;
            position: absolute;
        }

        energy-track-table,
        card-play-track-table 
        {
            background-size: 100;
            background-position-x:  right;
            background-repeat: no-repeat;
            background-position-y: center;
            height:130px;
        }

        card-play-track-table {
            margin-top: 45px;
            margin-left: -50px;
            padding-left: 14px;
        }
        energy-track-table {
            display: inline-flex;
            margin-top: -10px;
            margin-left: -50px;
        }

        artist-name {
            position: absolute;
            left: 15px;
            top: 1164px;
            width: 253px;
            height: 14px;
            color: rgba(255, 255, 255, 255);
            font-family: 'JosefinSans-Regular';
            font-size: 11px;
        }
        artist-name::before {
            content: 'Artist: ';
            color: rgba(255, 255, 255, 255);
            font-family: 'JosefinSans-Regular';
            font-size: 11px;
        }
      </style>
    </head>
    
    <body>
    <div style='width: 1766px; height: 1177px; overflow: hidden;'>
        {{{content}}}
    </div>
    </body>
    </html>`
}
