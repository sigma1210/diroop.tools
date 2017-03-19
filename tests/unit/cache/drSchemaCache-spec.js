describe("Unit: schemaCache",function(){


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
      TEST_SCHEMA_KEY2= 'test/name.schema.ver1.json';


  //var ssabtSchemaCache; //used in your its

  beforeEach(module('diroop.tools'));


  it('should contain an drSchemaCache service',
    inject(function(drSchemaCache) {
      expect(drSchemaCache).not.toBeNull();
  }));

  it('should be able to put and get schema with out error',
    inject(function(drSchemaCache) {
      function testPut(){
        drSchemaCache.put(TEST_SCHEMA_KEY,TEST_FRAGMENT_1);
      }

      function testGet(){
        return drSchemaCache.get(TEST_SCHEMA_KEY);
      }
      expect(testPut).not.toThrow();
      expect(testGet).not.toThrow();
  }));

  it('should be able to put a schema and get the same schema using the same key',
    inject(function(drSchemaCache) {
      function testPut(){
        drSchemaCache.put(TEST_SCHEMA_KEY,TEST_FRAGMENT_1);
      }
      function testGet(){
        return drSchemaCache.get(TEST_SCHEMA_KEY);
      }

      testPut();
      var storedSchema = testGet();
      expect(storedSchema).not.toBeNull();
      expect(storedSchema).toEqual(TEST_FRAGMENT_1);
  }));

  it('should be able to remove a schema without error',
    inject(function(drSchemaCache) {
      function testPut(){
        drSchemaCache.put(TEST_SCHEMA_KEY,TEST_FRAGMENT_1);
      }

      function testGet(){
        return drSchemaCache.get(TEST_SCHEMA_KEY);
      }

      function testRemove(){
        drSchemaCache.remove(TEST_SCHEMA_KEY);
      }
      testPut();
      var storedSchema = testGet();
      expect(storedSchema.type).not.toBeNull();
      expect(testRemove).not.toThrow();
      var repulled = testGet();
      expect(repulled).toBeUndefined();
      expect(TEST_FRAGMENT_1).not.toBeUndefined();
      expect(TEST_FRAGMENT_1).not.toBeNull();

  }));

  it('should be able to remove all schemas without error',
    inject(function(drSchemaCache) {
      function testPut(){
        drSchemaCache.put(TEST_SCHEMA_KEY,TEST_FRAGMENT_1);
        drSchemaCache.put(TEST_SCHEMA_KEY2,TEST_FRAGMENT_1);
      }
      var res1, res2;

      function testGet(){
         res1= drSchemaCache.get(TEST_SCHEMA_KEY);
         res2 = drSchemaCache.get(TEST_SCHEMA_KEY2);
      }

      function testRemove(){
        drSchemaCache.removeAll();
      }

      testPut();
      testGet();
      expect(res1.type).not.toBeNull();
      expect(res2.type).not.toBeNull();
      expect(testRemove).not.toThrow();
      testGet();
      expect(res1).toBeUndefined();
      expect(res2).toBeUndefined();
  }));

  it('should be able to get info about the Cache',
    inject(function(drSchemaCache,$filter) {
      function testPut(){
        drSchemaCache.put(TEST_SCHEMA_KEY,TEST_FRAGMENT_1);
        drSchemaCache.put(TEST_SCHEMA_KEY2,TEST_FRAGMENT_1);
      }
      var _info;
      function getInfo(){
        _info = drSchemaCache.info();
        //console.log($filter('json')(_info));
      }
      testPut();
      expect(getInfo).not.toThrow();
      expect(_info).not.toBeUndefined();
      expect(_info).not.toBeNull();

  }));


  it('should be able to return all registered uri keys',
    inject(function(drSchemaCache) {
      function testPut(){
        drSchemaCache.put(TEST_SCHEMA_KEY,TEST_FRAGMENT_1);
        drSchemaCache.put(TEST_SCHEMA_KEY2,TEST_FRAGMENT_1);
      }
      var _uris;
      function getKeys(){
        _uris = drSchemaCache.getUris();
      }
      testPut();
      expect(getKeys).not.toThrow();
      expect(_uris).not.toBeUndefined();
      expect(_uris).not.toBeNull();
      expect(_uris.length).not.toBeUndefined();
      expect(_uris.length).not.toBeNull();
    }))

    it('should be able to destroy itself',
      inject(function(drSchemaCache) {
        function testPut(){
          drSchemaCache.put(TEST_SCHEMA_KEY,TEST_FRAGMENT_1);
          drSchemaCache.put(TEST_SCHEMA_KEY2,TEST_FRAGMENT_1);
        }
        var _uris;
        function testDestroy(){
           drSchemaCache.destroy();
        }
        testPut();
        expect(testDestroy).not.toThrow();
        expect(testPut).toThrow();
      }))

});
