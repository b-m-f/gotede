const gulp = require("gulp");

// gulp plugins and utils
const gutil = require("gulp-util");
const livereload = require("gulp-livereload");
const postcss = require("gulp-postcss");
const sourcemaps = require("gulp-sourcemaps");
const zip = require("gulp-zip");
const watch = require("gulp-watch");

// postcss plugins
const postcssPresetEnv = require("postcss-preset-env");

const swallowError = function swallowError(error) {
  gutil.log(error.toString());
  gutil.beep();
  this.emit("end");
};

const nodemonServerInit = function() {
  livereload.listen(1234);
};

const source = ".",
  destination = "./docker-mount";

gulp.task("css", function() {
  return gulp
    .src(`${source}/assets/css/*.css`)
    .on("error", swallowError)
    .pipe(sourcemaps.init())
    .pipe(
      postcss(
        postcssPresetEnv({
          importFrom: `${source}/assets/css/helpers/variables.css`
        })
      )
    )
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("assets/built/"))
    .pipe(livereload());
});

gulp.task(
  "build",
  gulp.series("css", function(/* cb */) {
    return nodemonServerInit();
  })
);

gulp.task(
  "watch",
  gulp.series("css", function() {
    const foldersToWatch = [
      "**",
      "!node_modules",
      "!node_modules/**",
      "!zip",
      "!zip/**",
      "!docker-mount",
      "!docker-mount/**",
      "!docker-compose.yml",
      "!gulpfile.js"
    ];
    gulp.watch(`${source}/assets/css/**`, gulp.parallel("css"));
    gulp
      .src(foldersToWatch, { base: source })
      .pipe(watch(foldersToWatch, { base: source }))
      .pipe(gulp.dest(destination));
  })
);

gulp.task(
  "zip",
  gulp.series("css", function() {
    const targetDir = "zip/";
    const themeName = require("./package.json").name;
    const filename = themeName + ".zip";

    return gulp
      .src([
        "**",
        "!node_modules",
        "!node_modules/**",
        "!zip",
        "!zip/**",
        "!docker-mount",
        "!docker-mount/**"
      ])
      .pipe(zip(filename))
      .pipe(gulp.dest(targetDir));
  })
);

gulp.task(
  "default",
  gulp.series("build", function() {
    gulp.start("watch");
  })
);
