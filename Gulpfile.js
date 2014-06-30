
'use strict';

var gulp = require('gulp');

var browserSync = require('browser-sync');

var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');

var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var jscs = require('gulp-jscs');
var watchify = require('watchify');
var reactify = require('reactify');
var debowerify = require('debowerify');
var source = require('vinyl-source-stream');

var spritesmith = require('gulp.spritesmith');

var watchScripts = function() {
    var rebundle = function() {
        return bundler.bundle({debug: true})
            .pipe(source('app.js'))
            .pipe(gulp.dest('build/scripts/'));
    };
    var bundler = watchify({
            entries: ['./app/scripts/app.js', './app/jsx/app.jsx'],
            extensions: ['.js', '.jsx']
        })
//        .plugin('minifyify', {
//            map: 'app.js.map',
//            output: 'build/scripts/app.js.map'
//        })
        .transform(reactify)
        .transform(debowerify)
        .on('update', rebundle);
    
    return rebundle();
};

gulp.task('html', function() {
    return gulp.src('app/**/*.html')
        .pipe(gulp.dest('build'));
});

gulp.task('css', function() {
    return gulp.src('app/styles/**/*')
        .pipe(sass({
            sourceComments: 'map',
            errLogToConsole: true,
            outputStyle: 'compressed'
        }))
        .pipe(prefix('last 2 versions', {
            map: true,
            from: 'main.css.map',
            to: 'main.css.map'
        }))
        .pipe(gulp.dest('build/styles'));
});

gulp.task('jscs', function() {
    gulp.src('app/scripts/**/*')
        .pipe(jscs());
});

gulp.task('lint', function() {
    gulp.src('app/scripts/**/*')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'));
});

gulp.task('js', ['jscs', 'lint'], function() {
    watchScripts();
});

gulp.task('images', function () {
    var spriteData = gulp.src('images/*.png').pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: 'sprite.css'
    }));
    spriteData.img.pipe(gulp.dest('build/images/'));
    spriteData.css.pipe(gulp.dest('build/styles/'));
});

gulp.task('default', ['html', 'css', 'js', 'images'], function() {
    console.log('starting browserSync');
    browserSync.init(['build/**/*.html', 'build/styles/**/*', 'build/scripts/**/*'], {
        server: {
            baseDir: './build'
        }
    });
    gulp.watch('app/**/*.html', ['html']);
    gulp.watch('app/styles/**/*', ['css']);
    gulp.watch('app/scripts/**/*', ['js']);
    gulp.watch('app/images/**/*', ['images']);
});
