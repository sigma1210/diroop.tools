(function(ng,directive){
  'use strict';

  /**
   * @ngdoc directive
   * @name drToolsVersion
   * @memberof diroop.tools
   * @requires $log                - can't live without $log
   * @requires $filter             - provide access to json filter
   * @requires drToolsSettings
                  as settings       - provide access to app settings
   * @restrict E
   * @description
        a directive used to display current diroop tools version
   * @example
      <ssatb:json:viewer entity="theObjectToBeDisplayed" />
  **/





  directive('drToolVersion',['$log','$filter','drToolsSettings',_drVersion]);
  function _drVersion($log,$filter,settings){
    //@todo get from config

    var DIROOP_TOOL_VERSION ='diroop.tools : v:version';

    return {
      templateUrl:'drTemplateCache:/version/version.html',
      link :_link,
    };

    function _link(scope,elem,attrs){
      scope.version = $filter('format')(DIROOP_TOOL_VERSION,{
        version:settings.getVersion()
      });
    }

  }

})(angular,angular.module('diroop.tools').directive);
