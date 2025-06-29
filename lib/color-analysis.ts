import puppeteer from "puppeteer-core"
import chromium from "@sparticuz/chromium"
import ColorThief from "colorthief"

function rgbToHex(rgb: number[]): string {
  return "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("")
}

export async function analyzeColorsFromUrl(url: string): Promise<{
  primaryColor?: string
  secondaryColor?: string
}> {
  let browser: puppeteer.Browser | undefined
  try {
    // Use sparticuz/chromium which is optimized for serverless environments
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    })
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: "networkidle2" })
    const buffer = await page.screenshot({ type: "png" })
    const colorThief = new ColorThief()
    const palette = await colorThief.getPalette(buffer as Buffer, 5)
    const [primary, secondary] = palette
    return {
      primaryColor: primary ? rgbToHex(primary) : undefined,
      secondaryColor: secondary ? rgbToHex(secondary) : undefined,
    }
  } catch (error) {
    console.error("[color-analysis] Failed to extract colors:", error)
    return {}
  } finally {
    if (browser) await browser.close()
  }
}
