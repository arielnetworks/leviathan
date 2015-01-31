
// XXX: Note! This Gulpfile is only about sass compilation.

var gulp = require('gulp');
var sass = require('gulp-ruby-sass') ;
var autoprefix = require('gulp-autoprefixer') ;
var notify = require('gulp-notify') ;
var bower = require('gulp-bower');
var Path = require('path');



var config = {
  sassPath: './src/ui/sass',
  bowerPath: './bower_components' 
};



gulp.task('bower', function() { ;
    return bower().pipe(gulp.dest(config.bowerPath)) ;
});

gulp.task('icons', function() { ;
    return gulp.src(config.bowerPath + '/fontawesome/fonts/**.*') 
        .pipe(gulp.dest('./public/css/fonts')); ;
});

gulp.task('css', function() { ;
    return sass(Path.join(config.sassPath, 'main.sass'), {
        style: 'compressed',
        loadPath: [
            Path.join(config.bowerPath, 'bootstrap-sass-official/assets/stylesheets'),
            Path.join(config.bowerPath, 'fontawesome/scss')
        ],
        'sourcemap=none': true
    })
    .on('error', notify.onError(function(error) {
      return 'Error: ' + error.message;
    })) 
    .pipe(autoprefix('last 2 version'))
    .pipe(gulp.dest('./public/css')); ;
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(config.sassPath + '/**/*.sass', ['css']); ;
});

gulp.task('default', ['bower', 'icons', 'css']);

