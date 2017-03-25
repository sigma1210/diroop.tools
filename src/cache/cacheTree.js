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
