const pagefind = await import("/pagefind/pagefind.js");

const appliedFilters = {};
const metaFilters = ['Format', 'Access'];
const ignoreFilters = ['class'];

let styles;
for (let i = 0; i < document.styleSheets.length; i++) {
  let ownerNode = document.styleSheets[i].ownerNode;
  if (ownerNode.id == 'applied-filters') {
    styles = document.styleSheets[i];
  }
}

let filterPanelTemplate = document.querySelector('#filter-panel-template');
let filterItemTemplate = document.querySelector('#filter-item-template');
let sidePanelEl = document.querySelector('.side-panel');
let availableFiltersEl = document.querySelector('#available-filters');
let currentFilterPanelEl = document.querySelector('#current-filters');
const findCollectionEl = document.querySelector('#find-collection');

sidePanelEl.addEventListener('change', (event) => {
  if ( event.target.type != 'checkbox' ) { return ; }
  let input = event.target;
  let value = input.value;
  let key = input.name.replace('filter-', '');
  console.log("-- change", input);
  if ( ! appliedFilters[key] ) { appliedFilters[key] = []; }
  if ( input.dataset.action == 'remove' ) {
    appliedFilters[key] = appliedFilters[key].filter(v => v != value);
    if ( appliedFilters[key].length == 0 ) {
      delete appliedFilters[key];
    }
  } else {
    appliedFilters[key].push(value);
  }
  doSearch(findCollectionEl.value);
})

const buildFilterItem = function(key, term, count, idx, checked=false) {
  let item = filterItemTemplate.content.cloneNode(true);
  let inputEl = item.querySelector('input');
  let labelEl = item.querySelector('label');
  let action = checked ? 'remove' : 'add';
  inputEl.id = `${action}-${key}-${idx}`;
  inputEl.value = term;
  inputEl.name = `filter-${key}`;
  inputEl.checked = checked;
  if ( checked ) {
    inputEl.dataset.action = 'remove';
    labelEl.innerHTML = `<span class="seperator">${key}</span> ${term}`;
  } else {
    inputEl.dataset.action = 'add';
    labelEl.innerHTML = `${term} <span>(${filters[key][term]})</span>`;
  }
  labelEl.setAttribute('for', inputEl.id);
  return item;
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

const updateCurrentFilters = function(filters) {
  let currentKeys = Object.keys(appliedFilters);
  currentFilterPanelEl.querySelectorAll('.filter-item').forEach((el) => el.remove());
  if ( currentKeys.length == 0 ) {
    currentFilterPanelEl.style.display = 'none';
    return;
  }
  currentKeys = [ ...metaFilters.filter((v) => currentKeys.includes(v)), ...currentKeys.filter((v) => ! metaFilters.includes(v)) ];
  currentKeys.forEach((key) => {
    appliedFilters[key].forEach((term, termIdx) => {
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
    Object.keys(filters[key]).forEach((term, termIdx) => {
      if ( ignoreFilters.includes(key) ) { return ; }
      if ( appliedFilters[key] ) {
        // currenly selected filter
        if ( appliedFilters[key] == term ) { return ; }
        if ( appliedFilters[key].includes(term) ) { return ; }
      }
      if ( filters[key][term] > 0 ) {
        if ( panel === undefined ) {
          panel = filterPanelTemplate.content.cloneNode(true);
          panel.querySelector('details').dataset.key = key;
          panel.querySelector('summary').innerHTML = `Filter by ${key}`;
          availableFiltersEl.append(panel);
          panel = availableFiltersEl.querySelector(`details[data-key="${key}"]`);
        }
        let item = buildFilterItem(key, term, filters[key][term], termIdx, false);
        panel.querySelector('.filter-item--list').append(item);
      }
    })
  })
}

const doSearch = async function(value) {
  if ( ! value ) { value = null; }
  const search = await pagefind.search(value, {
    filters: appliedFilters,
  })
  const results = await Promise.all(search.results.map(r => r.data()));
  updateAppliedFilterStyles(results.map(r => r.meta.collid));
  updateAvailableFilters(search.filters);
  updateCurrentFilters(search.filters);
  // console.log("-- doSearch fin", value, appliedFilters, results.map(r => r.meta.collid));
}

pagefind.init();

// fetch all the filters to prime pagefind
const filters = await pagefind.filters();

findCollectionEl.addEventListener('keyup', (event) => {
  let value = event.target.value || null;
  doSearch(value);
})

// TODO - setup handlers for filter de/selection and weep
// for jQuery delegation

doSearch(null);