// inject angular as ng
// inject gular.module('diroop.tools').provider as provider
(function(ng,provider){
  'use strict';
  /**
    * @ngdoc provider
    * @name drToolsSettingsProvider
    * @memberof diroop.tools
    * @description
    *  Provides a tools for setting and asking for configuration settings
    */

 var _settingsProvider=function(){
   //the default version
    var _version ='1.0.0.1.x';
    //use _self as a reference to the current instance
    var _self = this;
    /**
     * @name drToolsSettings.setVersion
     * @module diroop.tools
     * @description
     *  set the current version of diroop.tools

     * @param {version} string the string value for the version of diroop.tools
     */
    _self.setVersion = function(version){
      // set the version to the string
      _version = version;
    };
    // the actual factory retyurn by the provider
    function _drToolsSettings(){
      // define the interface to be exposed
      var drToolsSettings={
        getVersion:_getVersion,
      };
      return drToolsSettings;
      /**
        * @ngdoc function
        * @name drToolsSettings.getVersion
        * @module diroop.tools
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
