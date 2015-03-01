var fs = require('fs');
var path = require('path');

var gulp = require('gulp');

var connect = require('gulp-connect');

var sass = require('gulp-sass');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var jade = require('gulp-jade');

// test images
var testData = require('./test/data');

var dir = {
    ui: './ui',
    assets: './ui/assets',
    scss: './ui/*/*.scss',
    script: './ui/*/*.js',

    jade2watch: './ui/*/*.jade'
};

gulp.task('compile_jade', function() {
    var dirs = fs.readdirSync(dir.ui);

    function compileJade(jadePath, data) {
        data.imgs = testData.imgs;
        data.sliders = testData.sliders;
        gulp.src(jadePath)
            .pipe(jade({
                locals: data,
                pretty: true
            }))
            .pipe(gulp.dest(path.join(dir.ui, data.name)))
    }

    dirs.forEach(function(file) {
        var configFilePath = path.join(dir.ui, file, 'config.json');
        var jadeFilePath = path.join(dir.ui, file, 'index.jade');

        if (/^E/.test(file) && fs.existsSync(configFilePath) && fs.existsSync(jadeFilePath)) {
            var config = require('./' + configFilePath);

            compileJade(jadeFilePath, config);
        } else {
            console.log('config file not found.')
        }
    });
});

gulp.task('compile_sass', function() {
    gulp.src(dir.scss)
        .pipe(sass())
        .pipe(gulp.dest(dir.ui));
});
gulp.task('default', function() {
    gulp.src(dir.script)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('watch', function() {
    gulp.watch(dir.jade2watch, ['compile_jade']);

    gulp.watch(dir.scss, ['compile_sass']);
});

gulp.task('server', function() {
    connect.server({
        port: 1024,
        root: dir.ui,
        livereload: false
    });
});

gulp.task('dev', ['watch', 'server', 'compile_sass', 'compile_jade']);
