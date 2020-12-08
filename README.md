# spirit-island-renderer

this tool renders custom spirits and there unique powers. It uses [spirit-island-template](https://github.com/Gudradain/spirit-island-template) and render those with [node-html-to-image](https://github.com/frinyvonnick/node-html-to-image)


## Early Development

This project just started.

* [x] Spirit Front
* [x] Spirit Back (Lore)
* [x] Unique Power cards
* [x] Unique Power Cards Back

* [ ] Create automatic import script for Tabletop simulator

## Getting started


Create a JSON file that holds all your spirit data. Look in the sample folder for an example or use it as your first spirit. The JSON file needs to be conform to the json schema in this repo. If your code editor supports JSON-Schema, you can enable auto-completion and warnings adding the following entry at the top:
```json
{
  "$schema": "https://raw.githubusercontent.com/LokiMidgard/spirit-island-renderer/development/spirit-schema.json",
  // your spirit data like name etc...
}
```

*The sample uses the local schema file in this repo so when you move the JSON it will no longer find the schema. Replace the schema entry in the sample with the one above.*



### Get the program
Install the program using npm

```bash
npm i spirit-island-renderer -g
```

then execute it using

```bash
npm exec sir <spirit-file.json>

```


**OR**

Download this repository


```bash
# Init the submodules
git submodule init
git submodule update

# Install the dependencys
npm install

# Create your first spirit
npm run render <spirit-file.json>
```

------------------------------



You can also look in the sample folder.

To use the correct fonts copy the fonts to the folder `dependencys/fonts`. You will find a read me there describing what you need. The fonts are needed for [spirit-island-template](https://github.com/Gudradain/spirit-island-template) where you can find a description how to obtain a copy of those files.

### Sample output

![Face of the spirit board](docs/Ashes%20renews%20the%20land.json-front.png)
![Lore of the spirit board](docs/Ashes%20renews%20the%20land.json-lore.png)
![Back of the unique power card](docs/Ashes%20renews%20the%20land.json-cards-back.png" )
![Face of the unique power card](docs/Ashes%20renews%20the%20land.json-cards.png "Face of the unique power card")

## Development

If you change the spirit type you need to execute

```bash
npm run generate-schema
```

this will update the schema file.
