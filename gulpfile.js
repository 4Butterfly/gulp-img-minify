import gulp from 'gulp';
import imagemin, {
  gifsicle,
  mozjpeg,
  optipng,
  svgo
} from 'gulp-imagemin';
import webp from 'gulp-webp';
import {
  deleteAsync
} from 'del';
// const imageminGifsicle = require('imagemin-gifsicle');





gulp.task('clean-result', function () {
  return deleteAsync('result/**', {
    force: true
  });
});

gulp.task('minify-img', function () {
  return gulp.src('src/images/*')
    .pipe(imagemin([
      gifsicle({
        interlaced: true
      }),
      mozjpeg({
        quality: 75,
        progressive: true
      }),
      optipng({
        optimizationLevel: 5
      }),
      
      // svgo({
      //   plugins: [{
      //       removeViewBox: true
      //     },
      //     {
      //       cleanupIDs: false
      //     }
      //   ]
      // })
    ]))
    .pipe(gulp.dest('result/images'))
});

gulp.task('convert-to-webp', function () {
  return gulp.src('result/images/*')
    .pipe(webp())
    .pipe(gulp.dest('result/images/webp'))
});

gulp.task('start', gulp.series('clean-result', 'minify-img', 'convert-to-webp'))
// export default () => (
//   console.log("Use 'Gulp start'")
// )