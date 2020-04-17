const fetch = require("node-fetch");
const { format, parseISO } = require("date-fns");

function customReverseSort(b, a) {
  if (a[1] > b[1]) return 1;
  if (a[1] < b[1]) return -1;
  return 0;
}

function addToMap(map, item) {
  if (map.has(item)) {
    map.set(item, map.get(item) + 1);
  } else {
    map.set(item, 1);
  }
  return map;
}

function sortSliceMap(map, n) {
  return new Map([...map.entries()].sort(customReverseSort).slice(0, n));
}

async function getReport() {
  const result = await fetch(
    `https://dev.to/api/articles?top=1000&per_page=1000`
  );

  const articles = await result.json();

  const formattedArticles = articles.map(({ published_at, tag_list }) => {
    return {
      published_at,
      tag_list,
    };
  });

  const topTags = formattedArticles.reduce((acc, { tag_list }) => {
    const tags = tag_list;
    for (tag of tags) {
      acc = addToMap(acc, tag);
    }
    return acc;
  }, new Map());

  const topDays = formattedArticles.reduce((acc, { published_at }) => {
    const day = format(parseISO(published_at), "eeee");
    acc = addToMap(acc, day);
    return acc;
  }, new Map());

  const topHour = formattedArticles.reduce((acc, { published_at }) => {
    const hour = format(parseISO(published_at), "H");
    acc = addToMap(acc, hour);
    return acc;
  }, new Map());

  const topFiveTags = sortSliceMap(topTags, 5);
  const topThreeDays = sortSliceMap(topDays, 3);
  const topFiveHours = sortSliceMap(topHour, 5);

  console.log("Top Five Tags");
  console.log(topFiveTags);

  console.log("\nTop Three Days");
  console.log(topThreeDays);

  console.log("\nTop Five Hours");
  console.log(topFiveHours);
}

getReport();
