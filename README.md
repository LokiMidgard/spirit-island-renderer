# spirit-island-renderer

this tool renders custom spirits and there unique powers. It uses [spirit-island-template](https://github.com/Gudradain/spirit-island-template) and render thos with [node-html-to-image](https://github.com/frinyvonnick/node-html-to-image)

## Early Development

This project just started. Not everything is rendered yet

* [ ] Spirit Front
* [ ] Spirit Back (Lore)
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

## Development

If you change the spirit type you need to execute

```bash
npm run generate-schema
```

this will update the schema file.


