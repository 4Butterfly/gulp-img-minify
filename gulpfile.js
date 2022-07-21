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
import dom from 'gulp-dom';
// const imageminGifsicle = require('imagemin-gifsicle');





gulp.task('clean-result', function () {
  return deleteAsync('result/**', {
    force: true
  });
});

gulp.task('minify-img', function () {
  return gulp.src('src/assets/*')
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
    .pipe(gulp.dest('result/land/assets'))
});
gulp.task('change-html', function () {
  return gulp.src('src/index.html')
    .pipe(dom(function () {
      let regex = /\.(gif|jpe?g|tiff?|png|bmp)$/i;
      let new_src;
      return this.querySelectorAll('img').forEach(img => {
        new_src = img.getAttribute('src').replace(regex, '.webp');
        img.setAttribute('src', new_src)
      });
    }))
    .pipe(gulp.dest('result/land'));
});
gulp.task('start', gulp.series('clean-result', 'minify-img', 'convert-to-webp', 'change-html'))
// export default () => (
//   console.log("Use 'Gulp start'")
// )