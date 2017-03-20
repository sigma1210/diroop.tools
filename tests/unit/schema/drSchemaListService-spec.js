describe("Unit: drSchemaLoader",function(){
    var _rootScope,
        _filter,
        _listService;

  beforeEach(module('diroop.tools'));


  beforeEach(inject(function(drSchemaListService,$rootScope,$filter){
      _rootScope = $rootScope;
      _filter = $filter;
      _listService = drSchemaListService;
  }));

  it('should contain an drSchemaListService service',function(){
      expect(_listService).not.toBeNull();
  });


  it('should contain return [] when text is length <2 ',function(done){

    function _resolved(list){
        expect(list).not.toBeUndefined();
    }

    function _rejected(error){
      expect(error).toBeUndefined();
    }
    _listService
      .search('e')
      .then(_resolved)
      .catch(_rejected)
      .finally(done);
  });


  it('should contain an execute search without error',function(done){

    function _resolved(list){
        expect(list).not.toBeUndefined();
    }

    function _rejected(error){
      expect(error).toBeUndefined();
    }

    _listService
      .search('geo')
      .then(_resolved)
      .catch(_rejected)
      .finally(done);
  });
});
