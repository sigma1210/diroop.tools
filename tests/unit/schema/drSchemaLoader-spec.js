describe("Unit: drSchemaLoader",function(){
    var _rootScope,
        _drSchemaLoader,
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
      TEST_SCHEMA_KEY2= 'test/name.schema.ver1.json',
      PRELOAD_SCHEMA_KEY ='schemaCache:/person/hcard.schema.json',
      BAD_SCHEMA_KEY ='schemaCache:/person/bad.schema.json';

  beforeEach(module('diroop.tools'));


  beforeEach(inject(function(drSchemaLoader,drSchemaCache,$rootScope){
      _drSchemaLoader= drSchemaLoader,
      _drSchemaCache = drSchemaCache;
      _rootScope = $rootScope;

  }));

  it('should contain an drSchemaLoader service',function(){
      expect(_drSchemaLoader).not.toBeNull();
  });


  it('should be able to ask for a schema set for a know cached schema',function(){

    function testPut(){
      _drSchemaCache.put(TEST_SCHEMA_KEY,TEST_FRAGMENT_1);
    }
    testPut();

    var _set = null,
        _error = null;

    function testLoad(){
      _drSchemaLoader
        .getSchemaSet(TEST_SCHEMA_KEY)
        .then(function(_schemaSet){
          return _schemaSet;
        })
        .catch(function(error){
          _error = error;
          return null;
        });
    }
    function excuteTestLoad(){
      _set = testLoad();
    }
    expect(excuteTestLoad).not.toThrow();
    expect(_set).not.toBeNull();

  });


  it('should be able to ask for a expand a pre loaded schema set for a pre cached cached schema==>' +PRELOAD_SCHEMA_KEY ,
    function(){
      var _set = null,
          _error = null;
      function testLoad(){
        _drSchemaLoader
          .getSchemaSet(PRELOAD_SCHEMA_KEY)
          .then(function(_schemaSet){
            return _schemaSet;
          })
          .catch(function(error){
            _error = error;
            return null;
          });
      }
      function excuteTestLoad(){
        _set = testLoad();
      }
      expect(excuteTestLoad).not.toThrow();
      expect(_set).not.toBeNull();
      expect(_error).toBeNull();
  });

  it('should be able to expand a pre cached cached schema -- with pre loaded cached schema by $ref  ==>' +PRELOAD_SCHEMA_KEY ,
    function(done){
    var _error= null,
        _schema = null;
    _testSchema =function(schema){
      _schema= schema;
      _error = null;
      return schema;
    },
    _testFail = function(error){
        _schema= null;
        _error=error;
        return error;
    };
    _drSchemaLoader
      .getExpandedSchema(PRELOAD_SCHEMA_KEY)
      .then(_testSchema)
      .catch(_testFail)
      .finally(done);
      _rootScope.$apply();
  });

  it('should fail expansion on malformed schemas with missing $refs  ==>' +BAD_SCHEMA_KEY ,
    function(done){
      function _testSchema(schema){
        expect(schema).toBeUndefined();
      }
      function _testFail(error){
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
