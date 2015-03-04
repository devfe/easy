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

var BASE_VERSION = '1.0.0';

var UI_CONFIG_LIST = [{
    name: 'EDropdown',
    version: '1.0.0',
    hasCSS: false
},{
    name: 'ELazyload',
    version: '1.0.0',
    hasCSS: false
},{
    name: 'ESlide',
    version: '1.0.0',
    hasCSS: true
},{
    name: 'ETab',
    version: '1.0.0',
    hasCSS: false
},{
    name: 'EModal',
    version: '1.0.0',
    hasCSS: true
},{
    name: 'ETips',
    version: '1.0.0',
    hasCSS: true
}];

var DIR = {
    ui: './ui',
    assets: './ui/assets',
    scss: './ui/*/*.scss',
    script: ['./ui/*/*.js', '!./ui/assets/*.js'],

    jade2watch: './ui/*/*.jade',

    build: {
        combo : 'build/E/1.0.0',
        ui    : 'build/E/ui/1.0.0/',
        biz   : 'build/E/biz/1.0.0/',
        base  : 'build/E/base/1.0.0'
    }
};


gulp.task('rebuild_dir', function() {
    var configContent = '';
    var jsContent = fs.readFileSync(path.join(DIR.assets, 'template.js'), 'utf8');
    var cssContent = '';
    var readmeContent = '';

    function writeFile (filename, content) {
        fs.writeFile(filename, content, 'utf-8', function(err) {
            if (err) {
                console.error('=> File write failed: ' + err);
            } else {
                console.log('==> Created success. [' + filename + '].');
            }
        });
    }

    function loopCheckFile (dir, ui) {
        var configFile = dir + '/' + 'config.json';
        var jsFile     = dir + '/' + ui.name + '.js';
        var cssFile    = dir + '/' + ui.name + '.scss';
        var readmeFile = dir + '/README.md';

        if ( !fs.existsSync(configFile) ) {
            configContent = JSON.stringify(ui, null, '    ');

            writeFile(configFile, configContent);
        }
        if ( !fs.existsSync(jsFile) ) {
            writeFile(jsFile, jsContent);
        }
        if ( !fs.existsSync(cssFile) && ui.hasCSS ) {
            writeFile(cssFile, cssContent);
        }
        if ( !fs.existsSync(readmeFile) ) {
            readmeContent = '#' + ui.name + '@' + ui.version;
            writeFile(readmeFile, readmeContent);
        }
    }

    function loopCheckDir (ui) {
        var dirname    = path.join(DIR.ui, ui.name);

        var dirExists  = fs.existsSync(dirname);

        if ( !dirExists ) {
            fs.mkdirSync(dirname);
        }

        loopCheckFile(dirname, ui);
    }

    UI_CONFIG_LIST.forEach(function(item) {
        loopCheckDir(item);
    });
});

gulp.task('compress_js', function() {
    gulp.src(DIR.script)
      .pipe(uglify())
      .pipe(gulp.dest(DIR.build.ui))
});

gulp.task('compile_jade', function() {
    var dirs = fs.readdirSync(DIR.ui);

    function compileJade(jadePath, data) {
        data.imgs = testData.imgs;
        data.slides = testData.slides;
        gulp.src(jadePath)
            .pipe(jade({
                locals: data,
                pretty: true
            }))
            .pipe(gulp.dest(path.join(DIR.ui, data.name)))
    }

    dirs.forEach(function(file) {
        var configFilePath = path.join(DIR.ui, file, 'config.json');
        var jadeFilePath = path.join(DIR.ui, file, 'index.jade');

        if (/^E/.test(file) && fs.existsSync(configFilePath) && fs.existsSync(jadeFilePath)) {
            var config = require('./' + configFilePath);

            compileJade(jadeFilePath, config);
        } else {
            console.log('config file not found.')
        }
    });
});

gulp.task('compile_sass', function() {
    gulp.src(DIR.scss)
        .pipe(sass())
        .pipe(gulp.dest(DIR.ui));
});

// lint 单个文件
gulp.task('lint', function() {
    var path = process.argv[4];

    gulp.src(path)
        .pipe(jshint(jshintConfig))
        .pipe(jshint.reporter('default'));
});



gulp.task('default', function() {
    gulp.src(DIR.script)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('watch', function() {
    gulp.watch(DIR.jade2watch, ['compile_jade']);

    gulp.watch(DIR.scss, ['compile_sass']);
});

gulp.task('server', function() {
    connect.server({
        port: 1024,
        root: DIR.ui,
        livereload: false
    });
});

gulp.task('dev', ['watch', 'server', 'compile_sass', 'compile_jade']);
