var fs   = require('fs');
var path = require('path');

var gulp = require('gulp');

// local server
var connect = require('gulp-connect');

// compile
var jade    = require('gulp-jade');
var sass    = require('gulp-sass');
var uglify  = require('gulp-uglify');

// build
var concat     = require('gulp-concat');
var rename     = require('gulp-rename');
var header     = require('gulp-header');
var sourcemaps = require('gulp-sourcemaps');

// check
var jshint       = require('gulp-jshint');
var packageJSON  = require('./package');
var jshintConfig = packageJSON.jshintConfig;

// test images
var testData     = require('./test/data');

var DIR          = require('./dir.js');
var UI_CONFIG_LIST   = require('./config.js');

var COMBO_VERSION = '1.0.0';

var BANNER       = '\
/*=> <%= name %>\n\
 *=> <%= date %> */\n\n';

var BANNER_COMBO = '\
/* ------------------------------------------------------------------------\n\
 * Easy UI Copyright 2015-2015 @ JD, Inc. Licensed under MIT\n\
 * @version <%= version %>\n\
 * @date    <%= date %>\n\
 * ------------------------------------------------------------------------ */\n';

 var timeString = (function() {
     var now = new Date();
     var template = '{Y}-{M}-{D} {h}:{m}:{s}';
     var timeString = template.replace('{Y}', now.getFullYear())
                     .replace('{M}', now.getMonth() + 1)
                     .replace('{D}', now.getDate())
                     .replace('{h}', now.getHours())
                     .replace('{m}', now.getMinutes())
                     .replace('{s}', now.getSeconds());

    return timeString;
 })();

gulp.task('rebuild_dir', function() {
    var configContent = '';
    var jadeContent   = fs.readFileSync(path.join(DIR.assets, 'template.jade'), 'utf8');
    var jsContent     = fs.readFileSync(path.join(DIR.assets, 'template.js'), 'utf8');
    var cssContent    = '';
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
        var configFile = path.join(dir, 'config.json');
        var jadeFile   = path.join(dir, 'index.jade');
        var jsFile     = path.join(dir, ui.name + '.js');
        var cssFile    = path.join(dir, ui.name + '.scss');
        var readmeFile = path.join(dir, '/README.md');

        if ( !fs.existsSync(configFile) ) {
            configContent = JSON.stringify(ui, null, '    ');

            writeFile(configFile, configContent);
        }
        if ( !fs.existsSync(jadeFile) ) {
            writeFile(jadeFile, jadeContent);
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
    UI_CONFIG_LIST.forEach(function (ui) {
        var currentDir  = path.join(DIR.ui, ui.name);
        var currentFile = path.join(DIR.ui, ui.name, ui.name + '.js');
        var destDir     = path.join(DIR.build.ui, ui.name, ui.version);

        gulp.src(currentFile)
            .pipe(sourcemaps.init())
            .pipe(uglify({
                compress: {
                    global_defs: {
                        // DEBUG: true
                    },
                    // drop_console: true
                },
                output: {
                    ascii_only: true,
                },
                outSourceMap: path.join(destDir, ui.name + '.js.map'),
                sourceRoot: path.join(DIR.release, ui.name)
            }))
            .pipe(header(BANNER, {
                name: ui.name,
                date: timeString
            }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(destDir));
    });
});

gulp.task('concat_js', function () {
    var buildComboDir = DIR.build.combo.replace('{VERSION}', COMBO_VERSION);

    gulp.src(DIR.script)
       .pipe(concat('easy.js'))
       .pipe(sourcemaps.init())
       .pipe(uglify({
           output: {
               ascii_only: true,
           },
           outSourceMap: path.join(buildComboDir + 'easy.js.map'),
           sourceRoot: buildComboDir
       }))
       .pipe(header(BANNER_COMBO, {
           version: COMBO_VERSION,
           date: timeString
       }))
       .pipe(sourcemaps.write('./'))
       .pipe(gulp.dest(buildComboDir));
});

gulp.task('compile_jade', function() {
    var dirs = fs.readdirSync(DIR.ui);

    function compileJade(jadePath, data) {
        data.imgs   = testData.imgs;
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
        var jadeFilePath   = path.join(DIR.ui, file, 'index.jade');

        if (/^E/.test(file) && fs.existsSync(configFilePath) && fs.existsSync(jadeFilePath)) {
            var config = require('./' + configFilePath);

            compileJade(jadeFilePath, config);
        } else {
            console.log('config file not found.' + file)
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
        root: [DIR.ui, './build'],
        livereload: false
    });
});

gulp.task('dev', ['watch', 'server', 'compile_sass', 'compile_jade']);
