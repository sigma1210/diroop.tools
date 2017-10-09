(function(){
  /** extend the Javascript string object to have an endsWith method
  if the version of javascript  does not have the method on the string object
 **/
    if (!String.prototype.endsWith) {
      // IIF the sdtring object does not have an endsWith method
      // use js Prototype to extend the String class with the method endwith


      String.prototype.endsWith = function(searchString, position) {
          var subjectString = this.toString();
          if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
          }
          position -= searchString.length;
          var lastIndex = subjectString.lastIndexOf(searchString, position);
          return lastIndex !== -1 && lastIndex === position;
      };
    }
})();
