/*********************************************************
 * ********************************************************
 *
 * gulp by Eremenko Igor 11.62019 @MerelyiGor
 * Обьявление переменных
 * пути к файлам
 * путь к родителю директорий
 *
 * ********************************************************
 * ********************************************************/
const localhost_domain = 'medicine.loc/build/';                         // локальный домен для обновления стр "browserSync"
const root_dir = 'root_dir' + '/';                                      // создайте и поместите все в папку root_dir для удобства и запускайте из корня
const root_sass = root_dir + 'app/sass/**/*.sass';                      // путь ко всем sass файлам
const root_html_all = root_dir + 'app/html/*.html';                     // путь ко всем html файлам страниц
const root_js = root_dir + 'app/js/**/*.js';                            // путь ко всем js файлам
const root_libs = root_dir + 'app/libs/**/*';                           // путь ко всем файлам библиотек

const build_root_css = root_dir + 'build/style';                        // путь в папку компиляции main.css
const build_root_html = root_dir + 'build';                             // путь в папку компиляции html
const build_root_js = root_dir + 'build/js';                            // путь в папку компиляции html
const build_root_libs = root_dir + 'build/libs';                        // путь в папку компиляции html

/***************----------------------------------------------------------------**************
 * Настройки выгрузки на сервер
 * FTP UPLOAD COMAND "$ gulp deploy"
 ***************----------------------------------------------------------------**************/
const ftp_host = 'host';
const ftp_user = 'user';
const ftp_password = 'password';
const local_directory_src = root_dir + 'to/local/directory/file/**';
const FTP_directory_deploy = root_dir + '/sub/domain.com/to/server/directory';
/***************----------------------------------------------------------------**************/

// Подключаем Gulp и все необходимые библиотеки
const gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    cleanCSS = require('gulp-clean-css'),
    autoprefixer = require('gulp-autoprefixer'),
    bourbon = require('node-bourbon'),
    ftp = require('vinyl-ftp'),
    del = require('del');


// Обновление страниц сайта на локальном сервере
gulp.task('browser-sync', function () {
    browserSync({
        proxy: localhost_domain,
        notify: false
    });
});

// Компиляция main.css
gulp.task('sass', function () {
    return gulp.src(root_sass)
        .pipe(sass({
            includePaths: bourbon.includePaths
        }).on('error', sass.logError))
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))          // Создаем префиксы
        .pipe(cleanCSS())
        .pipe(gulp.dest(build_root_css))
        .pipe(browserSync.reload({stream: true}))
});

// удаление файлов по требованию - (кеш и тд)
gulp.task('clean', function () {
    return del(['root_dir/system/storage/cache/*', '!root_dir/system/storage/cache']);
});

// Сборка HTML
gulp.task('html:build', function () {
    gulp.src(root_html_all)                                                                             //Выберем файлы html
        .pipe(gulp.dest(build_root_html))                                                               //Выплюнем их в папку build
});

// Сборка js
gulp.task('js:build', function () {
    gulp.src(root_js)                                                                             //Выберем файлы html
        .pipe(gulp.dest(build_root_js))                                                               //Выплюнем их в папку build
});

// перемещение библиотек
gulp.task('libs:build', function () {
    gulp.src(root_libs)                                                                             //Выберем файлы html
        .pipe(gulp.dest(build_root_libs))                                                               //Выплюнем их в папку build
});

// Наблюдение за файлами
gulp.task('watch', ['sass', 'browser-sync'], function () {                                              // убрал browser-sync выше в коментарии
    gulp.watch(root_sass, ['sass']);
    gulp.watch(root_html_all, ['html:build']);
    gulp.watch(root_js, ['js:build']);
    gulp.watch(root_libs, ['libs:build']);
});

// Выгрузка изменений на хостинг
gulp.task('deploy', function () {
    const conn = ftp.create({
        host: ftp_host,
        user: ftp_user,
        password: ftp_password,
        parallel: 10,
        log: gutil.log
    });
    const globs = [local_directory_src];
    return gulp.src(globs, {buffer: false})
        .pipe(conn.dest(FTP_directory_deploy));
});

gulp.task('default', ['watch']);
