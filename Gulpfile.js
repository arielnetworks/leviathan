
var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var autoprefix = require('gulp-autoprefixer');
var notify = require('gulp-notify');
var Path = require('path');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');

// Super thanks: http://truongtx.me/2014/08/06/using-watchify-with-gulp-for-fast-browserify-build/
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var watchify = require('watchify');



var config = {
  sassPath: './src/ui/sass',
  uiEntryPoint: './src/ui/main.js',
  bowerPath: './bower_components',
  deployPath: './public'
};



// Main Tasks
gulp.task('default', ['icons', 'css', 'js']);
gulp.task('js', browserifyShare.bind(null, false));
gulp.task('css', css);
gulp.task('watch', ['icons', 'watch-js', 'watch-sass']);



gulp.task('watch-js', browserifyShare.bind(null, true));

gulp.task('watch-sass', ['css'], watchSass);

gulp.task('icons', function() {
  return gulp.src([
    config.bowerPath + '/bootstrap-sass-official/assets/fonts/bootstrap/**.*',
    config.bowerPath + '/fontawesome/fonts/**.*'
  ])
  .pipe(gulp.dest(Path.join(config.deployPath, 'css/fonts')));
});

function watchSass() {
  gulp.watch(config.sassPath + '/**/*.sass', ['css']);
}

function css() {
  return sass(Path.join(config.sassPath, 'main.sass'), {
    style: 'compressed',
    loadPath: [
      config.sassPath,
      Path.join(config.bowerPath, 'bootstrap-sass-official/assets/stylesheets'),
      Path.join(config.bowerPath, 'fontawesome/scss')
    ],
    'sourcemap=none': true
  })
  .on('error', notify.onError(function(error) {
    return 'Error: ' + error.message;
  }))
  .pipe(autoprefix('last 2 version'))
  .pipe(gulp.dest(Path.join(config.deployPath, 'css')));
}

function browserifyShare(watch) {
  var b = browserify({
    cache: {},
    packageCache: {},
    fullPaths: true
  });
  if (watch) {
    b = watchify(b);
    b.on('update', function() {
      bundleShare(b);
    });
  }
  b.add(config.uiEntryPoint);
  bundleShare(b);
  function bundleShare(b) {
    b = b.bundle().pipe(source('bundle.js'));
    if (!watch) {
      b.pipe(streamify(uglify()));
    }
    b.pipe(gulp.dest(Path.join(config.deployPath, 'js')));
  }
}

