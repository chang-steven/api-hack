//Define global variables
const config = {
  client_id: 'GDAZIM0JN05C0I31Y4X0OCSFGFXRY44FWSAXM42HTU4ZYEZL',
  client_secret: 'QESW05VJ2KP2LQZOTM0MNVKE2QC3DCYEU5UY5DNE5YBB0NRV',
  v: '20170101',
  venuePhotos: 1,
  url: 'https://api.foursquare.com/v2/venues/explore',
  dataType: 'json',
  type: 'GET',
  error: function() {
    console.log('error');
  }
};
const currentLocation = {};

//Initiate event listeners and listen for click
function listenForClick() {
  $('#destination-form').on('submit', ( event => {
    event.preventDefault();
    $('#loading').append('<p>Loading...</p>');
    const query = {
      city: $('#js-destination-city').val(),
      state: $('#js-destination-state').val(),
    }
    callAPIs(query);
    getTravelTime(query, postDirectionResults);
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

function errorHandling(reason){
  alert(reason);
  console.log(reason);
}

function getTravelTime(searchTerm, callback){
  let city = searchTerm.city;
  let state = searchTerm.state;
  // let directionURL = `https://maps.googleapis.com/maps/api/directions/json?origin=Toronto&destination=Montreal&key=&key=AIzaSyA6i1il1U7eP3j5nuBs5iAcvGiPKB4gVTY`;
  let directionURL = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=Washington,DC&destinations=New+York+City,NY&key=AIzaSyA6i1il1U7eP3j5nuBs5iAcvGiPKB4gVTY';
  let travelObject = {
    url: directionURL,
    type: 'GET',
    dataType: 'json',
    // cache: false,
    // jsonpCallback: postDirectionResults,
    success: postDirectionResults
  };
  $.ajax(travelObject);
}

function postDirectionResults(results){
  console.log('postDirectionResults ran');
  console.log(results);
}

function postWeatherResults(results) {
  $('#js-weather-forecast').empty().append(`<h2>3-Day Forecast</h2>`);
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
  $('#js-fun-results').empty().append(`<h2>What to Do</h2>`);
  for (let i = 0; i <10; i++){
  const fourSquare = results.response.groups[0].items[i];
  $('#js-fun-results').append(`<div class="window fun">
    <div class="img-blurb"><h3><a href=${fourSquare.tips[0].canonicalUrl}>${i + 1}. ${fourSquare.venue.name}</a></h3><div class="image"><span class="rating">${fourSquare.venue.rating}</span><img src="${fourSquare.venue.photos.groups[0].items[0].prefix}150x150${fourSquare.venue.photos.groups[0].items[0].suffix}"></div>
    <div class="blurb">${fourSquare.tips[0].text}</div></div>
    </div>`)
  };
}

function postFourSquareFoodResults(results) {
  $('#js-food-results').empty();
  $('#js-food-results').append(`<h2>What to Eat</h2>`);
  for (let i = 0; i < 10; i++){
    const fourSquare = results.response.groups[0].items[i];
    $('#js-food-results').append(`<div class="window food">
      <div class="img-blurb"><h3><a href=${fourSquare.tips[0].canonicalUrl}>${i + 1}. ${fourSquare.venue.name}</a></h3><div class="image"><span class="rating">${fourSquare.venue.rating}</span>
      <img src="${fourSquare.venue.photos.groups[0].items[0].prefix}150x150${fourSquare.venue.photos.groups[0].items[0].suffix}"></div>
      <div class="blurb">${fourSquare.tips[0].text}</div></div>
      </div>`)
  };
}

function mapLocations(locationDataByType, mapCenter){
  const map = new google.maps.Map( $('#map')[0], {
    zoom: 12,
    center: new google.maps.LatLng(mapCenter),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  const infowindow = new google.maps.InfoWindow();

  function addMarkerToMap(location, iconURL) {
    marker = new google.maps.Marker ({
      position: new google.maps.LatLng(location[1], location[2]),
      icon: iconURL,
      map: map
    });
    google.maps.event.addListener(marker, 'mouseover', (function(marker, location) {
      return function(){
        infowindow.setContent(`<div class="info-window"><img src="${location[5]}" alt="${location[0]}">
        <a href="${location[4]}">${location[3]}. ${location[0]}</a></div>`);
        infowindow.open(map, marker);
      }
    })(marker, location));
  }
  Object.keys(locationDataByType).forEach(function(locationType) {
    let locations = locationDataByType[locationType].objects;
    let locationIconURL = locationDataByType[locationType].iconURL;
    locations.forEach(function(location) {
      addMarkerToMap(location, locationIconURL);
    });
  })
}

function callAPIs(searchTerm){
  const localURL = `http://api.wunderground.com/api/5c23472908e94808/forecast/conditions/q/${searchTerm.state}/${searchTerm.city}.json`;
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
    $('#loading').empty();
    postWeatherResults(responses[0]);
    postFourSquareFunResults(responses[1]);
    postFourSquareFoodResults(responses[2]);
    const destinationInput = responses[1].response.geocode.center;
    const funLocations = responses[1].response.groups[0].items.splice(0, 10).map(function(item, index) {
      return [
        item.venue.name,
        Number(item.venue.location.labeledLatLngs[0].lat),
        Number(item.venue.location.labeledLatLngs[0].lng),
        index + 1,
        item.tips[0].canonicalUrl,
        item.venue.photos.groups[0].items[0].prefix + '50x50' + item.venue.photos.groups[0].items[0].suffix
      ];
    });
    const foodLocations = responses[2].response.groups[0].items.splice(0, 10).map(function(item, index) {
      return [
        item.venue.name,
        Number(item.venue.location.labeledLatLngs[0].lat),
        Number(item.venue.location.labeledLatLngs[0].lng),
        index + 1,
        item.tips[0].canonicalUrl,
        item.venue.photos.groups[0].items[0].prefix + '50x50'+ item.venue.photos.groups[0].items[0].suffix
      ];
    });
    let locationDataByType = {
      fun: {
        objects: funLocations,
        iconURL: 'http://maps.google.com/mapfiles/ms/micons/POI.png'
      },
      food: {
        objects: foodLocations,
        iconURL: 'http://maps.google.com/mapfiles/ms/micons/restaurant.png'
      }
    };
    mapLocations(locationDataByType, destinationInput);
  });
}

function planIt() {
  listenForClick();
  getCurrentLocation();
  const defaultLocation = {
    city: 'Santa Barbara',
    state: 'CA'
  };
  callAPIs(defaultLocation);
}

//On page load, call the function 'weekender'
$(planIt);
