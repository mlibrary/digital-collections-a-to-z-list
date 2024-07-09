const path = require('node:path');
const process = require('node:process');

module.exports = async function(dir, results, runMode, outputMode) {
  const { createIndex, close } = await import('pagefind');
  const request = require(path.join('..', dir.inputDir, dir.dir.data, 'colllist.js'));
  const data = await request();
  
  const { index } = await createIndex();
  for(let item of data.items) {
    let content = [`<html lang="en"><head>`];
    content.push(`<meta data-pagefind-meta="collid:${item.collid}" />`)
    content.push(`<title>${item.label}</title>`);
    content.push(`</head><body>`);  
    content.push(`<h1>${item.label}</h1>`);
    content.push(`<p>${item.collid}</p>`);
    content.push(`<p>${item.description}</p>`);

    content.push(`<p>`);
    content.push(`<span data-pagefind-filter="Format">${item.class}</span>`);

    if ( item.hlbcategories) {
      item.hlbcategories.forEach((cat) => {
        // filters[cat[0]].push(cat[1]);
        content.push(`<span data-pagefind-filter="${cat[0]}">${cat.at(-1)}</span>`);
      })
    }
    content.push(`</p>`);

    content.push(`</body></html>`);

    await index.addHTMLFile({
      url: `#${item.collid}`,
      content: content.join("\n"),
    });
  }

  await index.writeFiles({
    outputPath: path.join(dir.dir.output, "pagefind")
  })
}