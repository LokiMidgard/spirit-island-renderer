export type Land = 'ocean'
    | 'land'
    | 'jungle'
    | 'mountain'
    | 'sand'
    | 'wetland'
    | 'costal'
    | 'inland'

export type Element = 'fire'
    | 'water'
    | 'air'
    | 'moon'
    | 'sun'
    | 'animal'
    | 'plant'

export type Growth = GrowthEntry | GrowthEntry[]

export type GrowthEntry = 'reclaim-one'
    | 'reclaim-all'
    | 'gain-powercard'
    | {
        type: 'gain-energy',
        number: number
    }
    | {
        type: 'gain-element'
        element: Element | Element[]
    }
    | {
        type: 'add-presence'
        range: number,
        land: Land | Land[] | undefined
    }
    | MovePresents

export type MovePresents = {
    type: 'move-presence'
    range: number
}

export type ImagePath = string | {
    path: string,
    artistName: string
}

export type TargetLand = Land
    | 'invaders'
    | 'dahan'
    | 'blight'
    | InvaderUnit
    | Counter


export type InvaderUnit = 'explorer' | 'town' | 'city'

export type Counter = 'desease'
    | 'wildness'
    | 'beast'
    | 'strife'
    | 'badlands'

/** Target for powers */
export type Target = {
    targetType: 'land',
    sourceLand: Exclude<Land, 'costal' | 'inland'> | 'sacred' | undefined,
    range: number,
    /** If target is negated */
    negateTarget: boolean | undefined,
    targetLand: TargetLand | TargetLand[] | undefined
}
    | {
        targetType: 'spirit',
        targetSprite: 'another' | 'any' | 'yourself'
    }

type Sprit = {
    name: string,
    image: ImagePath,
    imageFrontPosition: {
        x: number,
        y: number,
        scale: number
    } | undefined,
    imageCardBackPosition: {
        x: number,
        y: number,
        scale: number
    } | undefined,
    imageLorePosition: {
        x: number,
        y: number,
        scale: number
    } | undefined,

    boarder: ImagePath,
    lore: string,
    setup: string,
    playStyle: string,
    complexety: 'low' | 'moderate' | 'high' | 'very high',
    summaryPower: {
        offense: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
        control: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
        fear: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
        defense: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
        utility: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
    },
    specialRules: {
        title: string,
        text: string
    }[],
    growth: {
        title: string,
        choise: Growth[]
    }
    presence: {
        energy: (number | Element | (number | Element)[])[]
        card: (number | Element | 'reclaim-one' | MovePresents | (number | Element | 'reclaim-one' | MovePresents)[])[]
    },
    inatePowers: {
        speed: 'fast' | 'slow',
        name: string,
        target: Target,
        note: string,
        levels: {
            requires: {
                mana: Element,
                amount: number | undefined
            }[],
            effect: string,
        }[]
    }[],
    uniquePowers: {
        name: string,
        image: ImagePath,
        speed: 'fast' | 'slow',
        energy: number,
        mana: Element[] | Element | undefined,
        target: Target,
        effect: [string, string] | string,
        threshold: {
            requirements: {
                mana: Element
                ammount: number
            }[] | {
                mana: Element
                ammount: number
            },
            effect: string,
        } | undefined
    }[]
};

export default Sprit