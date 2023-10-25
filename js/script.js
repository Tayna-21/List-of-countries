"use strict"

const createListOfCountries = () => {
    const input = document.getElementById('search_field');
    const inputBtn = document.getElementById('search_btn');
    const list = document.getElementById('list_of_countries');
    const errorMessage = document.querySelector('.error-message');
    const slider = document.querySelector('.slider');
    const divDropdown = document.querySelector('.dropdown');
    let listDropdown;
    let selectedRegion;
    const arrayOfCountries = [];
    const arrayOfAllRegionsValues = [];
    const themeValue = 'dark-mode';
    const loader = document.querySelector('.loader')

    const renderListItem = (object) => {
        const template = `
          <li>
            <img src="${object.flag_img}" alt="${object.flag_alt}">
            <div class="text">
              <h2>${object.country_name}</h2>
              <h3>Population: <span>${object.population}</span></h3>
              <h3>Region: <span>${object.region}</span></h3>
              <h3>Capital: <span>${object.hasCapital()}</span></h3>
            </div>
          </li>
          `;

        return template;
    };

    async function loadListOfCountries() {
        const api = `https://restcountries.com/v3.1/all?fields=name,flags,population,region,capital`;

        fetch(api)
          .then(response => response.json())
          .then(data => {

              data.map((item) => {
                  const objCountry = {
                    flag_img: item.flags.svg,
                    flag_alt: item.flags.alt,
                    country_name: item.name.common,
                    population: item.population,
                    region: item.region,
                    hasCapital() {
                        const capital = item.capital;

                        if (capital.length === 0) {
                            item.capital = '-';
                        }

                        return item.capital;
                    },
                  };

                  arrayOfCountries.push(objCountry);
              });

              arrayOfCountries.forEach((item) => {
                  list.insertAdjacentHTML('beforeend', renderListItem(item));
              })

              arrayOfCountries.map((item) => {
                  const regionName = item.region;

                  arrayOfAllRegionsValues.push(regionName);
              })

              const arrayOfUniqueRegions = [...new Set(arrayOfAllRegionsValues)];
              const templateDropdown = `
                <span>All Regions</span>
                <button type="button" id="dropdown_btn">
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.42859 10.2142L13 15.7857L18.5714 10.2142" stroke="#333333" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                </button>
                <ul id="list_of_regions" class="invisible">
                  <li>All Regions</li>
                </ul>
                `;

              divDropdown.innerHTML = templateDropdown;

              listDropdown = document.getElementById('list_of_regions');
              selectedRegion = document.querySelector('.dropdown span');

              for (let i = 0; i < arrayOfUniqueRegions.length; i++) {
                  listDropdown.insertAdjacentHTML('afterbegin', `<li>${arrayOfUniqueRegions[i]}</li>`);
              };
          })
          .catch(error => console.log(error.message));
    };

    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('invisible')
        },1000);

        const darkmode = localStorage.getItem(themeValue);

        if (!!darkmode) {
            document.querySelector('input[type=checkbox]').setAttribute('checked', true);
            document.body.classList.add(themeValue);
        };

        loadListOfCountries();
    });

    window.addEventListener('scroll', () => {
        const scrollBtn = document.querySelector('.scroll_to_top');

        if (window.scrollY > 500) {
            scrollBtn.classList.remove('invisible');
        } else {
            scrollBtn.classList.add('invisible');
        };

        scrollBtn & scrollBtn.addEventListener('click', () => {
            const toScroll = () => {
                window.scrollTo(0, 0);
            }

            toScroll();
        });
    });

    divDropdown && divDropdown.addEventListener('click', (event) => {
        const tagName = event.target.tagName;

        if (tagName === 'BUTTON' || tagName === 'SPAN') {
            if (listDropdown.classList.contains('invisible')) {
                listDropdown.classList.remove('invisible');
                document.getElementById('dropdown_btn').classList.add('active');
            } else {
                listDropdown.classList.add('invisible');
                document.getElementById('dropdown_btn').classList.remove('active');
            };
        };

        if (tagName === 'LI') {
            const region = event.target.innerText;
            list.innerHTML = '';
            selectedRegion.innerText = region;
            listDropdown.classList.add('invisible');
            document.getElementById('dropdown_btn').classList.remove('active');

            if (region === 'All Regions') {
                arrayOfCountries.forEach((item) => {
                    list.insertAdjacentHTML('beforeend', renderListItem(item));
                });
                input.value = '';
            } else {
                arrayOfCountries
                  .filter(item => item.region === region)
                  .map((item) => {
                      list.insertAdjacentHTML('beforeend', renderListItem(item));
                });
                input.value = '';
            };
        };
    });

    input && input.addEventListener('input', () => {
        const regionValue = selectedRegion.innerText;
        const countryValue = input.value.toLowerCase().trim();
        list.innerHTML = '';

        if (regionValue !== 'All Regions') {
          arrayOfCountries
              .filter((item) => {
                  return (item.region === regionValue && item.country_name.toLowerCase().search(countryValue) >= 0);
              })
              .map((item) => {
                  list.insertAdjacentHTML('beforeend', renderListItem(item));
              });
        } else {
          arrayOfCountries
              .filter((item) => item.country_name.toLowerCase().search(countryValue) >= 0)
              .map((item) => {
                list.insertAdjacentHTML('beforeend', renderListItem(item));
              })
        }
    });

    inputBtn && inputBtn.addEventListener('click', () => {
        const countryName = input.value.trim();

        if (input.value === '') {
            errorMessage.classList.remove('invisible');
            errorMessage.innerText = 'field can not be empty';

            return;
        };

        if (!input.value.match(/[A-Za-z\s,-.]+[A-Za-z]/) || countryName.length < 4) {
            errorMessage.classList.remove('invisible');
            errorMessage.innerText = 'wrong input';

            return;
        };

        if (!arrayOfCountries.find(item => item.country_name.toLowerCase() === countryName.toLowerCase())) {
            errorMessage.classList.remove('invisible');
            errorMessage.innerText = 'such country does not exist';
            list.innerHTML = '';

            return;
        };

        list.innerHTML = '';

        arrayOfCountries
            .filter((item) => item.country_name.toLowerCase() === countryName.toLowerCase())
            .map((item) => {
              list.insertAdjacentHTML('beforeend', renderListItem(item));
              selectedRegion.innerText = item.region;
            })
    });

    input && input.addEventListener('focus', () => {
        if (!errorMessage.classList.contains('invisible')) {
            errorMessage.classList.add('invisible');
        };
    });

    slider && slider.addEventListener('click', () => {
        if (!document.body.classList.contains(themeValue)) {
            document.body.classList.add(themeValue);
            localStorage.setItem(themeValue, 'dark');
        } else if (document.body.classList.contains(themeValue)) {
            document.body.classList.remove(themeValue);
            localStorage.removeItem(themeValue);
        };
    });
};

document.addEventListener('DOMContentLoaded', createListOfCountries);
