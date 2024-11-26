// JavaScript implementation for "War O Meter"
// This version will gather RSS feeds and update a visual gauge accordingly

const feedUrls = [
    "http://feeds.bbci.co.uk/news/rss.xml",
    "https://rss.cnn.com/rss/edition.rss",
    "https://www.aljazeera.com/xml/rss/all.xml",
    "https://www.france24.com/fr/actualites/rss",
    "https://www.reuters.com/rssFeed/worldNews",
    "https://apnews.com/apf-topnews",
    "https://www.afp.com/en/rss",
    "https://www.xinhuanet.com/english/rss",
    "https://tass.com/rss/v2.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    "https://www.theguardian.com/world/rss",
    "https://www.nhk.or.jp/rss/news/cat0.xml",
    "https://www.ansa.it/sito/ansait_rss.xml",
    "https://www.abc.net.au/news/feed/51120/rss.xml",
    "https://www.ctvnews.ca/rss/world/",
    "https://www.elpais.com/rss/feed.html?feed=elpais/internacional",
    "https://www.globo.com/rss/",
    "https://www.sbs.com.au/news/feed",
    "https://www.dailymaverick.co.za",
    "https://www.hindustantimes.com/rss/world-news/rssfeed.xml"
];

const warKeywords = [
    "war", "guerre", "Война", "guerra", "武争", "krieg",
    "حرب", "värn", "bellum", "vojna", "warszawa", "oorlog"
];

const additionalKeywords = [
    "conflit", "tensions", "attentat", "bombe", "terroriste", "terrorisme", "morts",
    "conflitto", "tensiones", "attacco", "bomba", "terrorista", "terrorismo", "morti",
    "konflikt", "napětí", "útok", "bomba", "terorista", "terorismus", "mrtví",
    "конфликт", "напряжение", "теракт", "бомба", "террорист", "терроризм", "смерти",
    "冲突", "紧张", "袭击", "炸弹", "恐怖分子", "恐怖主义", "死亡",
    "conflito", "tensões", "atentado", "bomba", "terrorista", "terrorismo", "mortos"
];

const gaugeElement = document.getElementById("gauge");
const keywordsElement = document.getElementById("keywords");
const percentageElement = document.getElementById("percentage");

async function collectNewsData() {
    let wordCount = 0;
    let additionalWordCount = 0;
    let totalEntries = 0;
    let keywordsFound = [];

    for (let feedUrl of feedUrls) {
        try {
            const response = await fetch(feedUrl);
            const responseText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(responseText, "text/xml");
            const items = xmlDoc.getElementsByTagName("item");

            for (let item of items) {
                const title = item.getElementsByTagName("title")[0]?.textContent.toLowerCase() || "";
                const description = item.getElementsByTagName("description")[0]?.textContent.toLowerCase() || "";
                const content = title + " " + description;
                const link = item.getElementsByTagName("link")[0]?.textContent || "unknown link";
                
                // Check for war keywords
                for (let word of warKeywords) {
                    let matches = content.match(new RegExp(word, 'g'));
                    if (matches) {
                        wordCount += matches.length;
                        keywordsFound.push(`${word} (${link})`);
                    }
                }

                // Check for additional keywords (reduced impact)
                for (let word of additionalKeywords) {
                    let matches = content.match(new RegExp(word, 'g'));
                    if (matches) {
                        additionalWordCount += matches.length;
                        keywordsFound.push(`${word} (${link})`);
                    }
                }

                totalEntries++;
            }
        } catch (e) {
            console.error(`Error fetching feed from ${feedUrl}`, e);
        }
    }

    let totalWordCount = wordCount + (additionalWordCount * 0.5);
    return { totalWordCount, totalEntries, keywordsFound };
}

function calculateIndex(wordCount, totalEntries) {
    if (totalEntries === 0) return 0;
    const factor = 100;
    let index = (wordCount / totalEntries) * factor;
    return Math.min(100, Math.max(0, index));
}

async function updateMeter() {
    const { totalWordCount, totalEntries, keywordsFound } = await collectNewsData();
    const index = calculateIndex(totalWordCount, totalEntries);

    // Update gauge
    setGaugeValue(index);
    updateKeywordsList(keywordsFound);
    flashUpdate();
}

function setGaugeValue(value) {
    const angle = (value / 100) * 220;
    gaugeElement.style.transform = `rotate(${angle - 110}deg)`;
    percentageElement.innerText = `${Math.round(value)}%`;
}

function updateKeywordsList(keywords) {
    keywordsElement.innerHTML = keywords.map(k => `<li>${k}</li>`).join('');
}

function flashUpdate() {
    gaugeElement.classList.add('flash');
    setTimeout(() => {
        gaugeElement.classList.remove('flash');
    }, 100);
}

setInterval(updateMeter, 10000);
