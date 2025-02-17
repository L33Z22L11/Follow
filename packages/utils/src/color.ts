import uniqolor from "uniqolor"

const getRandomColor = (lightness: [number, number], saturation: [number, number], hue: number) => {
  const satAccent = Math.floor(Math.random() * (saturation[1] - saturation[0] + 1) + saturation[0])
  const lightAccent = Math.floor(Math.random() * (lightness[1] - lightness[0] + 1) + lightness[0])

  // Generate the background color by increasing the lightness and decreasing the saturation
  const satBackground = satAccent > 30 ? satAccent - 30 : 0
  const lightBackground = lightAccent < 80 ? lightAccent + 20 : 100

  return {
    accent: `hsl(${hue} ${satAccent}% ${lightAccent}%)`,
    background: `hsl(${hue} ${satBackground}% ${lightBackground}%)`,
  }
}

export function stringToHue(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.codePointAt(i)! + ((hash << 5) - hash)
  }
  const hue = hash % 360
  return hue < 0 ? hue + 360 : hue
}

const memoMap = {} as Record<string, ReturnType<typeof getColorScheme>>
export const getColorScheme = (hue?: number, memo?: boolean) => {
  const baseHue = hue ?? Math.floor(Math.random() * 361)
  if (baseHue && memo) {
    if (memoMap[baseHue]) {
      return memoMap[baseHue]
    }
    const result = getColorScheme(baseHue)
    memoMap[baseHue] = result
    return result
  }
  const complementaryHue = (baseHue + 180) % 360

  // For light theme, we limit the lightness between 40 and 70 to avoid too bright colors for accent
  const lightColors = getRandomColor([40, 70], [70, 90], baseHue)

  // For dark theme, we limit the lightness between 20 and 50 to avoid too dark colors for accent
  const darkColors = getRandomColor([20, 50], [70, 90], complementaryHue)

  const result = {
    light: {
      accent: lightColors.accent,
      background: lightColors.background,
    },
    dark: {
      accent: darkColors.accent,
      background: darkColors.background,
    },
  }
  return result
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const hexToRgb = (hex: string) => {
  const bigint = Number.parseInt(hex.slice(1), 16)
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255]
}

export const rgbToHex = (r: number, g: number, b: number) => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

const adjustColorTowardsTarget = (color: string, targetColor: string, factor: number) => {
  const [r1, g1, b1] = hexToRgb(color)
  const [r2, g2, b2] = hexToRgb(targetColor)

  const r = Math.round(lerp(r1, r2, factor))
  const g = Math.round(lerp(g1, g2, factor))
  const b = Math.round(lerp(b1, b2, factor))

  return rgbToHex(r, g, b)
}

export const getBackgroundGradient = (seed?: Nullable<string>) => {
  const nextSeed = seed ?? Math.random().toString(36).slice(7)

  const bgAccent = uniqolor(nextSeed, {
    saturation: [30, 35],
    lightness: [60, 70],
  }).color

  const bgAccentLight = uniqolor(nextSeed, {
    saturation: [30, 35],
    lightness: [80, 90],
  }).color

  const bgAccentUltraLight = uniqolor(nextSeed, {
    saturation: [30, 35],
    lightness: [95, 96],
  }).color

  const targetColor = "#FF5C02"
  const factor = 0.3 // Adjust this value to control how close the color gets to the target color

  const adjustedAccent = adjustColorTowardsTarget(bgAccent, targetColor, factor)
  const adjustedAccentLight = adjustColorTowardsTarget(bgAccentLight, targetColor, factor)
  const adjustedAccentUltraLight = adjustColorTowardsTarget(bgAccentUltraLight, targetColor, factor)

  return [
    adjustedAccent,
    adjustedAccentLight,
    adjustedAccentUltraLight,
    bgAccent,
    bgAccentLight,
    bgAccentUltraLight,
  ]
}
