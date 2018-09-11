const gulp = require('gulp');

// gulp plugins and utils
const gutil = require('gulp-util');
const livereload = require('gulp-livereload');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const zip = require('gulp-zip');
const watch = require('gulp-watch');

// postcss plugins
const autoprefixer = require('autoprefixer');
const colorFunction = require('postcss-color-function');
const cssnano = require('cssnano');
const customProperties = require('postcss-custom-properties');
const easyimport = require('postcss-easy-import');

const swallowError = function swallowError(error) {
    gutil.log(error.toString());
    gutil.beep();
    this.emit('end');
};

const nodemonServerInit = function () {
    livereload.listen(1234);
};

const source = './',  
  destination = './docker-mount';

gulp.task('build', ['css'], function (/* cb */) {
    return nodemonServerInit();
});

gulp.task('css', function () {
    const processors = [
        easyimport,
        customProperties,
        colorFunction(),
        autoprefixer({browsers: ['last 2 versions']}),
        cssnano()
    ];

  return gulp.src(`${source}/assets/css/*.css`)
        .on('error', swallowError)
        .pipe(sourcemaps.init())
        .pipe(postcss(processors))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('assets/built/'))
        .pipe(livereload());
});

gulp.task('watch', function () {
  const foldersToWatch = [
        '**',
        '!node_modules', '!node_modules/**',
        '!zip', '!zip/**',
        '!docker-mount', '!docker-mount/**',
        'docker-compose.yml'
    ];
    gulp.watch(`${source}/assets/css/**`, ['css']);
    gulp.src(foldersToWatch, {base: source})
      .pipe(watch(foldersToWatch, {base: source}))
      .pipe(gulp.dest(destination));
});

gulp.task('zip', ['css'], function () {
    const targetDir = 'zip/';
    const themeName = require('./package.json').name;
    const filename = themeName + '.zip';

    return gulp.src([
        '**',
        '!node_modules', '!node_modules/**',
        '!zip', '!zip/**',
        '!docker-mount', '!docker-mount/**'
    ])
        .pipe(zip(filename))
        .pipe(gulp.dest(targetDir));
});

gulp.task('default', ['build'], function () {
    gulp.start('watch');
});
