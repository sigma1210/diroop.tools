(function(){
    "use strict";
    /**
     * schemaPacker
     * Converts JSON.SCHEMA files into Javascript files which contain an AngularJS module which automatically pre-loads the Schema
     *  into the [schemaCache]. This enables the schemaCache: to serve a json schema server in the same manor xmlspy exposes a common
     *  xsd schema server to serve common schemas from a single well defined route
     * @param [options] - The plugin options
     * @param [options.moduleName] - The name of the module which will be generated.
     * @param [options.declareModule] - Whether to try to create the module. Default true, if false it will not create options.moduleName.
     * @param [options.prefix] - The prefix which should be added to the start of the url
     * @returns {stream}
     */

    var TEMPLATES = {
        /**
          deja-vu
          The following template puts a
        **/
        SCHEMA_PUT: "(function(ng) {\n" +
        "try {\n" +
        "  app = ng.module('<%= moduleName %>');\n" +
        "} catch (e) {\n" +
        "  app = ng.module('<%= moduleName %>', ['diroop.tools']);\n" +
        "}\n" +
        "app.run(['drSchemaCache', function(schemaCache) {\n" +
        "  schemaCache.put('<%= template.url %>',\n<%= template.schemaJSON %>);\n" +
        "}]);\n" +
        "})(angular);\n",
    };

    var lodash = require("lodash");
    var gutil = require("gulp-util");
    var map = require("map-stream");

module.exports=function(options) {

    function schema2js(file, callback) {
        if (file.isStream()) {
            return callback(new Error("schemaPackeger: Streaming not supported"));
        }

        if (file.isBuffer()) {
            file.contents = new Buffer(generateModuleDeclaration(file, options));
            var extension = '.js';
            if(options && options.extension) {
              extension = options.extension;
            }
            file.path = gutil.replaceExtension(file.path, extension);
        }
        return callback(null, file);
    }
    function generateModuleDeclaration(schemaFile, options) {
        var template = TEMPLATES.SCHEMA_PUT;
        var templateParams = getTemplateParams();

        return lodash.template(template)(templateParams);

        function getTemplateParams() {
            var params = {
                template: {
                    url: getTemplateUrl()
                }
            };
            params.moduleName = options.moduleName;
            params.template.schemaJSON = String(schemaFile.contents);
            return params;
        }
        function getTemplateUrl() {
            // Start with the relative file path
            var url = schemaFile.relative;
            // Replace '\' with '/' (Windows)
            url = url.replace(/\\/g, "/");
            if (options) {
                // Add the prefix
                if (options.prefix) {
                    url = options.prefix + url;
                }
                // Rename the url
                if (lodash.isFunction(options.rename)) {
                    url = options.rename(url, schemaFile);
                }
            }
            return url;
        }
    }
    return map(schema2js);
};

})();
