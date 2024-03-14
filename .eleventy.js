const pluginNavigation = require("@11ty/eleventy-navigation");
const eleventySass = require("eleventy-sass");

module.exports = function(eleventyConfig) {

  // Add the plugins used
  eleventyConfig.addPlugin(pluginNavigation);
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

  // The Pass Through feature tells Eleventy to copy things to our output folder
  // Eleventy-sass passes through our compiled CSS to the public directory. 
  eleventyConfig.addPassthroughCopy("./src/img");

  return {
    passthroughFileCopy: true,
    dir: {
      input: "src",
      output: "public",
      layouts: "_includes/layouts",
    },
  };
  
};