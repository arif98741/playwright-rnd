const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

async function scrapeGoogleMaps(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // Wait for the map to load
    await page.waitForSelector('.section-result');

    const places = await page.evaluate(() => {
        const results = [];
        const placesElements = document.querySelectorAll('.section-result');

        placesElements.forEach(placeElement => {
            const name = placeElement.querySelector('.section-result-title span').textContent.trim();
            const address = placeElement.querySelector('.section-result-location').textContent.trim();
            const review = placeElement.querySelector('.section-result-rating').getAttribute('aria-label');
            const directionUrl = placeElement.querySelector('.section-result-action-icon-img').getAttribute('src');
            const photoUrl = placeElement.querySelector('.section-result-thumbnail').getAttribute('style').match(/url\("(.*)"\)/)[1];

            results.push({ name, address, review, directionUrl, photoUrl });
        });

        return results;
    });

    await browser.close();
    return places;
}

async function saveToCSV(data, filename) {
    const csvWriter = createCsvWriter({
        path: filename,
        header: [
            { id: 'name', title: 'Name' },
            { id: 'address', title: 'Address' },
            { id: 'review', title: 'Review' },
            { id: 'directionUrl', title: 'Direction URL' },
            { id: 'photoUrl', title: 'Photo URL' }
        ]
    });

    await csvWriter.writeRecords(data);
    console.log(`Data saved to ${filename}`);
}

const googleMapsURL = 'https://www.google.com/maps/search/restaurants';

scrapeGoogleMaps(googleMapsURL)
    .then(data => saveToCSV(data, 'google_maps_data.csv'))
    .catch(error => console.error('Error scraping data:', error));
