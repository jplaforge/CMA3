import puppeteer from 'puppeteer'
import { getPalette } from 'colorthief'

function rgbToHex(rgb: number[]): string {
  return '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('')
}

export async function analyzeColorsFromUrl(url: string): Promise<{
  primaryColor?: string
  secondaryColor?: string
}> {
  let browser: puppeteer.Browser | undefined
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle2' })
    const buffer = await page.screenshot({ type: 'png' })
    const palette = await getPalette(buffer as Buffer, 5)
    const [primary, secondary] = palette
    return {
      primaryColor: primary ? rgbToHex(primary) : undefined,
      secondaryColor: secondary ? rgbToHex(secondary) : undefined,
    }
  } catch (error) {
    console.error('[color-analysis] Failed to extract colors:', error)
    return {}
  } finally {
    if (browser) await browser.close()
  }
}
