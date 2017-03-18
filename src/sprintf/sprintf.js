(function(ng,filter){
  /**
   *  A general purpose formatting function in the spirit of sprintf.
   * @param replace {mixed} The tokens to replace depends on type
   *  string: all instances of $0 will be replaced
   *  array: each instance of $0, $1, $2 etc. will be placed with each array item in corresponding order
   *  object: all attributes will be iterated through, with :key being replaced with its corresponding value
   * @return string
   * @example: ':to ,:greeting' | sprintf:{ to:'Friends,Romans,Countrymen', greeting:'lend me your ears' }
               ':to ,:greeting' | sprintf:{ to:'Brain', greeting:'What are we going to do tonight' }
   * @example: 'You  Scored $0 out of $1 and rank as $2'| sprintf:['100', '100', 'genius']
   * @example: 'what rolls down stairs alone and in pairs and over your neighbor''s dog?, its $0 $0 $0' | sprintf:'log';
   * @example
   '''javascript
       var _stringFormatter = $filter('sprintf');
       var _formattedString =_stringFormatter(':to ,:greeting',{
                to:'Friends,Romans,Countrymen',
                greeting :'lend me your ears'
        });
        $log.debug(_formattedString);
   ''''
   */
   filter('sprintf',[_filter]);
   function _filter(){
     return function(value,replace){
       var _formattedValue = value;
       if (ng.isString(_formattedValue) && replace !== undefined) {
         if (ng.isString(replace)|| ng.isDate(replace)||ng.isNumber(replace)){
           //if is a single string coerce it into an array of one.
           replace = [replace];
         }
         if (ng.isArray(replace)) {
           var _replaceLength = replace.length;
           _formattedValue = _formattedValue.replace(/\$([0-9]+)/g, function(_string,index){
                  index = parseInt(index, 10);
                  return (index >= 0 && index < _replaceLength) ? replace[index] : _string;
                });
         }
         else if(ng.isObject(replace)){
           ng.forEach(replace, function(value, key){
             _formattedValue = _formattedValue.split(':' + key).join(value);
           });
         }
         else{
           throw {message:'unknown replace type'};
         }
       }else{
            throw {message:'value not a string or replace is undefinebd'};
       }
       return _formattedValue;
     };
   }
})(angular, angular.module('diroop.tools').filter);
