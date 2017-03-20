(function(ng,factory){
  'use strict';
  /**
   * @ngdoc service
   * @name drSchemaListService
   * @memberof diroop.tools
   * @requires $q                  - always return a promise
   * @requires $log                - log errors
   * @requires drSchemaCache
                  as schemaCahe    - the schema cache
   * @description
        provides a collection of utilities to access the current list of cached
        schemas.
   */
  factory('drSchemaListService',['$q','$log','$filter','drSchemaCache',drSchemaListService]);
  function drSchemaListService($q,$log,$filter,schemaCache){
     var schemaListService={
       search:_search
     };
     return schemaListService;

    function _search(text,num){
      num = num||15;
      var _res = [];
      return $q(function(resolve,reject){
         if(!(text&&text.length>1)){
           resolve(_res);
         }else{
           var _schemas = schemaCache.getUris();
           var results = _.first($filter('filter')(_schemas,text),num);
           ng.forEach(results,function(res){
             _res.push({
               label:res,
               path:res
             });
           });
           resolve(_res);
         }
      });
    }

  }
})(angular,angular.module('diroop.tools').factory);
