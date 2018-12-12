const el = document.querySelector('.below-fold')
if (el) {
  el.innerHTML = 'loaded'
}

document.addEventListener('DOMContentLoaded', () => {
  const lazyImages = document.querySelectorAll('img.lazy')

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return

        const image = entry.target as HTMLImageElement
        image.src = image.dataset.src as string
        image.srcset = image.dataset.srcset || ''

        image.onload = () => {
          image.classList.remove('lazy')
          image.onload = null
        }
        observer.unobserve(image)
      })
    })

    lazyImages.forEach(image => observer.observe(image))
  }
})
