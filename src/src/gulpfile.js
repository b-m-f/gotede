const gulp = require("gulp");

// gulp plugins and utils
const postcss = require("gulp-postcss");
const sourcemaps = require("gulp-sourcemaps");
const zip = require("gulp-zip");

// postcss plugins
const postcssPresetEnv = require("postcss-preset-env");
const autoprefixer = require("autoprefixer");
const postCSSImport = require("postcss-import");

const source = ".",
  destination = "./docker-mount";

gulp.task("css", function() {
  const processors = [
    postCSSImport,
    postcssPresetEnv({
      stage: 3,
      features: {
        "nesting-rules": true
      }
    }),
    autoprefixer
  ];
  return gulp
    .src(`${source}/assets/css/styles.css`)
    .pipe(sourcemaps.init())
    .pipe(postcss(processors))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("assets/built/"));
});

gulp.task("watch-css", function() {
  gulp.watch(`${source}/assets/css/**/*.css`, gulp.series("css"));
});

const sourceFiles = ["*.hbs", "assets/**/*", "package.json", "locales**/*"];

gulp.task("move-source-files", function(done) {
  gulp.src(sourceFiles, { base: source }).pipe(gulp.dest(destination));
  done();
});

gulp.task("watch-source-files", function() {
  gulp.watch(sourceFiles, gulp.series("move-source-files"));
});

gulp.task(
  "watch",
  gulp.series("css", gulp.parallel("watch-css", "watch-source-files"))
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

gulp.task("default", gulp.series("watch"));
