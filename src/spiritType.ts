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
    | 'earth'

export type ElementWithAny = Element | 'any'

export type Growth = SubGrowth
    | { title: string, subGrowth: SubGrowth[] }

export function HasSubGrowth(growth: Growth): growth is { title: string, subGrowth: SubGrowth[] } {
    return (growth as any).subGrowth !== undefined
}
export type SubGrowth = {
    title: string,
    choice: GrowthOption[]
}

export type GrowthOption = {
    cost: number
    growth: GrowthEntry | GrowthEntry[]
} | GrowthEntry | GrowthEntry[]

export function HasCost(g : GrowthOption) : g is {
    cost: number
    growth: GrowthEntry | GrowthEntry[]
}{
return (g as any).cost !== undefined
}

export type GrowthEntry = 'reclaim-one'
    | 'reclaim-all'
    | 'gain-power-card'
    | 'forget-power-card'
    | {
        type: 'push',
        push: Token
    }
    | {
        type: 'gain-energy',
        number: number
    }
    | {
        type: 'gain-element'
        element: ElementWithAny | ElementWithAny[]
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

export type Token = Counter | InvaderUnit | "dahan" | "blight"

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

export type InatePowerLevel = {
    requires: {
        mana: Element,
        amount: number | undefined
    }[],
    effect: string,
}
export type InatePowers = {
    speed: 'fast' | 'slow',
    name: string,
    target: Target,
    note: string | undefined,
    levels: InatePowerLevel[]
}

export type ImagePosition = {
    x: number,
    y: number,
    scale: number
}
export type PresenceTrackOptions = number | ElementWithAny | 'reclaim-one' | MovePresents | "forget-power-card"
    | {
        "type": "push"
        "push": Token
    }

type Sprit = {
    $schema:string | undefined,
    name: string,
    image: ImagePath,
    imageFrontPosition: ImagePosition | undefined,
    imageCardBackPosition: ImagePosition | undefined,
    imageLorePosition: ImagePosition | undefined,

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
    growth: Growth,
    presence: {
        energy: (PresenceTrackOptions | PresenceTrackOptions[])[]
        card: (PresenceTrackOptions | PresenceTrackOptions[])[]
    },
    inatePowers: InatePowers[],
    uniquePowers: PowerCard[]
};

export function IsGrowth(tocheck: { "cost": number, "growth": Growth } | Growth): tocheck is Growth {
    return !((tocheck as any).cost)
}

export type PowerCard = {
    name: string,
    image: (Exclude<ImagePath, string> & Partial<ImagePosition>) | string,
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
}
export default Sprit