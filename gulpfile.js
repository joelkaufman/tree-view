var
    gulp 	      = require('gulp'),
    livereload    = require('gulp-livereload'),// reload browser on change
    sass          = require('gulp-sass'),
    autoprefixer  = require('gulp-autoprefixer'),// css prefixer,
    child_process = require('child_process')
    ;




var path = {
    scss:[ 'src/scss/*.scss','src/sass/*.scss'],
    css: 'app/css',
    jade: 'src/jade/*.jade'
};


gulp.task('sass',function(){
    gulp.src(path.scss)
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1'],
            cascade: false
        }))
        .pipe(gulp.dest(path.css));
});



gulp.task('watch',function()
{
    livereload.listen();

    // all app changes
    gulp.watch('app/**/*').on('change',livereload.changed);
    // sass changes
    gulp.watch(path.scss,['sass']);
});



module.exports = gulp;// export gulp for 3rt party tools

gulp.task('default',['watch']);