import { display } from '../tools/display'
import { ONE_MINUTE, ONE_SECOND } from '../tools/utils/timeUtils'
import { generateUUID } from '../tools/utils/stringUtils'

export interface CookieOptions {
  secure?: boolean
  crossSite?: boolean
  domain?: string
}

const cookieMap = new Map<string, string>()

export function setCookie(name: string, value: string, _expireDelay: number, _options?: CookieOptions) {
  cookieMap.set(name, value)
}

export function getCookie(name: string) {
  return cookieMap.get(name)
}

export function deleteCookie(name: string, _options?: CookieOptions) {
  cookieMap.delete(name)
}

export function areCookiesAuthorized(options: CookieOptions): boolean {
  if (document.cookie === undefined || document.cookie === null) {
    return false
  }
  try {
    // Use a unique cookie name to avoid issues when the SDK is initialized multiple times during
    // the test cookie lifetime
    const testCookieName = `dd_cookie_test_${generateUUID()}`
    const testCookieValue = 'test'
    setCookie(testCookieName, testCookieValue, ONE_MINUTE, options)
    const isCookieCorrectlySet = getCookie(testCookieName) === testCookieValue
    deleteCookie(testCookieName, options)
    return isCookieCorrectlySet
  } catch (error) {
    display.error(error)
    return false
  }
}

/**
 * No API to retrieve it, number of levels for subdomain and suffix are unknown
 * strategy: find the minimal domain on which cookies are allowed to be set
 * https://web.dev/same-site-same-origin/#site
 */
let getCurrentSiteCache: string | undefined
export function getCurrentSite() {
  if (getCurrentSiteCache === undefined) {
    // Use a unique cookie name to avoid issues when the SDK is initialized multiple times during
    // the test cookie lifetime
    const testCookieName = `dd_site_test_${generateUUID()}`
    const testCookieValue = 'test'

    const domainLevels = window.location.hostname.split('.')
    let candidateDomain = domainLevels.pop()!
    while (domainLevels.length && !getCookie(testCookieName)) {
      candidateDomain = `${domainLevels.pop()!}.${candidateDomain}`
      setCookie(testCookieName, testCookieValue, ONE_SECOND, { domain: candidateDomain })
    }
    deleteCookie(testCookieName, { domain: candidateDomain })
    getCurrentSiteCache = candidateDomain
  }
  return getCurrentSiteCache
}
