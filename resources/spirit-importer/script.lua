-- lua script that can be added to an object in Tabletop Simulator to load spirits generated with this tool.
function onLoad() LoadData() end

local data = nil
local json_url = nil
function LoadData() startLuaCoroutine(self, "LoadDataCo") end

function LoadDataCo()
    if (json_url == nil) then
        local table = self.UI.getXmlTable()
        while table == nil or table[1] == nil or table[1].children == nil or table[1].children[1] == nil do
            Wt(0.5)
            table = self.UI.getXmlTable()
        end
        json_url = self.UI.getXmlTable()[1].children[1].value
    end

    local url = json_url
    if url == nil then return end
    local function starts_with(str, start) return str:sub(1, #start) == start end

    if starts_with(url, 'https://') or starts_with(url, 'http://') then
        local function webRequestCallback(webReturn)
            data = JSON.decode(webReturn.text)
            startLuaCoroutine(self, "HandleSpiritsCo")
        end

        WebRequest.get(url, function(a) webRequestCallback(a) end)
    else
        broadcastToAll(
            'Only URLs starting with "http://" or "https://" ares supported',
            {r = 1, g = 0, b = 0})

        -- havn't found out a way to open a local file. Propably securety resons...
        -- local function read_file(path)
        --     local file = io.open(path, "rb") -- r read mode and b binary mode
        --     if not file then return nil end
        --     local content = file:read "*a" -- *a or *all reads the whole file
        --     file:close()
        --     return content
        -- end

        -- local content = read_file(url)
        -- data = content
        -- startLuaCoroutine(self, "HandleSpiritsCo")
    end
    return 1
end

function UpdateUrl(player, value, id) json_url = value end

function HandleSpiritsCo()
    local loeadedData = data
    if data == nil then return end

    local ui = self.UI.getXmlTable()
    local list = {}
    ui[1].children[3].children[1].children = list
    ui[1].children[1].value = json_url

    local numberOfEntrys = 0

    local customAssets = UI.getCustomAssets()
    if customAssets == nil then customAssets = {} end

    for key, value in pairs(loeadedData) do

        local backFace = value[2].CustomDeck[next(value[2].CustomDeck)].BackURL
        -- backFace = Next(pairs(value[2].CustomDeck))--.value.BackURL
        local found = false
        for key2, value2 in pairs(customAssets) do
            if value2.name == key then found = true end
        end
        if found == false then
            customAssets[#customAssets + 1] = {name = key, url = backFace}
        end
        numberOfEntrys = numberOfEntrys + 1
        local currentElement = {
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
    Wt(0.5)
    ui[1].children[3].children[1].attributes.height = numberOfEntrys * 200

    self.UI.setXmlTable(ui)
    print("All Spirits loaded")
    return 1
end

function LoadSpirit(object_pick, player_color, arg1)

    local pos = self.getPosition()
    -- the offset is only for the spirit, the power cards look good at there position
    local offset = {x = 4, y = -1.3}
    local value = self.getTable("spiritData")[arg1]

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
end

function Wt(some)
    local Time = os.clock() + some
    while os.clock() < Time do coroutine.yield(0) end
end
