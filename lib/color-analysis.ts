import puppeteer from "puppeteer-core"
import chromium from "@sparticuz/chromium"
import ColorThief from "colorthief"

export async function analyzeColorsFromUrl(url: string) {
  let browser
  console.log("[color-analysis] Starting browser...")

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    })

    const page = await browser.newPage()
    await page.goto(url, { waitUntil: "networkidle2" })
    console.log(`[color-analysis] Navigated to ${url}`)

    const buffer = await page.screenshot({ type: "png" })
    console.log("[color-analysis] Screenshot taken")

    const colorThief = new ColorThief()
    const palette = await colorThief.getPalette(buffer as Buffer, 5)
    console.log("[color-analysis] Palette extracted:", palette)

    const [primary, secondary] = palette.map(
      (rgb: number[]) => `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`,
    )

    return { primaryColor: primary, secondaryColor: secondary }
  } catch (error) {
    console.error("[color-analysis] Error during color analysis:", error)
    // Fallback colors in case of an error
    return { primaryColor: "#000000", secondaryColor: "#ffffff" }
  } finally {
    if (browser) {
      await browser.close()
      console.log("[color-analysis] Browser closed.")
    }
  }
}
