export const PRODUCTS = {
  onion: 'Yellow Onions',
  coconut: 'Fresh Coconuts',
  waterMelon: 'Whole Watermelon',
  orange: 'Navel Oranges',
  cauliflower: 'Cauliflower Fresh',
  tshirt: 'green night',
  irobot: 'irobot',
  blackDecker: 'black decker',
}

export function generateAddtoCartSelector(href) {
  return `a[href='${href}'] > article > button`
}

export function generateAddtoCartCardSelector(href) {
  return `a[href='${href}']`
}
