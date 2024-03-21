import { defineConfig } from "vite"
import Pug from "vite-plugin-pug-transformer"

export default defineConfig(({ command }) => {
  const isProd = command === "build"

  return {
    plugins: [Pug({ pugLocals: { isProd } })],
  }
})
