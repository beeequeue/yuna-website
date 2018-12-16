const pick = <K extends Array<keyof T>, T extends {}>(keys: K, obj: T) => {
  const willReturn = {} as any
  let counter = 0

  while (counter < keys.length) {
    if (keys[counter] in obj) {
      willReturn[keys[counter]] = obj[keys[counter]]
    }
    counter++
  }

  return willReturn as Pick<T, K[number]>
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
    if (hash === '') return

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

const initPlayer = () => {
  const player = document.querySelector('video') as HTMLVideoElement

  player.onclick = e => {
    const target = e.currentTarget as HTMLVideoElement

    target[target.paused ? 'play' : 'pause']()
  }
}

const getExtension = () => {
  const { platform } = navigator

  if (platform.match(/[wW]in/)) return '.exe'
  if (platform.match(/[mM]ac/)) return '.dmg'
}

type ThinRelease = Pick<GitHubRelease, 'assets' | 'name' | 'tag_name'>
const MINUTE = 1000 * 60
const getRelease = async () => {
  let latestRelease: GitHubRelease | ThinRelease | null = null
  const cachedRelease = localStorage.getItem('release')
  const updatedAt = Number(localStorage.getItem('updatedAt') || 0)

  if (cachedRelease) {
    latestRelease = JSON.parse(cachedRelease) as ThinRelease

    updateReleaseButton(latestRelease)
  }

  const isStale = updatedAt + MINUTE < Date.now()
  if (!cachedRelease || isStale) {
    const response = await fetch(
      'https://api.github.com/repos/BeeeQueue/yuna/releases?page=1',
    )
    latestRelease = (await response.json())[0] as GitHubRelease

    updateReleaseButton(latestRelease)

    localStorage.setItem(
      'release',
      JSON.stringify(pick(['assets', 'name', 'tag_name'], latestRelease)),
    )
    localStorage.setItem('updatedAt', Date.now().toString())
  }
}

const updateReleaseButton = (latestRelease: ThinRelease) => {
  const ext = getExtension()
  const downloadButton = document.getElementById(
    'download',
  ) as HTMLButtonElement
  ;(downloadButton.lastChild as HTMLParagraphElement).innerHTML =
    latestRelease.tag_name

  const correctAsset = latestRelease.assets.find(release =>
    release.name.endsWith(ext || 'shabalabadoo'),
  )
  if (!correctAsset) return

  const url = correctAsset.browser_download_url

  downloadButton.onclick = () => {
    ga.getAll()[0].send('send', 'event', 'action', 'download')

    location.href = url
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadLazyImages()
  initLogo()
  initHeaderLinks()
  initPlayer()

  getRelease()
})
