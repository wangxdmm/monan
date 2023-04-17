/* eslint-disable array-callback-return */
const scriptRel = 'modulepreload'
const seen = {}

const assetsURL = function (dep) {
  return `/${dep}`
}

export function preload(baseModule, deps, importerUrl) {
  if (!deps || deps.length === 0)
    return baseModule()

  const links = document.getElementsByTagName('link')
  return Promise.all(deps.map((dep) => {
    dep = assetsURL(dep)
    if (dep in seen)
      return
    seen[dep] = true
    const isCss = dep.endsWith('.css')
    const cssSelector = isCss ? '[rel="stylesheet"]' : ''
    const isBaseRelative = !!importerUrl
    if (isBaseRelative) {
      for (let i = links.length - 1; i >= 0; i--) {
        const link2 = links[i]
        if (link2.href === dep && (!isCss || link2.rel === 'stylesheet'))
          return
      }
    }
    else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
      return
    }
    const link = document.createElement('link')
    link.rel = isCss ? 'stylesheet' : scriptRel
    if (!isCss) {
      link.as = 'script'
      link.crossOrigin = ''
    }
    link.href = dep
    document.head.appendChild(link)
    if (isCss) {
      return new Promise((resolve, reject) => {
        link.addEventListener('load', resolve)
        link.addEventListener('error', () => reject(new Error(`Unable to preload CSS for ${dep}`)))
      })
    }
  })).then(() => baseModule())
}