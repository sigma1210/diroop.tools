describe("Unit: drSchemaLoader",function(){
    var _rootScope,
        _drSchemaLoader,
        _drSchemaCache,
        _filter;


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
      TEST_SCHEMA_KEY2= 'test/name.schema.ver1.json',
      PRELOAD_SCHEMA_KEY ='schemaCache:/person/hcard.schema.json',
      BAD_SCHEMA_KEY ='schemaCache:/person/bad.schema.json';

  beforeEach(module('diroop.tools'));


  beforeEach(inject(function(drSchemaLoader,drSchemaCache,$rootScope,$filter){
      _drSchemaLoader= drSchemaLoader,
      _drSchemaCache = drSchemaCache;
      _rootScope = $rootScope;
      _filter = $filter;
  }));

  it('should contain an drSchemaLoader service',function(){
      expect(_drSchemaLoader).not.toBeNull();
  });

  it('should be able to ask for a schema set for a know cached schema',
   function(done){
    function testPut(){
      _drSchemaCache.put(TEST_SCHEMA_KEY,TEST_FRAGMENT_1);
    }
    testPut();

    function _testSchema(schema){
      expect(schema).not.toBeUndefined();
    }
    function _testFail(error){
      expect(error).toBeUndefined();
    }
    _drSchemaLoader
      .getExpandedSchema("schemaCache:/address/address.schema.json")
      .then(_testSchema)
      .catch(_testFail)
      .finally(done);
     _rootScope.$apply();
  });

  it('should be able to ask for a expand a pre loaded schema set for a pre cached cached schema==>' +PRELOAD_SCHEMA_KEY ,
    function(done){
      function _testSchema(schema){
        //should execute
        expect(schema).not.toBeUndefined();
      }
      function _testFail(error){
        //should never execute -- test falure
        expect(error).toBeUndefined();
      }

      _drSchemaLoader
        .getExpandedSchema(PRELOAD_SCHEMA_KEY )
        .then(_testSchema)
        .catch(_testFail)
        .finally(done);
       _rootScope.$apply();
  });

  it('should fail expansion on malformed schemas with missing $refs  ==>' +BAD_SCHEMA_KEY ,
    function(done){
      function _testSchema(schema){
        //this should never occur -- test failure
        expect(schema).toBeUndefined();
      }
      function _testFail(error){
        // we expect a failure
        expect(error).not.toBeUndefined();
      }

      _drSchemaLoader
        .getExpandedSchema(BAD_SCHEMA_KEY)
        .then(_testSchema)
        .catch(_testFail)
        .finally(done);

       _rootScope.$apply();

    });
});
