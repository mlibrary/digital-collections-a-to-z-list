const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function () {
  let url = 'https://quod.lib.umich.edu/cgi/c/collsize/colllist?sponsor=DCC';
  let data = await EleventyFetch(url, {
    duration: '1d',
    type: 'json',
  });
  data.items.sort((a, b) => 
    a.label.localeCompare(
      b.label, 
      'en-US',
      {numeric: true, ignorePunctuation: true}
    )
  );
  return data;
}