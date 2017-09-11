// Initiate event listener for user location input on click

const googleMapsGeoLocationURL = 'https://www.googleapis.com/geolocation/v1/geolocate'
const fourSquareURL = 'https://api.foursquare.com/v2/venues/explore';
const openWeatherMapURL = 'https://api.openweathermap.org/data/2.5/weather';
const wundergroundURL = 'http://api.wunderground.com/api/5c23472908e94808/forecast';
const config = {
  client_id: 'GDAZIM0JN05C0I31Y4X0OCSFGFXRY44FWSAXM42HTU4ZYEZL',
  client_secret: 'QESW05VJ2KP2LQZOTM0MNVKE2QC3DCYEU5UY5DNE5YBB0NRV',
  v: '20170101',
  venuePhotos: 1,
  url: fourSquareURL,
  dataType: 'json',
  type: 'GET',
  error: console.log('error')
}

function listenForClick(){
  console.log('listenForClick initiated');
  $('#js-click').click( event => {
    event.preventDefault();
    let query = {};
    query.city = $('#js-destination-city').val();
    query.state = $('#js-destination-state').val();
    console.log(query);
    getWeatherData(query, postWeatherResults);
    getFourSquareFunData(query, postFourSquareFunResults);
    getFourSquareFoodData(query, postFourSquareFoodResults);
  });
}

function getCurrentLocation() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition( function(position) {
      console.log(position);
    });
  }
}

function getWeatherData(searchTerm,callback){
  const city = searchTerm.city
  const localURL = `http://api.wunderground.com/api/5c23472908e94808/forecast/conditions/q/${searchTerm.state}/${city}.json`;
  $.getJSON(localURL, callback);
  }

function postWeatherResults(results) {
  console.log(results);
  $('#js-weather-forecast').empty();
  for (let i = 0; i < 5; i+=2 ){
    let dayForecast = results.forecast.txt_forecast.forecastday[i];
    $('#js-weather-forecast').append(`<div class="window weather-forecast">
      <h3>${dayForecast.title}</h3>
      <img src="${dayForecast.icon_url}">
      <div class="weather-blurb">${dayForecast.fcttext}</div>
      </div>`);
  };
}

function getFourSquareFunData(searchTerm, callback){
  const fourSquareObject = {
    data: {
      client_id: config.client_id,
      client_secret: config.client_secret,
      v: config.v,
      venuePhotos: config.venuePhotos,
      near: `${searchTerm.city}, ${searchTerm.state}`,
      query: 'fun'
      },
    url: config.url,
    dataType: config.dataType,
    type: config.type,
    success: callback,
    error: config.error
      };
  fourSquareObject.success = callback;
  console.log(fourSquareObject);
  $.ajax(fourSquareObject);
}


function postFourSquareFunResults(results) {
  console.log(results);
  if (results){
    $('#js-fun-results').empty();
    for (let i = 0; i < 5; i++){
    const fourSquare = results.response.groups[0].items[i];
    $('#js-fun-results').append(`<div class="window">
      <h3><a href=${fourSquare.tips["0"].canonicalUrl}>${fourSquare.venue.name}</a></h3>
      <img  src="${fourSquare.venue.photos.groups["0"].items["0"].prefix}150x150${fourSquare.venue.photos.groups["0"].items["0"].suffix}">
      <div>${fourSquare.tips["0"].text}</div>
      </div>`)
      }
    }
  else console.error('oops');
}

function getFourSquareFoodData(searchTerm, callback){
  const fourSquareObject = {
    data: {
      client_id: config.client_id,
      client_secret: config.client_secret,
      v: config.v,
      venuePhotos: config.venuePhotos,
      near: `${searchTerm.city}, ${searchTerm.state}`,
      section: 'food'
      },
    url: config.url,
    dataType: config.dataType,
    type: config.type,
    success: callback,
    error: config.error
    };
  fourSquareObject.success = callback;
  console.log(fourSquareObject);
  $.ajax(fourSquareObject);
}

function postFourSquareFoodResults(results) {
  console.log(results);
  if (results){
    $('#js-food-results').empty();
    for (let i = 0; i < 5; i++){
    const fourSquare = results.response.groups[0].items[i];
    $('#js-food-results').append(`<div class="window">
      <h3><a href=${fourSquare.tips["0"].canonicalUrl}>${fourSquare.venue.name}</a></h3>
      <img src="${fourSquare.venue.photos.groups["0"].items["0"].prefix}150x150${fourSquare.venue.photos.groups["0"].items["0"].suffix}">
      <div>${fourSquare.tips["0"].text}</div>
      </div>`)
      }
    }
  else console.error('oops');
}

function weekender() {
  listenForClick();
  getCurrentLocation();
}

//On page load, call the function 'weekender'
$(weekender);
