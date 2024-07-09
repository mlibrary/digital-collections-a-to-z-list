const pagefind = await import("/pagefind/pagefind.js");

const appliedFilters = {};

let styles;
for (let i = 0; i < document.styleSheets.length; i++) {
  let ownerNode = document.styleSheets[i].ownerNode;
  if (ownerNode.id == 'applied-filters') {
    styles = document.styleSheets[i];
  }
}

const updateAppliedFilterStyles = function(collids) {
  if ( collids === undefined ) {
    styles.cssRules[0].selectorText = `li[data-collid]`;
  } else {
    let isCondition = [];
    collids.forEach((collid) => {
      isCondition.push(`[data-collid="${collid}"]`);
    })
    const newSelector = `li:is(${isCondition.join(',')})`
    styles.cssRules[0].selectorText = newSelector;
  }
}

const doSearch = async function(value) {
  if ( ! value ) { value = null; }
  const search = await pagefind.search(value, {
    filters: appliedFilters,
  })
  const results = await Promise.all(search.results.map(r => r.data()));
  updateAppliedFilterStyles(results.map(r => r.meta.collid));
  // updateFilterOptions(search.filters);
  // updateCurrentFilterOptions(search.filters);
  // console.log("-- doSearch fin", value, appliedFilters, results.map(r => r.meta.collid));
}

pagefind.init();

// fetch all the filters to prime pagefind
const filters = await pagefind.filters();

const findCollectionEl = document.querySelector('#find-collection');
findCollectionEl.addEventListener('keyup', (event) => {
  let value = event.target.value || null;
  doSearch(value);
})

// TODO - setup handlers for filter de/selection and weep
// for jQuery delegation
