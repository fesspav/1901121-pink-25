import bemValidator from 'gulp-html-bem-validator';
import browser from 'browser-sync';
import gulp from 'gulp';
import lintspaces from 'gulp-lintspaces';
import posthtml from 'gulp-posthtml';
import rename from 'gulp-rename';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import stylelint from 'stylelint';
import postcssBemLinter from 'postcss-bem-linter';
import postcssReporter from 'postcss-reporter';

const { src, dest, watch, series, parallel } = gulp;
const checkLintspaces = () => lintspaces({
  editorconfig: '.editorconfig'
});
const editorconfigSources = [
  'source/njk/**/*.njk',
  '*.json',
  '*.js',
  'source/img/**/*.svg'
];

export const buildHTML = () => src('source/njk/pages/**/*.njk')
  .pipe(posthtml())
  .pipe(bemValidator())
  .pipe(rename({ extname: '.html' }))
  .pipe(dest('source'))
  .pipe(browser.stream());

export const testEditorconfig = () => src(editorconfigSources)
  .pipe(checkLintspaces())
  .pipe(lintspaces.reporter());

export const styles = () => src('source/less/style.less', { sourcemaps: true })
  .pipe(less())
  .pipe(postcss([
    autoprefixer()
  ]))
  .pipe(dest('source/css', { sourcemaps: '.' }))
  .pipe(browser.stream());

export const testStyles = () => src('source/less/**/*.less', { sourcemaps: true })
  .pipe(checkLintspaces())
  .pipe(lintspaces.reporter())
  .pipe(postcss([
    stylelint(),
    postcssBemLinter(),
    postcssReporter({
      clearAllMessages: true,
      throwError: false
    })
  ]));

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'source'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

const watcher = () => {
  watch(editorconfigSources, series(testEditorconfig, buildHTML));
  watch('source/less/**/*.less', series(testStyles, styles));
};

export const build = parallel(buildHTML, styles);
export const test = parallel(testEditorconfig, testStyles);

export default series(test, build, server, watcher);
