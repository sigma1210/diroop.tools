describe('unit test : sprintf filter',function(){


  var TEST1  = ':to ,:greeting',
      TEST2  = 'You scored $0 out of $1 and rank as $2',
      TEST3  = 'What rolls down stairs alone and in pairs and over your neighbor\'s dog?, it\'s $0 $0 $0';

  var TEST1_PARAM1={
        to:'Friends,Romans,Countrymen',
        greeting:'lend me your ears'
      },
      TEST1_PARAM2={
        to:'Brain',
        greeting:'What are we going to do tonight'
      },
      TEST2_PARAM=['100', '100', 'genius'],
      TEST3_PARAM='log';
/*

 'You  Scored $0 out of $1 and rank as $2'| sprintf:['100', '100', 'genius']
*/

  var _rootScope,
      _compile,
      _filter,
      _sprintf;


  beforeEach(module('diroop.tools'));

  beforeEach(inject(function($rootScope,$compile,$filter){
      _rootScope  = $rootScope;
      _compile    = $compile;
      _filter     = $filter;
      _sprintf    = $filter('sprintf');
  }));

  it('should exist',function(){
    expect(_filter('sprintf')).not.toBeUndefined();
  });

  it('should replace all :propertyNames in string',function(){
    var _out = _sprintf(TEST1,TEST1_PARAM1);
    expect(_out).toContain('Friends,Romans,Countrymen');
  });

  it('should replace all $0 $1 ,$3 in string',function(){
    var _out = _sprintf(TEST2,TEST2_PARAM);
    expect(_out).toContain('genius');
  });

  it('should replace all $0 with single string',function(){
    var _out = _sprintf(TEST3,TEST3_PARAM);
    expect(_out).toContain('log log log');
  });



/*
@example: ':to ,:greeting' | sprintf:{ to:'Friends,Romans,Countrymen', greeting:'lend me your ears' }
           ':to ,:greeting' | sprintf:{ to:'Brain', greeting:'What are we going to do tonight' }
* @example: 'You  Scored $0 out of $1 and rank as $2'| sprintf:['100', '100', 'genius']
* @example: 'what rolls down stairs alone and in pairs and over your neighbor''s dog?, its $0 $0 $0' | sprintf:'log';

*/

});
