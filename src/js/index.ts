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

const getExtension = () => {
  const { platform } = navigator

  if (platform.match(/[wW]in/)) return '.exe'
  if (platform.match(/[mM]ac/)) return '.dmg'
}

const HOUR = 1000 * 60 * 60
const getRelease = async () => {
  let latestRelease: any = localStorage.getItem('release')
  const updatedAt = Number(localStorage.getItem('updatedAt') || 0)

  const cacheNotStale = updatedAt + HOUR >= Date.now()
  if (latestRelease != null && cacheNotStale) {
    latestRelease = JSON.parse(latestRelease)
  } else {
    const response = await fetch(
      'https://api.github.com/repos/BeeeQueue/yuna/releases?page=1',
    )
    latestRelease = (await response.json())[0]

    localStorage.setItem('release', JSON.stringify(latestRelease))
    localStorage.setItem('updatedAt', Date.now().toString())
  }

  const ext = getExtension()
  const downloadButton = document.getElementById(
    'download',
  ) as HTMLButtonElement
  const url = latestRelease.assets.find((release: any) =>
    release.name.endsWith(ext),
  ).browser_download_url

  downloadButton.onclick = () => (location.href = url)
}

document.addEventListener('DOMContentLoaded', () => {
  loadLazyImages()
  initLogo()
  initHeaderLinks()

  getRelease()
})
