import gulp from 'gulp';
import imagemin, {
  gifsicle,
  mozjpeg,
  optipng,
  svgo
} from 'gulp-imagemin';
import webp from 'gulp-webp';
import sharp from 'sharp';
import { Transform } from 'stream';
import {
  deleteAsync
} from 'del';
import dom from 'gulp-dom';
import replace from 'gulp-replace';
import rename from 'gulp-rename';
// const imageminGifsicle = require('imagemin-gifsicle');

// Функция для конвертации AVIF в WebP с помощью Sharp
function avifToWebp() {
  return new Transform({
    objectMode: true,
    transform(file, encoding, callback) {
      if (file.isNull()) {
        return callback(null, file);
      }
      
      if (file.extname.toLowerCase() === '.avif') {
        sharp(file.contents)
          .webp({ quality: 75 })
          .toBuffer()
          .then(buffer => {
            file.contents = buffer;
            file.extname = '.webp';
            callback(null, file);
          })
          .catch(err => callback(err));
      } else {
        callback(null, file);
      }
    }
  });
}





gulp.task('clean-result', function () {
  return deleteAsync('result/**', {
    force: true
  });
});

// Переименование файлов с пробелами в src/assets -> заменяем пробелы на _
gulp.task('normalize-filenames', function () {
  return gulp.src('src/assets/*')
    .pipe(rename(function (path) {
      if (path.basename.includes(' ') || path.dirname.includes(' ')) {
        path.basename = path.basename.replace(/\s+/g, '_');
        path.dirname = path.dirname.replace(/\s+/g, '_');
      }
      if (path.extname.includes(' ')) {
        path.extname = path.extname.replace(/\s+/g, '_');
      }
    }))
    .pipe(gulp.dest('src/assets'));
});

gulp.task('minify-img', function () {
  return gulp.src(['src/assets/*', '!src/assets/*.avif'])
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
    ], {
      verbose: true
    }))
    .pipe(gulp.dest('result/images'))
});

gulp.task('avif-to-webp', function () {
  return gulp.src('src/assets/*.avif')
    .pipe(avifToWebp())
    .pipe(gulp.dest('result/land/assets'))
});

gulp.task('convert-to-webp', function () {
  return gulp.src('result/images/*')
    .pipe(webp())
    .pipe(gulp.dest('result/land/assets'))
});
gulp.task('change-html', function () {
  return gulp.src('src/index.html')
    .pipe(dom(function () {
      let regex = /\.(avif|gif|jpe?g|tiff?|png|bmp)$/i;
      let new_src;
      
      // Обрабатываем img теги
      this.querySelectorAll('img').forEach(img => {
        new_src = img.getAttribute('src').replace(regex, '.webp');
        img.setAttribute('src', new_src)
      });
      
      return this;
    }))
    .pipe(replace(/\.avif/g, '.webp'))  // Заменяем все .avif на .webp в тексте
    .pipe(gulp.dest('result/land'));
});
// start: сначала нормализуем имена файлов, затем основной пайплайн
gulp.task('start', gulp.series('normalize-filenames', 'clean-result', gulp.parallel('minify-img', 'avif-to-webp'), 'convert-to-webp', 'change-html'))

// Задача только для конвертации AVIF в WebP
gulp.task('avif-only', gulp.series('clean-result', 'avif-to-webp', 'change-html'))

// Задача для минификации всех изображений включая AVIF -> WebP
gulp.task('process-all', gulp.series('clean-result', 'minify-img', 'convert-to-webp', 'avif-to-webp'))
// export default () => (
//   console.log("Use 'Gulp start'")
// )