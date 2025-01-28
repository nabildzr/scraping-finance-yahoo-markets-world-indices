import playwright from "playwright";
import userAgents from "user-agents";
import fs from 'fs'

async function main() {
  const UA = new userAgents();
  const browser = await playwright.chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    userAgent: UA.toString(),
  });

  const page = await context.newPage();
  await page.goto("https://finance.yahoo.com/markets/world-indices/", {
    timeout: 60000,
  });

  const rows = await page.locator("tbody tr td").allInnerTexts();

  const rowsSanitized = rows.filter((row) => row.trim() !== "");

  const data = [];

  for (let i = 0; i < rowsSanitized.length; i += 7) {
    const obj = {
      Symbol:
        rowsSanitized[i].split("\n").length > 1
          ? rowsSanitized[i].split("\n")[1]
          : rowsSanitized[i],
      Name: rowsSanitized[i + 1],
      Price: rowsSanitized[i + 2],
      Change: rowsSanitized[i + 3],
      ChangePercent: rowsSanitized[i + 4],
      Volume: rowsSanitized[i + 5],
      DayRange: rowsSanitized[i + 6],
    };

    data.push(obj);
  }

  fs.writeFileSync("data.json", JSON.stringify(data))

  console.log(data);

  await browser.close();
}



main();
