const el = document.querySelector('.below-fold')
if (el) {
  el.innerHTML = 'loaded'
}

const loadLazyImages = () => {
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
}

let initialLogoHeight = 0
const initLogo = () => {
  const logo = document.querySelector('.logo') as HTMLImageElement
  initialLogoHeight = logo.clientHeight

  const setSize = (size: number) => {
    logo.setAttribute('style', `height: ${size}px; width: ${size}px`)
  }

  document.body.onscroll = () => {
    const scroll = document.documentElement.scrollTop

    const newSize = Math.max(
      50,
      Math.min(initialLogoHeight, initialLogoHeight - scroll),
    )

    setSize(newSize)

    if (scroll >= 50) return logo.classList.add('small')
    if (scroll < 50) return logo.classList.remove('small')
  }
}

const initHeaderLinks = () => {
  const links = document.querySelectorAll<HTMLLinkElement>('header > a')

  links.forEach(link => {
    const { hash } = new URL(link.href)
    if (hash == null) return

    link.onclick = e => {
      e.preventDefault()

      // Slice to remove the #
      const destination = document.getElementById(hash.slice(1))

      if (!destination) return

      document.documentElement.scrollTo({
        top: destination.offsetTop - 50,
        behavior: 'smooth',
      })
    }
  })
}

document.addEventListener('DOMContentLoaded', () => {
  loadLazyImages()
  initLogo()
  initHeaderLinks()
})
