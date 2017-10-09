# diroop.tools

These tools provide common model validation using json schemas.

JSON schema is a standard that allows the annotation and validation of JSON Documents.
http://json-schema.org/

diroop tools provides a collections of Javascript utilities that allow a developer to define and package schemas within an Angular module. Developers may design there own schemas using tools such as Altova's Xmlspy https://www.altova.com/download-json-schema-editor.html or the can choose from many predefined schemas.

With the publication of the draft 4 of the json schema, http://json-schema.org/draft-04/schema schema can be broken  into smaller manageable and reusable fragments. The developer needs a tool to facilitate including  and referencing these fragments within their javascript applications with out the need to expanding the schemas by hand.

diroop.tools solves this by providing a schema cache that work in a similar way to the $templateCache provided by angular. Developers can package these schemas within there application without need to request them through a http request at build time.

The schemas are placed in a _schema cache_  the schema cache can be preloaded

This module comprises the UI services need by a viewing tool called diroop.ui 
