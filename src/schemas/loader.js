(function(ng,factory){
  'use strict';
  /**
   * @ngdoc service
   * @name drSchemaLoader
   * @memberof diroop.tools
   * @requires $http               - to request information via http
   * @requires $q                  - always return a promise
   * @requires $log                - log errors
   * @requires drSchemaCache       - the schema cache
   * @requires drTv4Service        - need to tv4
   * @description
   *  the drSchemaLoader servive is used to request and expanded json schema
   *  defined in accordance with the http://json-schema.org/latest/json-schema-core.html
   */

   factory('drSchemaLoader',['$http','$q','$log','drSchemaCache','drTv4Service',_drSchemaLoader]);
   function _drSchemaLoader($http,$q,$log,drSchemaCache,drTv4Service){
      var  CURRENT_URL_NOT_CACHED_EXCEPTION   = 'The current url does not have a a schema stored in drSchemaCache.',
           MAX_SCHEMA_QUOTA_EXCEPTION         = 'Maximum Schema Quota has been exceeded.',
           SCHEMA_EXPANSION_EXCEPTION         = 'An error occured expanded schema for uri.',
           TV4_INIT_EXCEPTION                 = 'An error occured initializing tv4 during schema load.',
           TV4_SCHEMA_REQUEST_EXCEPTION       = 'An error occured resolving a url from tv4',
           EXPANSION_ERROR                    = 'An unspecified error resulted in a null schema.',
           SCHEMA_SET_INTERFACE_ERROR         = 'The schema set did not meet the expected interfacte.',
           MAX_SCHEMA_QUOTA                    = 10000;
    // define the interface
      var drSchemaLoader={
          getSchemaSet: _getSchemaSet,
          getExpandedSchema:_getExpandedSchema
        };
      /*returb the servic*/
      return drSchemaLoader;
     /**
       * @ngdoc function
       * @name drSchemaLoader.getSchemaSet
       *
       * @description
       *  used to request a schema by its url and return the schema and a fresh tv4
       *  api loaded with all the the schemas dependancies
       * @param {string} uri of the schema being
       * @returns  a promise to resolve a schema by its uri with a tv4 validator
       *  loaded with all the schemas dependancies and reject if the schema or one
       *  of its  dependancies is not able to be loaded or if a reference to tv4
       *  is not available.
     */
     function _getSchemaSet(uri){
       return $q(function(resolve,reject){
             drTv4Service
              .getValidator()
              .then(function(_tv4){
                 var _newTv4      = _tv4.freshApi(),
                     _originalUri = uri,
                     _trys        = 0;
                recursiveFetch(uri);
                /* recursive function*/
                function recursiveFetch(url){
                  _trys++;
                  // drop out id schema quota exceeded
                  if(_trys>MAX_SCHEMA_QUOTA){
                   reject({
                     message:'Maximum Schema Quota Exceeed'
                   });
                  }else{
                    _loadSchemaUrl(url)
                      .then(function(_schema){
                        _newTv4.addSchema(url,_schema);
                        var _missing = _newTv4.getMissingUris();
                        if(_missing.length===0){
                          resolve({
                            schema:_newTv4.getSchema(_originalUri),
                            tv4: _newTv4
                          });
                        }else{
                          recursiveFetch(_missing[0]);
                        }

                      })
                      .catch(function(error){
                        reject(error);
                      });
                  }
                }
              })
              .catch(function(error){
                reject({
                  message:TV4_INIT_EXCEPTION,
                  innerError:error
                });
              });
       });
     }

     //private function
     /**
       Loads all cached schemas into the tv4 validator
    **/

     function _getCompleteSchemaSet(){
       return $q(function(resolve,reject){
         drTv4Service
          .getValidator()
          .then(function(_tv4){
            var _newTv4 = _tv4.freshApi();
            ng.forEach(drSchemaCache.getUris(),function(uri){
              _newTv4.addSchema(uri,drSchemaCache.get(uri));
            });
            resolve({
              tv4:_newTv4,
              schema:{}
            });
          })
          .catch(function(error){
            reject({
              message:TV4_INIT_EXCEPTION,
              innerError:error
            });
          });
       });
     }
   /**
     * @ngdoc function
     * @name drSchemaLoader.getExpandedSchema
     *
     * @description
     *  used to request a schema by its url and return the schema with all its
        $ref being expanded.
     * @param {string} uri of the schema being
     * @returns  a promise to return an expanded schema
   */

     function _getExpandedSchema(uri){
       return $q(function(resolve,reject){
          _getCompleteSchemaSet(uri)
            .then(function(schemaSet){
                schemaSet.schema={"$ref":uri};
                _expandSchemaSet(schemaSet)
                .then(function(expandedSchema){
                  resolve(expandedSchema);
                }).catch(function(error){
                  reject({
                    message : SCHEMA_EXPANSION_EXCEPTION,
                    uri :uri,
                    innerError:error
                  });
                });
            })
            .catch(function(error){
              reject({
                message : SCHEMA_EXPANSION_EXCEPTION,
                uri :uri,
                innerError:error
              });
            });
       });
     }
     /**
       * @name _expandSchemaSet
       *  private function
       * @description
       * using the supplied SchemaSet expand the all $refs
       * @param {object} schemaSet  A bag containg the schema and a tv4 api
          instance loaded with all dependencies.
       * @returns  a promise to resolve a expanded schema
     */
     function _expandSchemaSet(schemaSet){
       return $q(function(resolve,reject){
         //local recursive function
          function handleSchema(schema){
            if(schema.$ref){
             var refSchema = schemaSet.tv4.getSchema(schema.$ref);
             if(!refSchema){
                reject({
                   message:TV4_SCHEMA_REQUEST_EXCEPTION,
                   $ref:schema.$ref
                 });
                 return;
             }else{
               if(schema.isBeingHandled){
                 return ng.copy(refSchema);
               }
               else
               {
                   schema.isBeingHandled = true;
                   return handleSchema(ng.copy(refSchema));
               }
             }
            }
            for(var propname in schema)
            {
               var prop = schema[propname];
               if(typeof prop === 'object')
               {
                   delete schema[propname];
                   schema[propname] = handleSchema(prop);
               }
            }
            return schema;
          }
          if(schemaSet && schemaSet.schema && schemaSet.tv4){
            var _schema = handleSchema(ng.copy(schemaSet.schema));
            if(_schema){
              resolve(_schema);
            }else{
              reject({message:EXPANSION_ERROR});
            }
          }else{
            reject({message:SCHEMA_SET_INTERFACE_ERROR});
          }
       });
     }
     /**
       * @name _loadSchemaUrl
       *  private function
       * @description
       *  used to request a schema by its url
       *  presently only checks schema cache - will be modified to
       *  to request resolveable urls which are not stored in schema cache
       * @param {string} uri the url of the schema
       * @param {boolean} refreshCache - if absolute rerequest and recache schema
                                ****not implemented yet!!!!! *****
       * @returns  a promise to resolve a schema by its uri
     */
     function _loadSchemaUrl(uri,refreshCache){
       return $q(function(resolve,reject){
         var _schema = drSchemaCache.get(uri);
         if( ng.isDefined(_schema) && _schema!==null  ){
           resolve(ng.copy(_schema));
         }else{
           // for now reject add call to absolute Http: $refs and storing them ins schemaCache using url as key
           reject({
             message : CURRENT_URL_NOT_CACHED_EXCEPTION,
             uri : uri,
           });
         }
       });
     }
   }






})(angular,angular.module('diroop.tools').factory);
