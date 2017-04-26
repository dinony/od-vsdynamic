const gulp = require('gulp');
const inlineTpl = require('gulp-inline-ng2-template');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

gulp.task('prefixCSS', function () {
  const plugins = [
    autoprefixer({browsers: ['> 1%']}),
    cssnano()
  ];

  return gulp.src('src/**/*.css')
    .pipe(postcss(plugins))
    .pipe(gulp.dest('tmpPrefix'));
});

gulp.task('copyTS', () => gulp.src('src/**/*.ts').pipe(gulp.dest('tmpPrefix')));

gulp.task('inline', ['copyTS', 'prefixCSS'], () => {
  return gulp.src('tmpPrefix/**/*.ts')
    .pipe(inlineTpl({customFilePath: (ext, file) => file.replace('src', 'tmpPrefix')}))
    .pipe(gulp.dest('tmpBuild'));
});