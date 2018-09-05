var gulp = require('gulp'),  
    watch = require('gulp-watch');

var source = './src',  
  destination = './docker-mount';

gulp.task('watch', function() {  
  gulp.src(source + '/**/*', {base: source})
    .pipe(watch(source, {base: source}))
    .pipe(gulp.dest(destination));
});
