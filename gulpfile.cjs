const { src, dest, watch, series, parallel } = require("gulp")
const ifG = require("gulp-if")
const Autoprefixer = require("gulp-autoprefixer")
const CleanCSS = require("gulp-clean-css")
const Sass = require("gulp-sass")(require("sass"))
const Pug = require("gulp-pug")
const TypeScript = require("gulp-typescript")
const Uglify = require("gulp-uglify")
const serve = require("gulp-serve")
const Delete = require("delete")
const Pages = require("gh-pages")

const destination = "dist"

const ignoreInitial = false
const isProd = process.env.NODE_ENV === "production"
const ifProd = (m) => ifG(isProd, m)

const TSProject = TypeScript.createProject("tsconfig.json")

// Pug -> HTML
const htmlPath = "src/*.pug"
const html = () =>
  src(htmlPath)
    .pipe(Pug({ locals: { isProd } }))
    .pipe(dest(destination))

// SCSS -> CSS
const cssPath = "src/**/*.scss"
const css = () =>
  src(cssPath)
    .pipe(Sass().on("error", Sass.logError))
    .pipe(Autoprefixer())
    .pipe(ifProd(CleanCSS()))
    .pipe(dest(destination))

const jsPath = "src/**/*.ts"
const js = () => {
  const tsResult = src(jsPath).pipe(TSProject())

  return tsResult.js
    .pipe(ifProd(Uglify({ toplevel: true })))
    .pipe(dest(destination))
}

// Copy files
const restPaths = ["src/**/*.{png,jpg,svg,ico,mp4}", "src/CNAME"]
const rest = () => src(restPaths).pipe(dest(destination))

// Delete files
const clean = () => Delete.promise("dist/*")

exports.clean = clean

const watchFiles = (cb) => {
  clean()
  watch(htmlPath, { ignoreInitial }, html)
  watch(cssPath, { ignoreInitial }, css)
  watch(jsPath, { ignoreInitial }, js)
  watch(restPaths, { ignoreInitial }, rest)
  cb()
}

exports.watch = series(watchFiles, serve("dist"))

exports.publish = (cb) => {
  Pages.publish("dist", cb)
}

exports.default = series(clean, parallel(html, css, js, rest))
