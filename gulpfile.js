const {
  series,
  parallel
} = require("gulp");
const gulp = require("gulp"),
  sass = require("gulp-sass"),
  cleanCSS = require("gulp-clean-css"),
  rename = require("gulp-rename"),
  postcss = require("gulp-postcss"),
  groupmq = require("gulp-group-css-media-queries"),
  autoprefixer = require("autoprefixer"),
  rigger = require("gulp-rigger"),
  browserSync = require("browser-sync"),
  imagemin = require("gulp-imagemin"),
  svgmin = require("gulp-svgmin"),
  cheerio = require("gulp-cheerio"),
  svgSprite = require("gulp-svg-sprite"),
  replace = require("gulp-replace"),
  uglify = require("gulp-uglify"),
  del = require("del"),
  babel = require("gulp-babel");

gulp.task("styles", function () {
  return gulp
    .src("src/sass/main.scss")
    .pipe(sass())
    .pipe(groupmq())
    .pipe(postcss([autoprefixer()]))
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(gulp.dest("build/styles/"))
    .pipe(browserSync.stream());
});

gulp.task("html", function () {
  return gulp
    .src("src/*.html")
    .pipe(rigger())
    .pipe(gulp.dest("build/"))
    .pipe(browserSync.stream());
});

gulp.task("fonts", function () {
  return gulp
    .src("src/fonts/**/*")
    .pipe(gulp.dest("build/fonts/"))
    .pipe(browserSync.stream());
});

gulp.task("images", function () {
  return gulp
    .src("src/img/**/*", "!src/img/icons/*.svg")
    .pipe(imagemin())
    .pipe(gulp.dest("build/img/"))
    .pipe(browserSync.stream());
});

gulp.task("svgSprite", function () {
  return gulp
    .src("src/img/icons/*.svg")
    .pipe(
      svgmin({
        js2svg: {
          pretty: true
        }
      })
    )
    .pipe(
      cheerio({
        run: function ($) {
          $("[style]").removeAttr("style");
        },
        parserOptions: {
          xmlMode: true
        }
      })
    )
    .pipe(replace("&gt;", ">"))
    .pipe(
      svgSprite({
        mode: {
          symbol: {
            sprite: "sprite.svg"
          }
        }
      })
    )
    .pipe(gulp.dest("build/img/"))
    .pipe(browserSync.stream());
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("scripts", function () {
  return gulp.src(["src/js/scripts.js"])
    .pipe(rigger())
    .pipe(uglify())
    .pipe(gulp.dest("build/js/"))
    .pipe(browserSync.stream());
});

gulp.task("serve", function () {
  browserSync.init({
    injectChanges: true,
    server: {
      baseDir: "build"
    },
    online: true,
    open: true,
    notify: false,
    cors: true,
    ui: false
  });
  gulp
    .watch("src/**/*.html", gulp.series("html"))
    .on("change", browserSync.reload);
  gulp.watch("src/sass/**/*.scss", gulp.parallel("styles"));
  gulp.watch("src/js/**/*.js", gulp.parallel("scripts"));
  gulp.watch("src/img/**/*", gulp.parallel("images"));
  gulp.watch("src/img/icons/*.svg", gulp.parallel("svgSprite"));
});

gulp.task(
  "dev",
  gulp.series(
    "clean",
    "html",
    gulp.parallel(["styles", "fonts", "images", "svgSprite", "scripts"]),
    gulp.parallel("serve")
  )
);
