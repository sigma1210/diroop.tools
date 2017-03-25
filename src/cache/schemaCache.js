(function(ng,factory){
  'use strict';
  /**
   * @ngdoc service
   * @name drSchemaCache
   *
   * @description
   * Adding via the `drSchemaCache` service:
   *
   * ```js
   * var _app = angular.module('myApp', []);
   * _app.run(function(drSchemaCache) {
   *   drSchemaCache.put('sibling/siblingSchema.json', schemaJson);
    });
   * });
   * ```
   *  get it via the drSchemaCache service:
   * ```js
   *  drSchemaCache.get('sibling/siblingSchema.json');
   * ```
   */
  factory('drSchemaCache',['$cacheFactory',  _schemaCache]);
  function _schemaCache($cacheFactory){
    var JSON_SCHEMA_NAME_SPACE='drSchemaCache';
    //define the interface
    var schemaCache={
      info:_info,
      put:_put,
      get:_get,
      remove:_remove,
      removeAll:_removeAll,
      destroy : _destroy,
      hasKey:_hasKey,
      getUris:_getUris,
    };

    var _cache=null,
        _uris =[],
        _cacheTree = null;

    /**
      * @ngdoc function
      * @name drSchemaCache.info
      *
      * @description
      *  Used to request information about the schema cache
      * @returns  a collections of informations relating to the cache-
      *
    */
    function _info(){
      return _schemaCache().info();
    }


    /**
      * @ngdoc function
      * @name drSchemaCache.put
      * @param {string} uri the key other schemas with use to request the cache
      * @param {object} schema a schema adhering to
      * @description

      * @returns  the schema that was put into schema cache
      *
    */

    function _put(uri,schema){

      if(schema && uri){
          //schema.id = key;
          _addUri(uri);
          _schemaCache().put(uri,schema);
      }

    }

    /**
      * @ngdoc function
      * @name drSchemaCache.get
      * @param {string} uri the key other schemas with use to request the cache
      * @description

      * @returns  the schema that was put into schema cache
      *
    */


    function _get(uri){

      return _schemaCache().get(uri);
    }


    /**
      * @ngdoc function
      * @name drSchemaCache.remove
      * @param {string} uri the key other schemas with use to request the cache
      * @description
          removes the schema from cache
      * @returns  null
      *
    */

    function _remove(uri){
      _schemaCache().remove(uri);
      _removeUri(uri);
    }

    /**
      * @ngdoc function
      * @name drSchemaCache.removeAll
      * @description
          removes all schema from cache
      * @returns  null
      *
    */
    function _removeAll(){
      _schemaCache().removeAll();
      _uris=[];
    }

    /**
      * @ngdoc function
      * @name drSchemaCache.destroy
      * @description
          destroys cache
      * @returns  null
      *
    */

    function _destroy(){
      _uris=[];
      _schemaCache().destroy();
    }


    /**
      * @ngdoc function
      * @name drSchemaCache.getUris
      * @description
          gets a list of cache uris
      * @returns  returns a list of cache keys
      *
    */
    function _getUris(){
      return _uris;
    }
    /*private functions*/

    // private add an uri to list
    function _addUri(uri){
      if(!schemaCache.hasKey(uri)){
        _uris.push(uri);
      }
    }
    // private remmove ori from list
    function _removeUri(uri){
      //see http://underscorejs.org/#without
      _uris =_.without(_uris,uri);
    }


    /**
      * @ngdoc function
      * @name drSchemaCache.hasKey
      * @description
          returns true if the cache is storing a schema at the uri
      * @returns  boolean true if the uri is stored
      *
    */
    function _hasKey(uri){
      return _.contains(_uris,uri);
    }

    // a untility funtion used to initialize and return the cache when needed
    function _schemaCache(){
      if(!_cache){
        _cache= $cacheFactory(JSON_SCHEMA_NAME_SPACE);
      }
      return _cache;
    }

    return schemaCache;
  }
})(angular, angular.module('diroop.tools').factory);
