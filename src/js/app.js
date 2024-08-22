const pagefind = await import(`${document.documentElement.dataset.baseUrl}pagefind/pagefind.js`);
await pagefind.options({
  excerptLength: 1024,
});

const activeFilters = {};
const metaFilters = ['Format', 'Access'];
const ignoreFilters = ['class'];

let styles;
for (let i = 0; i < document.styleSheets.length; i++) {
  let ownerNode = document.styleSheets[i].ownerNode;
  if (ownerNode.id == 'active-filters') {
    styles = document.styleSheets[i];
  }
}

let filterPanelTemplate = document.querySelector('#filter-panel-template');
let filterItemTemplate = document.querySelector('#filter-item-template');
let sidePanelEl = document.querySelector('.side-panel');
let availableFiltersEl = document.querySelector('#available-filters');
let currentFilterPanelEl = document.querySelector('#current-filters');
const findCollectionEl = document.querySelector('#find-collection');
const resultsHeadingEl = document.querySelector('.results-heading');

sidePanelEl.addEventListener('change', (event) => {
  if ( event.target.type != 'checkbox' ) { return ; }
  let input = event.target;
  let value = input.value;
  let key = input.dataset.key;
  if ( ! activeFilters[key] ) { activeFilters[key] = []; }
  if ( input.dataset.action == 'remove' ) {
    activeFilters[key] = activeFilters[key].filter(v => v != value);
    if ( activeFilters[key].length == 0 ) {
      delete activeFilters[key];
    }
  } else {
    activeFilters[key].push(value);
    sidePanelEl.scrollIntoView({ behavior: "smooth", block: "start"});
  }
  doSearch(findCollectionEl.value);
})

const buildFilterItem = function(key, term, count, idx, checked=false) {
  let item = filterItemTemplate.content.cloneNode(true);
  let inputEl = item.querySelector('input');
  let labelEl = item.querySelector('label');
  let action = checked ? 'remove' : 'add';
  let slug = key.toLowerCase().replace(/[^\w+]/g, '-');
  inputEl.id = `${action}-${slug}-${idx}`;
  inputEl.value = term;
  inputEl.name = `filter-${slug}`;
  inputEl.checked = checked;
  inputEl.dataset.key = key;
  if ( checked ) {
    inputEl.dataset.action = 'remove';
    labelEl.innerHTML = `<span class="seperator">${key}</span> ${term}`;
  } else {
    inputEl.dataset.action = 'add';
    labelEl.innerHTML = `${term} <span>(${count})</span>`;
  }
  labelEl.setAttribute('for', inputEl.id);
  return item;
}

const updateActiveFilterStyles = function(collids) {
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

const updateCurrentFilters = function(filters) {
  let currentKeys = Object.keys(activeFilters);
  currentFilterPanelEl.querySelectorAll('.filter-item').forEach((el) => el.remove());
  if ( currentKeys.length == 0 ) {
    currentFilterPanelEl.style.display = 'none';
    return;
  }
  currentKeys = [ ...metaFilters.filter((v) => currentKeys.includes(v)), ...currentKeys.filter((v) => ! metaFilters.includes(v)) ];
  currentKeys.forEach((key) => {
    activeFilters[key].forEach((term, termIdx) => {
      let item = buildFilterItem(key, term, null, termIdx, true);
      currentFilterPanelEl.querySelector('.filter-item--list').append(item);
    })
  })
  currentFilterPanelEl.style.display = 'block';
}

const updateAvailableFilters = function(filters) {
  // float the metaFilters to the top
  let availableKeys = [ ...metaFilters, ...Object.keys(filters).filter((key) => metaFilters.indexOf(key) < 0) ];
  availableFiltersEl.querySelectorAll('.filter').forEach((el) => el.remove());
  availableKeys.forEach((key) => {
    let panel; let div;
    if ( filters[key] == null ) { return ; }
    Object.keys(filters[key]).forEach((term, termIdx) => {
      if ( ignoreFilters.includes(key) ) { return ; }
      if ( activeFilters[key] ) {
        // currenly selected filter
        if ( activeFilters[key] == term ) { return ; }
        if ( activeFilters[key].includes(term) ) { return ; }
      }
      if ( filters[key][term] > 0 ) {
        if ( panel === undefined ) {
          panel = filterPanelTemplate.content.cloneNode(true);
          panel.querySelector('details').dataset.key = key;
          panel.querySelector('summary').innerHTML = `Filter by ${key}`;
          availableFiltersEl.append(panel);
          panel = availableFiltersEl.querySelector(`details[data-key="${key}"]`);
          if ( key == 'Format' || key == 'Access' ) {
            panel.open = true;
          } else if ( activeFilters[key] !== undefined ) {
            panel.open = true;
          }
        }
        let item = buildFilterItem(key, term, filters[key][term], termIdx, false);
        panel.querySelector('.filter-item--list').append(item);
      }
    })
  })
}

const updateResultsHeading = function(total) {
  let suffix = ( total == 1 ) ? 'result' : 'results';
  resultsHeadingEl.innerHTML = `${total} ${suffix}`;
  document.body.dataset.totalResults = total;
}

const updateHistory = function() {
  const params = new URLSearchParams();
  if ( findCollectionEl.value ) {
    params.set('byText', findCollectionEl.value);
  }
  Object.keys(activeFilters).forEach((key) => {
    activeFilters[key].forEach((term) => {
      params.append(`by${key}`, term);
    })
  })
  if ( params.toString() != '' || location.search != '' ) {
    history.pushState({ Text: findCollectionEl.value, filters: activeFilters}, "", `${location.pathname}?${params.toString()}`);
  }
}

const highlightSearchTerm = function(value, results) {
  if ( ! CSS.highlights ) { return ; }
  if ( ! value || ! value.trim() ) { return ; }

  CSS.highlights.clear();
  const regexp = /<mark>([^<]+)<\/mark>/g;
  const ranges = [];
  results.forEach((result) => {
    let liEl = document.querySelector(`li[data-collid=${result.meta.collid}]`);
    const matches = [...result.excerpt.matchAll(regexp)];
    // https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API 
    // uses a treeWalker to find all the text nodes, but we should only have 
    // the <p>
    const pEl = liEl.querySelector('p');
    const textEl = pEl.firstChild;
    const indicies = [];
    let text = textEl.textContent;
    matches.forEach((match) => {
      let str = match[1];
      let startPos = 0;
      while ( startPos < text.length ) {
        const index = text.indexOf(str, startPos);
        if ( index === -1 ) { break; }
        indicies.push([ index, str.length ]);
        startPos = index + str.length;
      }
    })

    indicies.map(([ index, length ]) => {
      const range = new Range();
      range.setStart(textEl, index);
      range.setEnd(textEl, index + length);
      ranges.push(range);
    })
  })

  const searchResultsHighlight = new Highlight(...ranges.flat());
  CSS.highlights.set("search-results", searchResultsHighlight);
}

const clearActiveFilters = function() {
  // reset active filters
  Object.keys(activeFilters).forEach((key) => {
    delete activeFilters[key];
  })
  findCollectionEl.value = '';
}

window.addEventListener('popstate', (event) => {
  let q = null;
  clearActiveFilters();
  if ( event.state && event.state.Text !== undefined ) {
    q = event.state.Text;
    Object.keys(event.state.filters).forEach((key) => {
      activeFilters[key] = event.state.filters[key];
    })
  }
  doSearch(q, false);
})

const doSearch = async function(value, doUpdateHistory=true) {
  if ( ! value ) { value = null; }
  const search = await pagefind.debouncedSearch(value, {
    filters: activeFilters,
  })
  if ( ! search ) { return; }
  if ( ! search.results ) { return ; }
  const results = await Promise.all(search.results.map(r => r.data()));
  updateActiveFilterStyles(results.map(r => r.meta.collid));
  updateAvailableFilters(search.filters);
  updateCurrentFilters(search.filters);
  updateResultsHeading(results.length);
  highlightSearchTerm(value, results);
  if ( doUpdateHistory ) {
    updateHistory();
  }
  // console.log("-- doSearch fin", value, activeFilters, results.map(r => r.meta.collid));
}

currentFilterPanelEl.querySelector('button.clear-all-btn').addEventListener('click', (event) => {
  clearActiveFilters();
  doSearch(null);
});

pagefind.init();

// fetch all the filters to prime pagefind
const filters = await pagefind.filters();

findCollectionEl.addEventListener('keyup', (event) => {
  let value = event.target.value || null;
  doSearch(value);
})

// TODO - setup handlers for filter de/selection and weep
// for jQuery delegation

let initialQuery = null;
let params = new URLSearchParams(location.search);
if ( params.has('byText') ) {
  initialQuery = params.get('byText');
  findCollectionEl.value = initialQuery;
  params.delete('byText');
}

for (const param of params.keys()) {
  let key = param.replace('by', '');
  if ( filters[key] ) {
    activeFilters[key] = params.getAll(param);
  }
}

doSearch(initialQuery, false);
