describe("Unit: drValidationService",function(){
    var _rootScope,
        _drValidationService,
        _drSchemaCache;

    var TEST_FRAGMENT_1 = {
          "type": "object",
          "required": ["firstName", "lastName"],
          "properties": {
            "firstName": {
                "title": "First Name",
                "type": "string"
            },
            "middleName": {
                "title": "Middle Name",
                "type": "string"
            },
            "lastName": {
                "title": "Last Name",
                "type": "string"
            }
          }
      },
      TEST_SCHEMA_KEY = 'test/name.schema.json',
      _MODEL = {
        firstName:"foo",
        lastName:"bar"
      };

  beforeEach(module('diroop.tools'));


  beforeEach(inject(function(drValidationService,drSchemaCache,$rootScope){
      _rootScope = $rootScope;
      _drValidationService = drValidationService;
      _drSchemaCache=drSchemaCache
  }));


  it('should exist',function(){
    expect(_drValidationService).not.toBeUndefined();
  });


  it('should be able to validate a known valid object',function(done){
    function testPut(){
      _drSchemaCache.put(TEST_SCHEMA_KEY,TEST_FRAGMENT_1);
    }
    testPut();
    function _validTest(result){
      expect(result).not.toBeUndefined();
    }
    function _invalidTest(error){
      expect(error).toBeUndefined();
    }
    _drValidationService
      .validate(TEST_SCHEMA_KEY,_MODEL)
      .then(_validTest)
      .catch(_invalidTest)
      .finally(done);
    _rootScope.$apply();
  })

});
