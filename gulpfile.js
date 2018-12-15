const { src, dest, watch, series, parallel } = require('gulp')
const ifG = require('gulp-if')
const Autoprefixer = require('gulp-autoprefixer')
const CleanCSS = require('gulp-clean-css')
const Sass = require('gulp-sass')
const Pug = require('gulp-pug')
const TypeScript = require('gulp-typescript')
const Babel = require('gulp-babel')
const Uglify = require('gulp-uglify')
const SourceMaps = require('gulp-sourcemaps')
const Delete = require('delete')
const Pages = require('gh-pages')

const browserList = ['last 5 versions', 'ie >= 9', 'safari >= 7']
const destination = 'dist'

const ignoreInitial = false
const isProd = process.env.NODE_ENV === 'production'
const ifProd = m => ifG(isProd, m)

const TSProject = TypeScript.createProject('tsconfig.json')

Sass.compiler = require('node-sass')

// Pug -> HTML
const htmlPath = 'src/**/*.pug'
const html = () =>
  src(htmlPath)
    .pipe(Pug({ locals: { isProd } }))
    .pipe(dest(destination))

// SCSS -> CSS
const cssPath = 'src/**/*.scss'
const css = () =>
  src(cssPath)
    .pipe(SourceMaps.init())
    .pipe(Sass().on('error', Sass.logError))
    .pipe(Autoprefixer({ browsers: browserList }))
    .pipe(ifProd(CleanCSS()))
    .pipe(SourceMaps.write('.'))
    .pipe(dest(destination))

const jsPath = 'src/**/*.ts'
const js = () => {
  const tsResult = src(jsPath)
    .pipe(SourceMaps.init())
    .pipe(TSProject())

  return (
    tsResult.js
      // .pipe(Babel())
      .pipe(ifProd(Uglify({ toplevel: true })))
      .pipe(SourceMaps.write('.'))
      .pipe(dest(destination))
  )
}

// Copy files
const restPaths = ['src/**/*.{png,jpg,svg,ico,mp4}', 'src/CNAME']
const rest = () => src(restPaths).pipe(dest(destination))

// Delete files
const clean = () => Delete.promise('dist/*')

exports.clean = clean

exports.watch = cb => {
  clean()
  watch(htmlPath, { ignoreInitial }, html)
  watch(cssPath, { ignoreInitial }, css)
  watch(jsPath, { ignoreInitial }, js)
  watch(restPaths, { ignoreInitial }, rest)
  cb()
}

exports.publish = cb => {
  Pages.publish('dist', cb)
}

exports.default = series(clean, parallel(html, css, js, rest))
