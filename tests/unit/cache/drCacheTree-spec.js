describe('unit test drCacheTree',function(){

  var _rootScope,
      _drCacheTree,
      _filter;

  beforeEach(module('diroop.tools'));

  beforeEach(inject(function($rootScope,drCacheTreeService,$filter){
      _rootScope = $rootScope;
      _drCacheTreeService=drCacheTreeService;
      _filter=$filter;
  }));

  it('should exists',function(){
    expect(_drCacheTreeService).not.toBeUndefined();
  });

  it('should be able to add a path with out error',function(done){
    function _testSuccess(response){
      expect(response).not.toBeUndefined();
    }
    function _testError(error){
      expect(error).toBeUndefined();
    }
    _drCacheTreeService
        .addPath('schemaCache:/address/address.schema.json')
        .then(_testSuccess)
        .catch(_testError)
        .finally(done);
       _rootScope.$apply();
  });


  it('should fail adding blank path',function(done){
    function _testSuccess(response){
      expect(response).toBeUndefined();
    }
    function _testError(error){
      expect(error).not.toBeUndefined();
    }
    _drCacheTreeService
        .addPath('')
        .then(_testSuccess)
        .catch(_testError)
        .finally(done);
       _rootScope.$apply();
  });


  it('should fail adding blank path',function(done){
    function _testSuccess(response){
      expect(response).toBeUndefined();
    }
    function _testError(error){
      expect(error).not.toBeUndefined();
    }
    _drCacheTreeService
        .addPath()
        .then(_testSuccess)
        .catch(_testError)
        .finally(done);
       _rootScope.$apply();
  });


  it('should be able access the cache tree ',function(done){
    function _testSuccess(response){
      expect(response).not.toBeUndefined();
    }
    function _testError(error){
      expect(error).toBeUndefined();
    }
    _drCacheTreeService
        .getTree()
        .then(_testSuccess)
        .catch(_testError)
        .finally(done);
       _rootScope.$apply();
  });


  it('should should resolve  a correctly formed cache tree',function(done){
    function _testSuccess(response){
      expect(response).not.toBeUndefined();
      expect(response.name).not.toBeUndefined();
      expect(response.nodes).not.toBeUndefined();
      expect(response.nodes.length).not.toBeUndefined();
      expect(response.nodes[0]).not.toBeUndefined();
      expect(response.nodes[0].name).not.toBeUndefined();
      expect(response.nodes[0].nodes).not.toBeUndefined();
      expect(response.nodes[0].nodes.length).not.toBeUndefined();
      expect(response.nodes[0].nodes[0]).not.toBeUndefined();

    }
    function _testError(error){
      console.log(error);
      expect(error).toBeUndefined();
    }
    _drCacheTreeService
        .getTree()
        .then(_testSuccess)
        .catch(_testError)
        .finally(done);
       _rootScope.$apply();
  });





});
