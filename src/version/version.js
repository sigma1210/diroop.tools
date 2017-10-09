(function(ng,component){
  'use strict';
  /**
   * @ngdoc component
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
      <dr:tool:version></dr:tool:version>
  **/
  component('drToolVersion',{
      templateUrl:'drTemplateCache:/version/version.html',
      controller:['$log','$filter','drToolsSettings','drCacheTreeService',function($log,$filter,settings,drCacheTreeService){
        var DIROOP_TOOL_VERSION ='diroop.tools : v:version';
        var _self = this;
        _self.version=$filter('format')(DIROOP_TOOL_VERSION,{
            version:settings.getVersion()
        });
      }]
  });
})(angular,angular.module('diroop.tools').component);
