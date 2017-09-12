// Initiate event listener for user location input on click

const googleMapsGeoLocationURL = 'https://www.googleapis.com/geolocation/v1/geolocate';
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
};
let funLocationsArray = [];
let foodLocationsArray = [];
let destinationInput = {};
const defaultLocation = {
  city: 'Santa Barbara',
  state: 'CA'
};
let currentLocation ={};


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
    // getTravelTime(query, postDirectionResults);
    setTimeout(mapLocations, 1500);
  });
}

function getCurrentLocation() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition( function(position) {
    currentLocation.lat = position.coords.latitude;
    currentLocation.lng = position.coords.longitude;
    });
  }
}

function initMap() {
  const santaBarbara = {lat: 34.41999817, lng: -119.70999908};
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: santaBarbara
  });
  const marker = new google.maps.Marker ({
    position: santaBarbara,
    map: map
  });
}

function getWeatherData(searchTerm,callback){
  const city = searchTerm.city;
  const localURL = `http://api.wunderground.com/api/5c23472908e94808/forecast/conditions/q/${searchTerm.state}/${city}.json`;
  $.getJSON(localURL, callback);
  }

// function getTravelTime(searchTerm, callback){
//   let city = searchTerm.city;
//   let state = searchTerm.state
//   let directionURL = `https://maps.googleapis.com/maps/api/directions/json?origin=Toronto&destination=Montreal&key=AIzaSyA6i1il1U7eP3j5nuBs5iAcvGiPKB4gVTY?callback=?`;
//   let travelObject = {
//     url: directionURL,
//     type: 'GET',
//     dataType: 'jsonp',
//     cache: false,
//     jsonpCallback: 'callback',
//     success: function() {console.log('something');}
//     }
//
//   // let directionURL = `https://maps.googleapis.com/maps/api/directions/json?origin=${locations.lat},${locations.lng}&destination=${city},${state}&key=AIzaSyDk1pbG28gmjs_kTkfFmaFEaB9GBD0R7cw`;
//   // console.log(directionURL);
//   $.ajax(travelObject);
//   // $.getJSON(directionURL, callback);
//   }

function postDirectionResults(results){
  console.log(results);
}

function postWeatherResults(results) {
  console.log(results);
  destinationInput.lat = Number(results.current_observation.display_location.latitude);
  destinationInput.lng = Number(results.current_observation.display_location.longitude);
  // console.log(locationsArray);
  $('#js-weather-forecast').empty();
  $('#js-weather-forecast').append(`<h2>3-Day Forecast</h2>`);
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
  // console.log(fourSquareObject);
  $.ajax(fourSquareObject);
}

function postFourSquareFunResults(results) {
  console.log(results);
  if (results){
    $('#js-fun-results').empty();
    funLocationsArray = [];
    $('#js-fun-results').append(`<h2>What to Do</h2>`);
    for (let i = 0; i < 5; i++){
    const fourSquare = results.response.groups[0].items[i];
    let location = [fourSquare.venue.name,
      Number(fourSquare.venue.location.labeledLatLngs["0"].lat),
      Number(fourSquare.venue.location.labeledLatLngs["0"].lng),
      i+1
      ];
    funLocationsArray.push(location);
    $('#js-fun-results').append(`<div class="window fun">
      <h3><a href=${fourSquare.tips["0"].canonicalUrl}>${fourSquare.venue.name}</a></h3>
      <div class="img-blurb"><div class="image"><img src="${fourSquare.venue.photos.groups["0"].items["0"].prefix}150x150${fourSquare.venue.photos.groups["0"].items["0"].suffix}"></div>
      <div class="blurb">${fourSquare.tips["0"].text}</div></div>
      </div>`)
    };
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
  // console.log(fourSquareObject);
  $.ajax(fourSquareObject);
}

function postFourSquareFoodResults(results) {
  // console.log(results);
  if (results){
    $('#js-food-results').empty();
    foodLocationsArray = [];
    $('#js-food-results').append(`<h2>What to Eat</h2>`);
    for (let i = 0; i < 5; i++){
      console.log(i);
      const fourSquare = results.response.groups[0].items[i];
      let location = [fourSquare.venue.name,
        Number(fourSquare.venue.location.labeledLatLngs["0"].lat),
        Number(fourSquare.venue.location.labeledLatLngs["0"].lng),
        i+1
        ];
      foodLocationsArray.push(location);
      $('#js-food-results').append(`<div class="window food">
        <h3><a href=${fourSquare.tips["0"].canonicalUrl}>${fourSquare.venue.name}</a></h3>
        <div class="img-blurb"><div class="image"><img src="${fourSquare.venue.photos.groups["0"].items["0"].prefix}150x150${fourSquare.venue.photos.groups["0"].items["0"].suffix}"></div>
        <div class="blurb">${fourSquare.tips["0"].text}</div></div>
        </div>`)
      };
    }
  else console.error('oops');
}

function mapLocations(){
  let locationsArray = funLocationsArray.concat(foodLocationsArray);
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: new google.maps.LatLng(destinationInput),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  const infowindow = new google.maps.InfoWindow();
  let marker, i;
  for (i = 0; i < locationsArray.length; i++ ){
    marker = new google.maps.Marker ({
      position: new google.maps.LatLng(locationsArray[i][1], locationsArray[i][2]),
      map: map
  });
    google.maps.event.addListener(marker, 'click', (function(marker, i) {
      return function() {
        infowindow.setContent(locationsArray[i][0]);
        infowindow.open(map, marker);
      }
    })(marker, i));
  }
}

function weekender() {
  listenForClick();
  getCurrentLocation();
  getWeatherData(defaultLocation, postWeatherResults);
  getFourSquareFunData(defaultLocation, postFourSquareFunResults);
  getFourSquareFoodData(defaultLocation, postFourSquareFoodResults);
  setTimeout(mapLocations, 1500);
}

//On page load, call the function 'weekender'
$(weekender);
