const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function () {
  let url = 'https://quod.lib.umich.edu/cgi/c/collsize/colllist?sponsor=DCC';
  let data = await EleventyFetch(url, {
    duration: '1d',
    type: 'json',
  });
  data.items.sort((a, b) => {
    const valueA = a.label.toUpperCase();
    const valueB = b.label.toUpperCase();
    if ( valueA < valueB ) { return -1 ; }
    if ( valueA > valueB ) { return 1; }
    return 0;
  });
  return data;
}