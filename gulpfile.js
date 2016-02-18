'use strict';

var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var assign = require('lodash/assign');
var path = require('path');


var scriptsDir = './public/scripts/';
var buildDir = './public/lib/';

function buildScript(file, watch) {
    var customOpts = {entries: path.join(scriptsDir, file)};
    var opts = assign({}, watchify.args, customOpts);
    var bundler = browserify(opts);
    bundler = watch ? watchify(bundler) : bundler;
    bundler.transform(babelify.configure({
        presets: ['es2015', 'react'],
        ignore: /(bower_components)|(node_modules)/
    }));
    function rebundle() {
        return bundler.bundle()
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source(file))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify().on('error', gutil.log))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(buildDir));
    }
    bundler.on('update', function() {
        rebundle();
        gutil.log('Rebundle at ' + new Date());
    });
    return rebundle();
}

gulp.task('build', function() {
    return buildScript('my_test.js', false);
});

gulp.task('default', ['build'], function() {
    return buildScript('my_test.js', true);
});
