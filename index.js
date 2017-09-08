// Initiate event listener for user location input on click

const googleMapsGeoLocationURL = 'https://www.googleapis.com/geolocation/v1/geolocate'
// const yelpURL = 'https://api.yelp.com/v3/businesses/search';
const fourSquareURL = 'https://api.foursquare.com/v2/venues/explore';
const openWeatherMapURL = 'https://api.openweathermap.org/data/2.5/weather';
const wundergroundURL = 'http://api.wunderground.com/api/5c23472908e94808/forecast';
var fourSquareObject = {
  data: {
    client_id: 'GDAZIM0JN05C0I31Y4X0OCSFGFXRY44FWSAXM42HTU4ZYEZL',
    client_secret: 'QESW05VJ2KP2LQZOTM0MNVKE2QC3DCYEU5UY5DNE5YBB0NRV',
    v: '20170101',
    query: 'fun',
    venuePhotos: 1,
    section: 'food'
    },
  url: fourSquareURL,
  dataType: 'json',
  type: 'GET'
  };


function listenForClick(){
  console.log('listenForClick initiated');
  $('#js-click').click( event => {
    event.preventDefault();
    let query = {};
    query.city = $('#js-destination-city').val();
    query.state = $('#js-destination-state').val();
    console.log(query);
    getWeatherData(query, postWeatherResults);
    getFourSquareFunData(query, postFourSquareResults);
    getFourSquareFoodData(query, postFourSquareResults);
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
  let city = searchTerm.city
  var localURL = `http://api.wunderground.com/api/5c23472908e94808/forecast/conditions/q/${searchTerm.state}/${city}.json`;
  $.getJSON(localURL, callback);
  }

function getFourSquareFunData(searchTerm, callback){
  fourSquareObject.data.near = `${searchTerm.city}, ${searchTerm.state}`,
  fourSquareObject.data.query = 'fun';
  fourSquareObject.success = callback;
  console.log(fourSquareObject);
  $.ajax(fourSquareObject);
}

function getFourSquareFoodData(searchTerm, callback){
  fourSquareObject.data.near = `${searchTerm.city}, ${searchTerm.state}`,
  fourSquareObject.data.section = 'food';
  fourSquareObject.success = callback;
  console.log(fourSquareObject);
  $.ajax(fourSquareObject);
}

function postFourSquareResults(results) {
  console.log(results);
  if (results){
    for (let i = 0; i < 5; i++){
    var fourSquare = results.response.groups[0].items[i];
    $('#js-todo-results').append(`<div class="window">
      <h3><a href=${fourSquare.tips["0"].canonicalUrl}>${fourSquare.venue.name}</a></h3>
      <div>${fourSquare.tips["0"].text}</div>
      </div>`)
      }
    }
  else console.error('oops');
}

function postWeatherResults(results) {
  console.log(results);
  for (let i = 0; i < 5; i+=2 ){
    let dayForecast = results.forecast.txt_forecast.forecastday[i];
    $('#js-weather-forecast').append(`<div class="window weather-forecast${i}">
      <h3>${dayForecast.title}</h3>
      <img src="${dayForecast.icon_url}">
      <div class="weather-blurb">${dayForecast.fcttext}</div>
      </div>`);
  };
}

function weekender() {
  listenForClick();
  getCurrentLocation();
}

//On page load, call the function 'weekender'
$(weekender);
