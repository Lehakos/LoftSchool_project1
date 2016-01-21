var gulp = require("gulp"),
    browserSync = require('browser-sync'),
    modernizr = require('gulp-modernizr');

// Сборка файла modernizr
gulp.task('modernizr', function() {
  gulp.src('app/js/*.js')
    .pipe(modernizr({
      'options': [
        'setClasses',
        'html5shiv'
      ],
      'tests': [
        'placeholder',
        'csstransforms',
        'cssgradients'
      ],
      'uglify': true
    }))
    .pipe(gulp.dest("app/js/vendor"))
});

// Сервер
gulp.task('server', function () {
  browserSync({
    port: 9000,
    server: {
      baseDir: 'app'
    }
  });
});

// Слежка
gulp.task('watch', function () {
  gulp.watch([
    'app/*.html',
    'app/js/**/*.js',
    'app/css/**/*.css'
  ]).on('change', browserSync.reload);
});

// Задача по-умолчанию
gulp.task('default', ['modernizr','server', 'watch']);
