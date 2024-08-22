const EleventyFetch = require("@11ty/eleventy-fetch");
const fs = require('node:fs');
const process = require('node:process');

module.exports = async function () {
  let jsonFilename = process.env.COLLLIST_DATA;
  let url = 'https://quod.lib.umich.edu/cgi/c/collsize/colllist?sponsor=DCC';
  let data;
  if ( jsonFilename && fs.existsSync(jsonFilename) ) {
    console.log("-- colllist: using local file");
    data = require(jsonFilename); // JSONfs.readFileSync(jsonFilename);
  } else {
    data = await EleventyFetch(url, {
      duration: '1d',
      type: 'json',
    })
  }
  data.items.sort((a, b) => 
    a.label.localeCompare(
      b.label, 
      'en-US',
      {numeric: true, ignorePunctuation: true}
    )
  );
  return data;
}