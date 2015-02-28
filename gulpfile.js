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

var uiPath = './ui';

// test images

var imgs = [
    'http://img12.360buyimg.com/n4/jfs/t541/185/159871123/94541/c49db75b/545347fbN11ceb7a8.jpg',
    'http://img12.360buyimg.com/n4/jfs/t490/152/159386448/85288/b9c2b3c5/545347fbN36cc2de5.jpg',
    'http://img12.360buyimg.com/n4/jfs/t691/176/159981014/95095/feb22124/545347fcN3ebe63cc.jpg',
    'http://img12.360buyimg.com/n4/jfs/t691/176/159981014/95095/feb22124/545347fcN3ebe63cc.jpg',
    'http://img12.360buyimg.com/n4/jfs/t592/164/159635526/108139/f913c69f/545347fcN87e008bf.jpg',
    'http://img14.360buyimg.com/n4/jfs/t277/193/1005339798/768456/29136988/542d0798N19d42ce3.jpg',
    'http://img14.360buyimg.com/n4/jfs/t352/148/1022071312/209475/53b8cd7f/542d079bN3ea45c98.jpg',
    'http://img14.360buyimg.com/n4/jfs/t274/315/1008507116/108039/f70cb380/542d0799Na03319e6.jpg',
    'http://img14.360buyimg.com/n4/jfs/t337/181/1064215916/27801/b5026705/542d079aNf184ce18.jpg',
    'http://img12.360buyimg.com/n4/jfs/t697/262/539845273/113493/cc1fc190/54bcc829Na6512cb2.jpg',
    'http://img12.360buyimg.com/n4/jfs/t751/329/255193563/103693/7409075/549b7869N19e8e98b.jpg',
    'http://img12.360buyimg.com/n4/jfs/t529/196/943810855/44602/5675997c/549b786aN97861eb6.jpg',
    'http://img12.360buyimg.com/n4/jfs/t598/33/954042569/41110/e437828/549b786bNf933f607.jpg',
    'http://img12.360buyimg.com/n4/jfs/t586/269/937428984/69666/d0d9129f/549b786bN3cc44d60.jpg',
    'http://img12.360buyimg.com/n4/jfs/t496/118/948924821/50373/d4e8fb6f/549b786cN4ff7b8d9.jpg',
    'http://img12.360buyimg.com/n4/jfs/t712/299/283383972/95546/c016a193/549b786dNf6f11a6a.jpg',
    'http://img12.360buyimg.com/n4/jfs/t226/261/1666708977/174794/a41d1945/53fd4547N430160cb.jpg',
    'http://img12.360buyimg.com/n4/jfs/t235/16/1686590624/95312/458c59d4/53fd4681N180b5a05.jpg',
    'http://img13.360buyimg.com/n4/jfs/t286/247/1804542634/153227/c9885ca/54422bcfN6d6b5fe0.jpg',
    'http://img11.360buyimg.com/n4/jfs/t298/55/245046980/171632/9f73afc4/5406dd74N936674f2.jpg',
    'http://img14.360buyimg.com/n4/jfs/t217/175/2044410654/457825/a4b93e77/54055b5cN00fe600a.jpg',
    'http://img10.360buyimg.com/n4/jfs/t667/242/231517560/150553/c65a7bd3/5458e08cN43d2801e.jpg'
];


gulp.task('compile_jade', function() {
    var dirs = fs.readdirSync(uiPath);

    function compileJade(jadePath, data) {
        data.imgs = imgs;
        gulp.src(jadePath)
            .pipe(jade({
                locals: data,
                pretty: true
            }))
            .pipe(gulp.dest(path.join(uiPath, data.name)))
    }

    dirs.forEach(function(file) {
        var configFilePath = path.join(uiPath, file, 'config.json');
        var jadeFilePath = path.join(uiPath, file, 'index.jade');

        if (/^E/.test(file) && fs.existsSync(configFilePath) && fs.existsSync(jadeFilePath)) {
            var config = require('./' + configFilePath);

            compileJade(jadeFilePath, config);
        } else {
            console.log('config file not found.')
        }
    });
});

gulp.task('compile_sass', function() {
    gulp.src('./ui/*/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./ui'));
});
gulp.task('default', function() {
    gulp.src('./ui/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('watch', function() {
    gulp.watch('./ui/**/index.jade', ['compile_jade']);
    gulp.watch('./ui/assets/layout.jade', ['compile_jade']);

    gulp.watch('./ui/assets/*.scss', ['compile_sass']);
    gulp.watch('./ui/**/*.scss', ['compile_sass']);
});

gulp.task('server', function() {
    connect.server({
        root: uiPath,
        livereload: true
    });
});

gulp.task('dev', ['watch', 'server', 'compile_sass', 'compile_jade']);
