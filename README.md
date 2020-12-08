# spirit-island-renderer

this tool renders custom spirits and there unique powers. It uses [spirit-island-template](https://github.com/Gudradain/spirit-island-template) and render thos with [node-html-to-image](https://github.com/frinyvonnick/node-html-to-image)


## Early Development

This project just started.

* [x] Spirit Front
* [x] Spirit Back (Lore)
* [x] Unique Power cards
* [x] Unique Power Cards Back

* [ ] Create automatic import script for Tabletop simulator

## Getting started

To get started run:
```bash
npm run render <spirit-file.json>
```

The json needs to be conform to the shema in this repo. If your code editor supports json schema, you can use it like following:
```json
{
  "$schema": "https://raw.githubusercontent.com/LokiMidgard/spirit-island-renderer/development/spirit-schema.json",
}
```

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


