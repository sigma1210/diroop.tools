/**
  inject
    angular as ng,
    angular.module('diroop.tools').factory as factory
   from global
**/
(function(ng,factory){
  'use strict';
  /**
   * @ngdoc service
   * @name drValidationService
   * @memberof diroop.tools

   * @requires $q                 - what service can live without $q
   * @requires $log               - $log all errors
   * @requires drSchemaLoader     - load schemas

   * @description
      provides a common libray for validating models aginst schemas
  **/
  factory('drValidationService',['$q','$log','drSchemaLoader',_drValidationService]);

  function _drValidationService($q,$log,drSchemaLoader){
      var MODEL_VALIDATION_FAILED_MESSAGE = 'The model did not validate aginst the schema specified',
          SCHEMA_INITIALIZATION_EXCEPTION = 'An error occured while the schema was being set up for validation';

      var drValidationService={
        validate:_validate,
      };

      return drValidationService;
      /**
        * @ngdoc function
        * @name sdrValidationService.validate
        *
        * @description
          use a schema uri to validate a model
        @param {string} schema - the path to the schema being used to validate
        @param {object} model  - the model to be validated
        * @returns  a promise to resolve true {valid:true} if the model validates or
          an explaination why
            {
                valid:false,
                message:'---',
                errors:[...],
                schema:{...},
                model:{...},
            }
      */
      function _validate(schema,model){
        return $q(function(resolve,reject){
          drSchemaLoader
            .getSchemaSet(schema)
            .then(function(schemaSet){
                var result = schemaSet.tv4.validateMultiple(model, schemaSet.schema);
                if(result && result.valid){
                    resolve({
                      valid:true
                    });
                }else{
                    reject({
                      valid   : false,
                      message : MODEL_VALIDATION_FAILED_MESSAGE,
                      errors  : (result.errors)?result.errors:[],
                      missing : (result.missing)?result.missing:[],
                      schema  : schema,
                      model   : model
                    });
                }
            })
            .catch(function(error){
                reject({
                  message:SCHEMA_INITIALIZATION_EXCEPTION
                });
            });
        });
      }

  }
})(angular,angular.module('diroop.tools').factory);
