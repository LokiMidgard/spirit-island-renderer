
-- lua script that can be added to an object in Tabletop Simulator to load spirits generated with this tool.

function onLoad()
    Color.Add("SoftBlue", Color.new(0.45, 0.6, 0.7))
    
    self.createButton({
        click_function = "LoadSpirit",
        function_owner = self,
        label = "Span Spirit",
        position = Vector(0.0, 0.1, 0.6),
        rotation = Vector(0, 0, 0),
        scale = Vector(0.2, 0.2, 0.2),
        width = 1800,
        height = 500,
        font_size = 300
    })

end

function LoadSpirit(object_pick, player_color)

    local url = -- replace this url with the location of your tabletop.json
        "https://raw.githubusercontent.com/LokiMidgard/spirit-island-custom-spirits/main/tabletop.json"

    local function webRequestCallback(webReturn)
        loeadedData = JSON.decode(webReturn.text)
        pos = self.getPosition()
        for key, value in pairs(loeadedData) do
            print("Load Spirit " .. key)
            t = {
                position = {x = pos.x, y = pos.y+3, z = pos.z},
                rotation = {x = 0, y = 180, z = 180},
                json = JSON.encode(value[1])
            }
            t.json = spawnObjectJSON(t)
            t = {position = {x = pos.x, y = pos.y+5, z = pos.z}, json = JSON.encode(value[2])}
            spawnObjectJSON(t)
        end
        print("All Spirits loaded")
    end
    WebRequest.get(url, function(a) webRequestCallback(a) end)
end

