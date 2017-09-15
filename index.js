//Define global variables
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
  error: function(){console.log('error');}
};
const defaultLocation = {
  city: 'Santa Barbara',
  state: 'CA'
};
const currentLocation = {};

//Initiate event listeners and listen for click
function listenForClick(){
  console.log('listenForClick initiated');
  $('#destination-form').on('submit', ( function(event){
    event.preventDefault();
    $('#loading').append(`<p>Loading...</p>`);
    let query = {};
    query.city = $('#js-destination-city').val();
    query.state = $('#js-destination-state').val();
    console.log(query);
    callAPIs(query);
    // getTravelTime(query, postDirectionResults);
    })
  );
}

//This function geolocates the user and
function getCurrentLocation() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition( function(position) {
    currentLocation.lat = position.coords.latitude;
    currentLocation.lng = position.coords.longitude;
    console.log(currentLocation);
    });
  }
}

function callAPIs(searchTerm){
  // $('#js-fun-results').append(`<h1>Loading...</h1>`);
  const city = searchTerm.city;
  const localURL = `http://api.wunderground.com/api/5c23472908e94808/forecast/conditions/q/${searchTerm.state}/${city}.json`;
  const weatherObject = {
    url: localURL,
    dataType: 'json',
    type: 'GET',
    error: config.error
      };
  const callWeather = $.ajax(weatherObject);

  const fourSquareFunObject = {
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
    error: config.error
      };
    const callFourSquareFun = $.ajax(fourSquareFunObject);

    const fourSquareFoodObject = {
      data: {
        client_id: config.client_id,
        client_secret: config.client_secret,
        v: config.v,
        venuePhotos: config.venuePhotos,
        near: `${searchTerm.city}, ${searchTerm.state}`,
        section: 'food',
        },
      url: config.url,
      dataType: config.dataType,
      type: config.type,
      error: config.error
        };
    const callFourSquareFood = $.ajax(fourSquareFoodObject);

    Promise.all([callWeather, callFourSquareFun, callFourSquareFood]).then((responses) => {
      // console.log(responses);
      $('#loading').empty();
      postWeatherResults(responses[0]);
      postFourSquareFunResults(responses[1]);
      postFourSquareFoodResults(responses[2]);
      const destinationInput = responses[1].response.geocode.center;
      const funLocations = responses[1].response.groups[0].items.map(function(item){
        return [
          item.venue.name,
          Number(item.venue.location.labeledLatLngs["0"].lat),
          Number(item.venue.location.labeledLatLngs["0"].lng),
        ];
      });
      const foodLocations = responses[2].response.groups[0].items.map(function(item){
        return [
          item.venue.name,
          Number(item.venue.location.labeledLatLngs["0"].lat),
          Number(item.venue.location.labeledLatLngs["0"].lng),
        ];
      });
      funLocations.splice(10);
      foodLocations.splice(10);
      const readyMap = funLocations.concat(foodLocations);

      // console.log(readyMap);
      mapLocations(readyMap, destinationInput);
    });
  }

// function getTravelTime(searchTerm, callback){
//   let city = searchTerm.city;
//   let state = searchTerm.state;
//   // let directionURL = `https://maps.googleapis.com/maps/api/directions/json?origin=Toronto&destination=Montreal&key=&key=AIzaSyA6i1il1U7eP3j5nuBs5iAcvGiPKB4gVTY`;
//   let directionURL = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=Washington,DC&destinations=New+York+City,NY&key=AIzaSyA6i1il1U7eP3j5nuBs5iAcvGiPKB4gVTY';
//   let travelObject = {
//     url: directionURL,
//     type: 'GET',
//     dataType: 'jsonp',
//     cache: false,
//     jsonpCallback: postDirectionResults,
//     success: postDirectionResults
//   };
//   $.ajax(travelObject);
// }

function postDirectionResults(results){
  console.log('postDirectionResults ran');
  console.log(results);
}

function postWeatherResults(results) {
  // console.log(results);
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

function postFourSquareFunResults(results) {
  // console.log(results);
  $('#js-fun-results').empty();
  $('#js-fun-results').append(`<h2>What to Do</h2>`);
  for (let i = 0; i <10; i++){
  const fourSquare = results.response.groups["0"].items[i];
  $('#js-fun-results').append(`<div class="window fun">
    <div class="img-blurb"><h3><a href=${fourSquare.tips["0"].canonicalUrl}>${i+1}. ${fourSquare.venue.name}</a></h3><div class="image"><span class="rating">${fourSquare.venue.rating}</span><img src="${fourSquare.venue.photos.groups["0"].items["0"].prefix}150x150${fourSquare.venue.photos.groups["0"].items["0"].suffix}"></div>
    <div class="blurb">${fourSquare.tips["0"].text}</div></div>
    </div>`)
  };
}

function postFourSquareFoodResults(results) {
  $('#js-food-results').empty();
  foodLocationsArray = [];
  $('#js-food-results').append(`<h2>What to Eat</h2>`);
  for (let i = 0; i < 10; i++){
    const fourSquare = results.response.groups["0"].items[i];
    $('#js-food-results').append(`<div class="window food">
      <div class="img-blurb"><h3><a href=${fourSquare.tips["0"].canonicalUrl}>${i+1}. ${fourSquare.venue.name}</a></h3><div class="image"><span class="rating">${fourSquare.venue.rating}</span>
      <img src="${fourSquare.venue.photos.groups["0"].items["0"].prefix}150x150${fourSquare.venue.photos.groups["0"].items["0"].suffix}"></div>
      <div class="blurb">${fourSquare.tips["0"].text}</div></div>
      </div>`)
  };
}

function mapLocations(mapArray, mapCenter){
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: new google.maps.LatLng(mapCenter),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  const infowindow = new google.maps.InfoWindow();
  let marker, i;
  for (i = 0; i < mapArray.length; i++){
    marker = new google.maps.Marker ({
      position: new google.maps.LatLng(mapArray[i][1], mapArray[i][2]),
      map: map
  });
    google.maps.event.addListener(marker, 'mouseover', (function(marker, i) {
      return function() {
        infowindow.setContent(mapArray[i][0]);
        infowindow.open(map, marker);
      }
    })(marker, i));
  };
}

function weekender() {
  listenForClick();
  getCurrentLocation();
  callAPIs(defaultLocation);
}

//On page load, call the function 'weekender'
$(weekender);
