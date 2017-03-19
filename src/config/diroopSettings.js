(function(ng,provider){
  'use strict';

  /**
    * @ngdoc provider
    * @name drToolsSettingsProvider
    * @memberof diroop.tools
    * @description
    *  Provides a tools for setting and asking fro configuration settings
    */

 var _settingsProvider=function(){
    var _version ='1.0.0.1.x';
    var _self = this;

    _self.setVersion = function(version){
      _version = version;
    };

    // the actuul factory
    function _drToolsSettings(){
      var drToolsSettings={
        getVersion:_getVersion,
      };
      return drToolsSettings;
      /**
        * @ngdoc function
        * @name drToolsSettings.getVersion
        *
        * @description
        *  used to request access the diroop tools version
        * @returns {string} version of diroop tools
      */
      function _getVersion(){
        return _version;
      }
    }
    _self.$get = [_drToolsSettings];
  };
  provider('drToolsSettings', [_settingsProvider]);
})(angular,angular.module('diroop.tools').provider);
