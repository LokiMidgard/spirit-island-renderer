import nodeHtmlToImage from 'node-html-to-image'
import http from 'http'
import https from 'https'
import url from 'url'
import fs from 'fs'
import Sprit, { Element, Growth, ImagePath, InatePowerLevel, InatePowers, MovePresents, PresenceTrackOptions, Target } from './spiritType'
import { GetCardBackTemplate, GetCardTemplate, ToCards } from './cards'
import path from 'path'

import unzip from 'unzipper'
import { StartServer } from './server'
import { GetImageUrl } from './render'



export function ToFront(spirit: Sprit, relativeTo: string): string {

    function GrowthTrack(g: Growth): string {
        if (Array.isArray(g)) {
            return g.map(GrowthTrack).join(';')
        } else if (typeof g === 'object') {
            if (g.type == 'add-presence') {
                return g.land && g.land !== "land"
                    ? `add-presence(${g.range}, ${g.land})`
                    : `add-presence(${g.range})`
            } else if (g.type == "gain-element") {
                return `gain-element(${g.element})`
            } else if (g.type === 'move-presence') {
                return `move-presence(${g.range})`
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
                return target.targetLand ?? 'ANY'
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

    let spiritXml = `
    <div style='width: 100%; height: 100%; z-index: -1;  background-size: ${spirit.imageFrontPosition?.scale ?? 100}%; background-position-x: ${spirit.imageFrontPosition?.x ?? 0}px; background-position-y: ${spirit.imageFrontPosition?.y ?? 0}px; margin: 15px; position: absolute; background-image: url("${GetImageUrl(spirit.image, relativeTo)}");'  ></div>
    <board >
    <img class="spirit-border" src="${GetImageUrl(spirit.boarder, relativeTo)}" />
    <spirit-name>
      ${spirit.name}
    </spirit-name>

    <special-rules-container>
${spirit.specialRules.map(SpecialRules).join('\n')}
    </special-rules-container>

    <growth title="${spirit.growth.title}">
        ${spirit.growth.choise.map(x => `<growth-group values="${GrowthTrack(x)}"></growth-group>`).join('\n')}
  
    </growth>

    <presence-tracks>
      <energy-track values="${spirit.presence.energy.map(TrackConvert).join(',')}"></energy-track>
      <card-play-track values="${spirit.presence.card.map(TrackConvert).join(',')}"></card-play-track>
    </presence-tracks>

    <innate-powers>
        ${spirit.inatePowers.map(InatePower)}
   
    </innate-powers>
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
    <div style='width: 100%; height: 100%; z-index: -1;  background-size: ${spirit.imageLorePosition?.scale ?? 100}%; background-position-x: ${spirit.imageLorePosition?.x ?? 0}px; background-position-y: ${spirit.imageLorePosition?.y ?? 0}px; border-radius: 15.1px; position: absolute; background-image: url("${GetImageUrl(spirit.image, relativeTo)}");'  ></div>
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
    return `<!DOCTYPE html>

    <head>
      <link href="http://localhost:${port}/font.css" rel="stylesheet" />
      <link href="http://localhost:${port}/_global/css/global.css" rel="stylesheet" />
      <link href="http://localhost:${port}/_global/css/board_lore.css" rel="stylesheet" />
      <script type="text/javascript" src="http://localhost:${port}/_global/js/board_lore.js"></script>
        <style>
        body {
          width: 1766px;
        }
      </style>
    </head>
    
    <body>
    
        {{{content}}}
    
    </body>
    </html>`
}

export function GetFrontTemplate(port: number | undefined) {
    return `<!DOCTYPE html>

    <head>
      <link href="http://localhost:${port}/font.css" rel="stylesheet" />
      <link href="http://localhost:${port}/_global/css/global.css" rel="stylesheet" />
      <link href="http://localhost:${port}/_global/css/board_front.css" rel="stylesheet" />
      <script type="text/javascript" src="http://localhost:${port}/_global/js/board_front.js"></script>
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
        artist-name {
            position: absolute;
            left: 79px;
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
    
        {{{content}}}
    
    </body>
    </html>`
}