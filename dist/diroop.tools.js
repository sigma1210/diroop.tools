(function(ng){
  'use strict';
  /**
      *@ngdoc overview
      *@name diroop.tools
      *@description
          a module which provides basic validatiopn services using
          Json schema and the TV4 validator
   **/
  //ng.module('diroop.tools',['diroop.tools.templateCache']);
  ng.module('diroop.tools',['diroop.tools.templateCache','diroop.schema.cache','ui.format']);
})(angular);

(function(ng,factory){
    'use strict';
  /**
   * @ngdoc service
   * @name drCacheTreeService
   * @requires $log              it was a hard $log back to base camp.
   * @requires $q                promises must be kept.
   * @requires $document         using $document path parsing abilities
   * @requires drSchemaCache     needs to know all schemas cached.

   * @description
      Reads the scheam cache and parses it into a tree of nodes so that it can
      be represent as a abstract file system with the schama placed in folderSegments
   */

  factory('drCacheTreeService',['$log', '$q','$document','drSchemaCache', _cacheTreeService]);
  function _cacheTreeService($log,$q,$document,schemaCache){
    var PROTOCOL_NODE_TYPE    ='PROTOCOL_NODE_TYPE',
        FOLDER_NODE_TYPE      ='FOLDER_NODE_TYPE',
        SCHEMA_NODE_TYPE      ='SCHEMA_NODE_TYPE',
        ROOT_NODE_TYPE        ='$TREE_ROOT_NODE',
        DEFAULT_TREE_ROOT     ={
          name:'$cacheroot',
          nodes:[],
          type:ROOT_NODE_TYPE
        },
        _treeRoot=ng.copy(DEFAULT_TREE_ROOT),
        cacheTreeService ={
          addPath:_addPath,
          getTree:_getTree,
        };
    return cacheTreeService;

    /**
      * @ngdoc function
      * @name drCacheTreeService.getTree
      *
      * @description
      *  parses the schema cache and produces a tree node
      *  representation  of the cache so that the cache can pre represented
      *  as an abstarct file system
      * @returns a promise to resolve the contructed tree or reject with an error
      * decribing the reason for failure
      *
    */
    function _getTree(){
      return $q(function(resolve,reject){
        _treeRoot=ng.copy(DEFAULT_TREE_ROOT);
        var _uris = ng.copy(schemaCache.getUris());
        function _addUri(uri){
            if(uri){
              _addPath(uri)
                .then(function(tree){
                  _uris.shift();
                  if(_uris.length===0){
                      resolve(_treeRoot);
                  }else{
                    _addUri(_uris[0]);
                  }
                })
                .catch(function(error){
                  reject(error);
                });
            }else{
              resolve(_treeRoot);
            }
        }
        _addUri(_uris[0]);
      });
    }


    function _addPath(path){
      return $q(function(resolve,reject){
        if(!path){
          reject({
            message:'no path specified'
          });
        }else{
          var _parsed=_parsePath(path);
          _addParsedPath(_parsed)
            .then(function(tree){
              resolve(tree);
            })
            .catch(function(error){
              reject({
                message:'an error occured add parsed path',
                path:_parsed,
                error:error
              });
            });
        }
      });
    }

    function _addParsedPath(parsedPath){
      return $q(function(resolve,reject){
        if(parsedPath && parsedPath.protocol){
          _getProtocolNode(parsedPath)
            .then(function(protocolNode){
              protocolNode
                .addPath(parsedPath.segments)
                .then(function(tree){
                  resolve(tree);
                })
                .catch(function(error){
                  reject({
                    message:" pn add path error",
                    error:error
                  });
                });
            })
            .catch(function(error){
              reject({
                message:"get pn error",
                error:error

              });
            });
        }else{
          reject({
            message:'malformed Parsed Path',
            parsedPath:parsedPath
          });
        }
      });
    }

    function _getFolder(parent,segments){
      return $q(function(resolve,reject){
        if(parent){
          if(ng.isArray(segments)&&segments.length>0){
            var _folderName = segments[0];
            if(parent.nodes[_folderName]){
              resolve(parent.nodes[_folderName]);
            }else{
              _createFolderNode(_folderName,segments)
                .then(function(folderNode){
                  parent.nodes[_folderName] = folderNode;
                  parent.nodes.push(folderNode)
                  resolve(parent.nodes[_folderName]);
                })
                .catch(function(error){
                  reject(error);
                });
            }
          }else{
            reject({
              message:'malformed path segments being added to parent',
              segments:segements,
              parent:parent
            });
          }
        }else{
          reject({
            message:'parent node not specified'
          });
        }
      });
    }

    function _createFolderNode(folderName,folderSegments){

      var FolderNode = function(name){
        var _self= this;
        _self.name       = name;
        _self.nodes      = [];
        _self.addPath    = _addPath;
        _self.type       = FOLDER_NODE_TYPE;

        function _addPath(segments){
          return $q(function(resolve,reject){
            if(ng.isArray(segments)&&segments.length>0){
              _getFolder(_self,segments)
                .then(function(folder){
                  segments.shift();
                  folder
                    .addPath(segments)
                    .then(function(nfolder){
                      resolve(_self);
                    })
                    .catch(function(error){
                      resolve(_self);
                    });
                })
                .catch(function(error){
                  resolve(_self);
                });
            }else{
              resolve(_self);
            }
          });
        }

      };

      var SchemaNode=function(name){
        var _self = this;
        _self.type= SCHEMA_NODE_TYPE
        _self.$ref=name;
        _self.schema=null;
        _self.addPath = function(){
          return $q.when(_self);
        };

      };



      return $q(function(resolve,reject){
        if((folderName||'').endsWith('.schema.json')||folderSegments.length===1){
          resolve(new SchemaNode(folderName));
        }else{
          var _Fn = new FolderNode(folderName);
          folderSegments.shift();
          _Fn.addPath(folderSegments)
            .then(function(){
                resolve(_Fn);
            })
            .catch(function(error){
                resolve(_Fn);
            });
        }
      });
    }

    function _createNewProtocol(parsedPath){
      var ProtocolNode = function(protocol){
        var _protocol    = protocol,
            _self        = this;
        _self.name       = protocol;
        _self.type       = PROTOCOL_NODE_TYPE;
        _self.nodes      = [];
        _self.addPath    = _addPath;
        function _addPath(segments){
          return $q(function(resolve,reject){
            if(ng.isArray(segments)&&segments.length>0){
              _getFolder(_self,segments)
                .then(function(folder){
                  segments.shift();
                  folder
                    .addPath(segments)
                    .then(function(nfolder){
                      resolve(_self);
                    })
                    .catch(function(error){
                      resolve(_self);
                    });
                })
                .catch(function(error){
                  resolve(_self);
                });
            }else{
              resolve(_self);
            }
          });
        }

      };
      //return new ProtocolNode(parsedPath.protocol);
      return $q.when(new ProtocolNode(parsedPath.protocol));
    }
    function _getProtocolNode(parsedPath){
      return $q(function(resolve,reject){


        if(_treeRoot.nodes[parsedPath.protocol]){
          resolve(_treeRoot.nodes[parsedPath.protocol]);
        }else{
           _createNewProtocol(parsedPath)
           .then(function(pn){
             _treeRoot.nodes[parsedPath.protocol] = pn;
            _treeRoot.nodes.push(pn);
            resolve(_treeRoot.nodes[parsedPath.protocol]);
           })
           .catch(function(error){
             reject({
               message:'an error occcuer creating new protocol node',
               error:error
             });
           });
        }
      });
    }
    function _parsePath(path){
      if(!path)return null;
      var parser = document.createElement('a');
      parser.href =path;
      var _segments=[];
      var parts = (parser.pathname||'').split('/');
      ng.forEach(parts,function(part){
        if(part){
          _segments.push(part);
        }
      });
      return{
        protocol:(parser.protocol||'').split(':')[0],
        pathName:parser.pathname,
        segments:_segments,
        path:path
      };
    }

}

})(angular,angular.module('diroop.tools').factory);

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

(function(){
    if (!String.prototype.endsWith) {
      String.prototype.endsWith = function(searchString, position) {
          var subjectString = this.toString();
          if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
          }
          position -= searchString.length;
          var lastIndex = subjectString.lastIndexOf(searchString, position);
          return lastIndex !== -1 && lastIndex === position;
      };
    }
})();

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

/**
  inject
    angular as ng,
    angular.module('diroop.tools').factory as factory
   from global
**/
(function(ng,factory){
  'use strict';
  /**
   * @ngdoc service
   * @name drValidationService
   * @memberof diroop.tools

   * @requires $q                 - what service can live without $q
   * @requires $log               - what service can live without $log
   * @requires drSchemaLoader     - load schemas

   * @description
      provides a common libray for validating models aginst schemas
  **/
  factory('drValidationService',['$q','$log','drSchemaLoader',_drValidationService]);

  function _drValidationService($q,$log,drSchemaLoader){
      var MODEL_VALIDATION_FAILED_MESSAGE = 'The model did not validate aginst the schema specified',
          SCHEMA_INITIALIZATION_EXCEPTION = 'An error occured while the schema was being set up for validation';

      var drValidationService={
        validate:_validate,
      };

      return drValidationService;
      /**
        * @ngdoc function
        * @name sdrValidationService.validate
        *
        * @description
          use a schema uri to validate a model
        @param {string} schema - the path to the schema being used to validate
        @param {object} model  - the model to be validated
        * @returns  a promise to resolve true {valid:true} if the model validates or
          an explaination why
            {
                valid:false,
                message:'---',
                errors:[...],
                schema:{...},
                model:{...},
            }
      */
      function _validate(schema,model){
        return $q(function(resolve,reject){
          drSchemaLoader
            .getSchemaSet(schema)
            .then(function(schemaSet){
                var result = schemaSet.tv4.validateMultiple(model, schemaSet.schema);
                if(result && result.valid){
                    resolve({
                      valid:true
                    });
                }else{
                    reject({
                      valid   : false,
                      message : MODEL_VALIDATION_FAILED_MESSAGE,
                      errors  : (result.errors)?result.errors:[],
                      missing : (result.missing)?result.missing:[],
                      schema  : schema,
                      model   : model
                    });
                }
            })
            .catch(function(error){
                reject({
                  message:SCHEMA_INITIALIZATION_EXCEPTION
                });
            });
        });
      }

  }
})(angular,angular.module('diroop.tools').factory);

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
        // _self.test= function(){
        //   drCacheTreeService
        //     .getTree()
        //     .then(_testSuccess)
        //     .catch(_testError);
        // };
        // function _testSuccess(response){
        //     $log.debug($filter('json')(response));
        // }
        // function _testError(error){
        //     $log.debug($filter('json')(error));
        // }

      }]
  });
})(angular,angular.module('diroop.tools').component);

(function(ng) {
try {
  app = ng.module('diroop.schema.cache');
} catch (e) {
  app = ng.module('diroop.schema.cache', ['diroop.tools']);
}
app.run(['drSchemaCache', function(schemaCache) {
  schemaCache.put('schemaCache:/address/address.schema.json',
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "description": "An Address following the convention of http://microformats.org/wiki/hcard",
    "type": "object",
    "properties": {
        "post-office-box": { "type": "string" },
        "extended-address": { "type": "string" },
        "street-address": { "type": "string" },
        "locality":{ "type": "string" },
        "region": { "type": "string" },
        "postal-code": { "type": "string" },
        "country-name": { "type": "string"}
    },
    "required": ["locality", "region", "country-name"],
    "dependencies": {
        "post-office-box": ["street-address"],
        "extended-address": ["street-address"]
    }
}
);
}]);
})(angular);

(function(ng) {
try {
  app = ng.module('diroop.schema.cache');
} catch (e) {
  app = ng.module('diroop.schema.cache', ['diroop.tools']);
}
app.run(['drSchemaCache', function(schemaCache) {
  schemaCache.put('schemaCache:/geo/geo.schema.json',
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "description": "A geographical coordinate",
    "type": "object",
    "properties": {
        "latitude": { "type": "number" },
        "longitude": { "type": "number" }
    }
}
);
}]);
})(angular);

(function(ng) {
try {
  app = ng.module('diroop.schema.cache');
} catch (e) {
  app = ng.module('diroop.schema.cache', ['diroop.tools']);
}
app.run(['drSchemaCache', function(schemaCache) {
  schemaCache.put('schemaCache:/person/bad.schema.json',
{"$ref":"schemaCache:/noWhereToBeFoundOnPurpose.schema.json"}
);
}]);
})(angular);

(function(ng) {
try {
  app = ng.module('diroop.schema.cache');
} catch (e) {
  app = ng.module('diroop.schema.cache', ['diroop.tools']);
}
app.run(['drSchemaCache', function(schemaCache) {
  schemaCache.put('schemaCache:/person/hcard.schema.json',
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "description": "A representation of a person, company, organization, or place",
    "type": "object",
    "required": ["familyName", "givenName"],
    "properties": {
        "fn": {
            "description": "Formatted Name",
            "type": "string"
        },
        "familyName": { "type": "string" },
        "givenName": { "type": "string" },
        "additionalName": { "type": "array", "items": { "type": "string" } },
        "honorificPrefix": { "type": "array", "items": { "type": "string" } },
        "honorificSuffix": { "type": "array", "items": { "type": "string" } },
        "nickname": { "type": "string" },
        "url": { "type": "string", "format": "uri" },
        "email": {
            "type": "object",
            "properties": {
                "type": { "type": "string" },
                "value": { "type": "string", "format": "email" }
            }
        },
        "tel": {
            "type": "object",
            "properties": {
                "type": { "type": "string" },
                "value": { "type": "string", "format": "phone" }
            }
        },
        "adr": { "$ref": "schemaCache:/address/address.schema.json" },
        "geo": { "$ref": "schemaCache:/geo/geo.schema.json" },
        "tz": { "type": "string" },
        "photo": { "type": "string" },
        "logo": { "type": "string" },
        "sound": { "type": "string" },
        "bday": { "type": "string", "format": "date" },
        "title": { "type": "string" },
        "role": { "type": "string" },
        "org": {
            "type": "object",
            "properties": {
                "organizationName": { "type": "string" },
                "organizationUnit": { "type": "string" }
            }
        }
    }
}
);
}]);
})(angular);

(function(ng) {
try {
  app = ng.module('diroop.schema.cache');
} catch (e) {
  app = ng.module('diroop.schema.cache', ['diroop.tools']);
}
app.run(['drSchemaCache', function(schemaCache) {
  schemaCache.put('schemaCache:/really/really/really/deep/test.schema.json',
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "description": "A geographical coordinate",
    "type": "object",
    "properties": {
        "latitude": { "type": "number" },
        "longitude": { "type": "number" }
    }
}
);
}]);
})(angular);

(function(module) {
try {
  module = angular.module('diroop.tools.templateCache');
} catch (e) {
  module = angular.module('diroop.tools.templateCache', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('drTemplateCache:/version/version.html',
    '<div class="dr-version"><small>{{$ctrl.version}}</small></div>');
}]);
})();
