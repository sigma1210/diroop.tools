(function(ng,factory,tv){
  'use strict';
 /**
   * @ngdoc service
   * @name drTv4Service
   * @memberof diroop.tools
   * @requires $q                 - always return a promise
   * @requires $log               - need to log errors
   * @description
   *   Provides angular base access to tv4 validator
   */
  factory('drTv4Service',['$q','$log',_drTv4Service]);

  function _drTv4Service($q,$log){
    var TV4_NOT_LOADED_EXCEPTION = 'TV4 was not loaded. Insure tv4 is referenced.refer to https://github.com/geraintluff/tv4';

    // define the interface
    var drTv4Service={
      getValidator : _getValidator
    };

    return drTv4Service;
    /**
      * @ngdoc function
      * @name drTv4Service.getValidator
      *
      * @description
      *  used to request access to the the tv4 globals
      * @returns  a promise to resolve a reference to tv4.
              resolves the promise if tv4 is load
              rejects if not;
    */
    function  _getValidator(){
      return $q(function(resolve,reject){
        if(tv){
          resolve(tv);
        }else{
          reject({
            message:TV4_NOT_LOADED_EXCEPTION
          });
        }
      });
    }
  }

})(angular,angular.module('diroop.tools').factory,tv4);
