//Disclosure with Button and ARIA

const disclosureBtn = document.querySelector('button.disclosure-btn');

disclosureBtn.addEventListener('click', function() {
  if ( this.getAttribute('aria-expanded') === 'true' ) {
    this.setAttribute('aria-expanded', 'false');
  }
  else {
    this.setAttribute('aria-expanded', 'true');
  } 
});