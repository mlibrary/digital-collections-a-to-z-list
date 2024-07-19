const eleventySass = require("eleventy-sass");
const indexer = require('./lib/indexer');

module.exports = function(eleventyConfig) {

  // Add the plugins used
  eleventyConfig.addPlugin(eleventySass, {
    compileOptions: {
      permalink: function(contents, inputPath) {
        return (data) => data.page.filePathStem.replace(/^\/scss\//, "/css/") + ".css";
      }
    },
    sass: {
      style: "expanded",
      sourceMap: false
    },
  });

  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // The addWatchTarget config method allows you to manually add a file for Eleventy to watch.
  eleventyConfig.addWatchTarget("./src/sass");
  eleventyConfig.addWatchTarget("./src/js");

  // The Pass Through feature tells Eleventy to copy things to our output folder
  // Eleventy-sass passes through our compiled CSS to the public directory. 
  eleventyConfig.addPassthroughCopy("./src/img");
  eleventyConfig.addPassthroughCopy("./src/js");

  eleventyConfig.on('eleventy.after', indexer);

  return {
    passthroughFileCopy: true,
    dir: {
      input: "src",
      output: "public",
      layouts: "_includes/layouts",
    },
  };
  
};