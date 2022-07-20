export const PRODUCTS = {
  onion: 'Yellow Onions',
  coconut: 'Fresh Coconuts',
  waterMelon: 'Whole Watermelon',
  orange: 'Navel Oranges',
  cauliflower: 'Cauliflower Fresh',
  tshirt: 'green night',
  irobot: 'irobot',
  blackDecker: 'black decker',
  greenConventional: 'green conventional',
}

export function generateAddtoCartSelector(href) {
  return `a[href='${href}'] > article > button`
}

export function generateAddtoCartCardSelector(href) {
  return `a[href='${href}']`
}

export const PRODUCTS_LINK_MAPPING = {
  orange: {
    name: 'Navel Oranges Grown Large Fresh Fruit',
    link: 'a[href*="/navel-oranges-grown-large-fresh-fruit/p"]',
  },
  coconut: {
    name: 'Fresh Coconuts',
    link: 'a[href="/fresh-coconuts/p"]',
  },
}
