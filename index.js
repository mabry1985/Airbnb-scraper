const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const sample = {
  guests: 1,
  bedrooms: 1,
  beds: 1, 
  baths: 1,
  usdPerNight: 100,
}

let browser;

const mainUrl = "https://www.airbnb.com/s/Tokyo--Japan/homes?refinement_paths%5B%5D=%2Fhomes&current_tab_id=home_tab&selected_tab_id=home_tab&screen_size=large&search_type=filter_change&hide_dates_and_guests_filters=false&place_id=ChIJ51cu8IcbXWARiRtXIothAS4&map_toggle=false&room_types%5B%5D=Entire%20home%2Fapt"

async function scrapeHomesInIndexPage(url, browser) {
  let homes = [];
  try{
    page = await browser.newPage();
    await page.goto(url);
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    homes = $("[itemprop='url']")
      .map((i, el) => $(el).attr("content"))
      .get();
      
  } catch(err) {
      console.error(err);
  }

  for(var i = 0; i < homes.length; i++) {
    if (homes[i].includes('null')) {
       homes[i] = homes[i].replace('null', 'https://www.airbnb.com')  
    }
  
    if (homes[i].includes('undefined')) {
      homes[i] = homes[i].replace('undefined', 'https://www.airbnb.com')
    }

  }
  return homes
}

async function scrapeDescriptionPage(url, page) {
  try {
    await page.goto(url);
  } catch (err) {
     console.error(err);
  }
}

async function main() {
  browser = await puppeteer.launch({ headless: false });
  const descriptionPage = await browser.newPage();
  let homes = await scrapeHomesInIndexPage(mainUrl, browser);
  for(var i = 0; i < homes.length; i++) {
    await scrapeDescriptionPage(homes[i], descriptionPage);
  }
  console.log(homes)
}

main();