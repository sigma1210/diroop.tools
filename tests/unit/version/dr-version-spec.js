describe('unit test : <dr:version/> directive',function(){

  var DIROOP_VERSION_TEMPLATE='<dr:version/>'

  var _rootScope,
      _compile;

  beforeEach(module('diroop.tools'));

  beforeEach(inject(function($rootScope,$compile){
      _rootScope = $rootScope;
      _compile=$compile;
  }));

  it('should compile without error',function(){
      var $scope= _rootScope.$new(true);
      var element = _compile(DIROOP_VERSION_TEMPLATE)($scope);
      $scope.$digest();
      expect(element.html()).toContain('diroop.tools :');
      $scope.$destroy();
  });

});
