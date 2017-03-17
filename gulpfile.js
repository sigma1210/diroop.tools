(function(){
  'use strict';

  var gulp = require('gulp')

  gulp.task('clean',clean);
  gulp.task('jshint', jshint);
  gulp.task('jshintTest',jshintTests);
  gulp.task('build-template-cache', ['clean'], buildTemplateCache);
  gulp.task('build-schema-cache', ['clean'], buildSchemaCache);
  gulp.task('build', ['build-schema-cache','build-template-cache'], build);
  gulp.task('test', ['build'],unitTests);
  gulp.task('watch', ['build'],watch);
  gulp.task('default', ['watch']);

  var concat      = require('gulp-concat'),
      rename      = require('gulp-rename'),
      jshint      = require('gulp-jshint'),
      ngHtml2Js   = require("gulp-ng-html2js"),
      ngSchema2js = require("./gulp_extentions/gulp-ng-schema2dr"),
      minifyHtml  = require('gulp-minify-html'),
      cssToJs     = require('gulp-css-to-js'),
      cleanCss    = require('gulp-clean-css'),
      less        = require('gulp-less'),
      base64      = require('gulp-base64'),
      sourcemaps  = require('gulp-sourcemaps'),
      uglify      = require('gulp-uglify'),
      del         = require('del'),
      fs          = require('fs');

  var SRC_DIRECTORY                   = './src/**/*.js',
      TEST_SRC_DIRECTORY              = './test/**/*.js',
      JSHINT_SRC_DIRECTORIES          = [SRC_DIRECTORY],
      TEMP_DIRECTORIES                = ['./temp/*', './dist/*'],
      CODE_FILES                      = [
                                          './src/*.js',
                                          './src/**/*.js',
                                          './temp/templates/*.js',
                                          './temp/schemas/*.js'
                                        ],
      TEST_FILES                      = [
                                         './testmodule/*.js',
                                         './testmodule/**/*.js',
                                         './temp/tests/*.js'
                                        ],
      WATCH_FILES                     = ['src/**/*.*','testmodules/**/*.*'] ,
      /*partial packing */
      TEMPLATE_SRC_DIRECTORY          = ['./src/**/*.html'],
      TEMPLATE_MODULE_NAME            = 'diroop.tools.templateCache',
      TEMPLATE_PREFIX                 = 'drTemplateCache:/',
      TEMPLATE_MODULE_FILE_NAME       = 'drTemplateCache.js',
      TEMP_DIRECTORY                  = './temp/templates',
      /*schema packing*/
      SCHEMA_SRC_DIRECTORY            = ['./src/schemaCache/**/*.schema.json'],
      SCHEMA_MODULE_NAME              = 'diroop.schema.cache',
      SCHEMA_MODULE_FILE_NAME         = 'diroopSchemaCache.js',
      SCHEMA_PREFIX                   = 'schemaCache:/',
      SCHEMA_TEMP_DIRECTORY           = './temp/schema',
      DIST_DIRECTORY                  = './dist',
      DIST_FILE                       = 'diroop.tools.js',
      DIST_FILE_MIN                   = 'diroop.tools.min.js',
      PACKAGE_FILE                    = './package.json',
      PACKAGE                         = JSON.parse(fs.readFileSync(PACKAGE_FILE)),
      BOWER_FILE                      = './bower.json',
      BOWER                           = JSON.parse(fs.readFileSync(BOWER_FILE));

    // cleans all temp directories
    function clean(callback){
      return del(TEMP_DIRECTORIES , callback);
    }

    //hint the src
    function jshint(){
      return basehint(JSHINT_SRC_DIRECTORIES,jshint.reporter('default'));
    }

    //hint the tests
    function jshintTests(){
      return basehint([TEST_SRC_DIRECTORY],jshint.reporter('default'));
    }

    // base jshint - for defining custom hints
    function basehint(src,reporter){
      return gulp.src(src)
          .pipe(jshint())
          .pipe(reporter);
    }
    // builds the template cache from the *.html partials
    function buildTemplateCache(){
      return gulp.src(TEMPLATE_SRC_DIRECTORY)
        .pipe(minifyHtml({ empty: true, spare: true, quotes: true }))
        .pipe(ngHtml2Js({
            moduleName: TEMPLATE_MODULE_NAME,
            prefix:TEMPLATE_PREFIX
        }))
        .pipe(concat(TEMPLATE_MODULE_FILE_NAME))
        .pipe(gulp.dest(TEMP_DIRECTORY));
    }

    // builds the schemaCache from the .schema.json files
    function buildSchemaCache(){
      return gulp.src(SCHEMA_SRC_DIRECTORY)
        .pipe(ngSchema2js({
            moduleName: SCHEMA_MODULE_NAME,
            prefix:SCHEMA_PREFIX
        }))
        .pipe(concat(SCHEMA_MODULE_FILE_NAME))
        //.pipe(uglify())
        .pipe(gulp.dest(TEMP_DIRECTORY));
    }
    // builds the source
    function build(){
      return gulp.src(CODE_FILES )
          .pipe(sourcemaps.init())
          .pipe(concat(DIST_FILE))
          .pipe(gulp.dest(DIST_DIRECTORY))
          .pipe(uglify())
          .pipe(rename(DIST_FILE_MIN))
          .pipe(sourcemaps.write('./'))
          .pipe(gulp.dest(DIST_DIRECTORY));
    }


    //execute the unit test
    function unitTests(cb){
      var Server = require('karma').Server;
      new Server({
        configFile: __dirname + '/tests/karma-unit.conf.js',
        singleRun: true
      }, function(){cb()}).start();
    }

    function watch(){
        gulp.watch(WATCH_FILES , ['jshint', 'build']);
    }



})();
