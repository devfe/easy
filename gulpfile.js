var fs = require('fs');
var path = require('path');

var gulp = require('gulp');

var connect = require('gulp-connect');

var sass = require('gulp-sass');
var jshint = require('gulp-jshint');
var packageJSON  = require('./package');
var jshintConfig = packageJSON.jshintConfig;

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var jade = require('gulp-jade');

// test images
var testData = require('./test/data');

var version = '1.0.0';
var dir = {
    ui: './ui',
    assets: './ui/assets',
    scss: './ui/*/*.scss',
    script: ['./ui/*/*.js', '!./ui/assets/*.js'],

    jade2watch: './ui/*/*.jade',

    build: {
        ui: 'build/easy/ui/1.0.0/',
        base: 'build/easy/base/1.0.0',
        combo: 'build/easy/lib/1.0.0'
    }
};

gulp.task('compress_js', function() {
    gulp.src(dir.script)
      .pipe(uglify())
      .pipe(gulp.dest(dir.build.ui))
});

gulp.task('compile_jade', function() {
    var dirs = fs.readdirSync(dir.ui);

    function compileJade(jadePath, data) {
        data.imgs = testData.imgs;
        data.slides = testData.slides;
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

// lint 单个文件
gulp.task('lint', function() {
    var path = process.argv[4];

    gulp.src(path)
        .pipe(jshint(jshintConfig))
        .pipe(jshint.reporter('default'));
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
