import puppeteer from "puppeteer-core"
import chromium from "@sparticuz/chromium"
import ColorThief from "colorthief"

export async function analyzeColorsFromUrl(url: string) {
  console.log("[color-analysis] Starting color analysis for:", url)
  let browser
  try {
    console.log("[color-analysis] Launching browser...")
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    })

    const page = await browser.newPage()
    await page.goto(url, { waitUntil: "networkidle2" })
    console.log("[color-analysis] Page loaded.")

    const buffer = await page.screenshot({ type: "png" })
    console.log("[color-analysis] Screenshot taken.")

    const colorThief = new ColorThief()
    const palette = await colorThief.getPalette(buffer as Buffer, 5)
    console.log("[color-analysis] Palette extracted:", palette)

    const [primary, secondary] = palette.map(
      (rgb: number[]) => `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`,
    )

    console.log("[color-analysis] Primary and secondary colors:", { primary, secondary })
    return { primaryColor: primary, secondaryColor: secondary }
  } catch (error) {
    console.error("[color-analysis] Error during color analysis:", error)
    return { primaryColor: "#ffffff", secondaryColor: "#000000" }
  } finally {
    if (browser) {
      console.log("[color-analysis] Closing browser.")
      await browser.close()
    }
  }
}
