-- lua script that can be added to an object in Tabletop Simulator to load spirits generated with this tool.
function onLoad() LoadData() end

data = nil
function LoadData()

    local url = -- "https://raw.githubusercontent.com/LokiMidgard/spirit-island-custom-spirits/deploy/tabletop.json"
    self.UI.getXmlTable()[1].children[1].value
    local function webRequestCallback(webReturn)
        data = JSON.decode(webReturn.text)
        startLuaCoroutine(self, "HandleSpiritsCo")
    end
    if (url) then WebRequest.get(url, function(a) webRequestCallback(a) end) end
end

function HandleSpiritsCo()
    local loeadedData = data
    if data == nil then return end

    ui = self.UI.getXmlTable()
    list = {}
    ui[1].children[3].children[1].children = list

    numberOfEntrys = 0

    local customAssets = UI.getCustomAssets()
    if customAssets == nil then customAssets = {} end

    for key, value in pairs(loeadedData) do

        backFace = value[2].CustomDeck[next(value[2].CustomDeck)].BackURL
        -- backFace = Next(pairs(value[2].CustomDeck))--.value.BackURL
        found = false
        for key2, value2 in pairs(customAssets) do
            if value2.name == key then found = true end
        end
        if found == false then
            customAssets[#customAssets + 1] = {name = key, url = backFace}
        end
        numberOfEntrys = numberOfEntrys + 1
        currentElement = {
            tag = "Panel",
            attributes = {
                childForceExpandHeight = true,
                childAlignment = "UpperLeft",
                height = 200
            },
            children = {
                {
                    tag = "Button",

                    attributes = {
                        onClick = "LoadSpirit",
                        id = key,
                        height = 50,
                        width = 110,
                        offsetXY = "0 75"

                    },
                    value = key
                }, {
                    tag = "Image",
                    attributes = {
                        image = key,
                        type = "Filled",
                        height = 150,
                        width = 110,
                        offsetXY = "0 -25"
                    }
                }
            }
        }

        list[#list + 1] = currentElement
    end

    self.setTable("spiritData", loeadedData)
    UI.setCustomAssets(customAssets)
    wt(0.5)
    ui[1].children[3].children[1].attributes.height = numberOfEntrys * 200

    self.UI.setXmlTable(ui)
    print("All Spirits loaded")
end

function LoadSpirit(object_pick, player_color, arg1)

    print(object_pick)
    print(player_color)
    print(arg1)

    pos = self.getPosition()
    -- the offset is only for the spirit, the power cards look good at there position
    offset = {x = 4, y = -1.3}
    value = self.getTable("spiritData")[arg1]

    t = {
        position = {x = pos.x + offset.x, y = pos.y + 3, z = pos.z + offset.y},
        rotation = {x = 0, y = 180, z = 180},
        json = JSON.encode(value[1])
    }
    t.json = spawnObjectJSON(t)
    t = {
        position = {x = pos.x, y = pos.y + 5, z = pos.z},
        json = JSON.encode(value[2])
    }
    spawnObjectJSON(t)
    print("loaded")

end

function wt(some)
    local Time = os.clock() + some
    while os.clock() < Time do coroutine.yield(0) end
end
