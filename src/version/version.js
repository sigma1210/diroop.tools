(function(ng,directive){
  'use strict';
  directive('drToolVersion',['$log',_drVersion]);
  function _drVersion(){
    //@todo get from config
    var DIROOP_TOOL_VERSION ='v 1.0.0.0';

    return {
      templateUrl:'drTemplateCache:/version/version.html',
      link :_link,
    }
    function _link(scope,elem,attrs){
      scope.version = DIROOP_TOOL_VERSION;
    }
  }

})(angular,angular.module('diroop.tools').directive);
