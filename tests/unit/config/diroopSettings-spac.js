describe('unit test : <dr:version/> directive',function(){

  var DIROOP_VERSION_TEMPLATE='<dr:tool:version/>'

  var _diroopSettings;


  beforeEach(module('diroop.tools'));

  beforeEach(inject(function(drToolsSettings){
      _diroopSettings=drToolsSettings;
  }));

  it('should return the version',function(){
      var version = _diroopSettings.getVersion();
  });

});
