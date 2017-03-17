(function(mod){
  'use strict';
  mod.exports = karmaConf;

  var _testSharedDef ={
      basePath: '../',
      frameworks: ['jasmine'],
      preprocessors: {
         'src/**/*.js': ['coverage']
       },
       reporters: ['progress', 'teamcity', 'coverage'],
       coverageReporter: {
         dir: 'coverage/',
         reporters: [
             { type: 'html', subdir: 'html' },
             { type: 'teamcity', subdir: '.' }
           ]
        },
      browsers: ['Chrome'],
      autoWatch: true,
      singleRun: false,
      colors: true,
    };

 function karmaConf(){
   return _testSharedDef;
 }

})(module);
