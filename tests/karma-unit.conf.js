(function(mod){
  'use strict';
  var sharedConfig = require('./karma-shared.conf'),
      fs = require('fs'),
      _needed = JSON.parse(fs.readFileSync('./def/needed.json'));
 /*
  _need defines all the files needed to execute the code
    _needed={
        "lib":[
          "bower_components/angular/angular.min.js",
          "bower_components/moment/moment.js",
          "bower_components/underscore/underscore.min.js",
          "other3rdparty.js"
        ],
        testSupport:[
            "bower_components/angular-mocks/angular-mocks.js",
            "othermocks.js"
        ],
        source:[
        "all the need source files"
        ],
        tests:[
            "./tests/unit/** /*.js"
        ]
    }
   */
  mod.exports = unitTestConfig;
  function unitTestConfig(config){
    var conf = sharedConfig();
    config.set(setFiles(conf));
    function setFiles(conf){
      var f   =[].concat(_needed.lib)
                 .concat(_needed.testSupport)
                 .concat(_needed.source)
                 .concat(_needed.tests);
      conf.files = f;
      return conf;
    }
  }
})(module);
