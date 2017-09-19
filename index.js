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

//Initiate event listeners and listen for click
function listenForClick() {
  $('#destination-form').on('submit', ( event => {
    event.preventDefault();
    $('#loading').text('Loading...');
    const query = {
      city: $('#js-destination-city').val(),
      state: $('#js-destination-state').val(),
    }
    callAPIs(query);
  }));
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

function postFourSquareFunResults(result) {
  $('#js-fun-results').append(`<div id="fun-${result.rank}" class="window">
  <div class="img-blurb"><h3><a href=${result.fourSquarelink}>${result.rank}. ${result.name}</a></h3><div class="image"><span class="rating">${result.rating}</span>
  <img src="${result.imgUrl}" alt="${result.name}"></div>
  <div class="blurb">${result.blurb}</div></div>
  </div>`);
}

function postFourSquareFoodResults(result) {
    $('#js-food-results').append(`<div id="food-${result.rank}" class="window">
    <div class="img-blurb"><h3><a href=${result.fourSquarelink}>${result.rank}. ${result.name}</a></h3><div class="image"><span class="rating">${result.rating}</span>
    <img src="${result.imgUrl}" alt="${result.name}"></div>
    <div class="blurb">${result.blurb}</div></div>
    </div>`);
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
      position: new google.maps.LatLng(location.lat, location.lng),
      icon: iconURL,
      map: map
    });
    google.maps.event.addListener(marker, 'mouseover', (function(marker, location) {
      return function(){
        infowindow.setContent(`<div class="info-window"><img src="${location.imgUrl2}" alt="${location.name}">
        <a href="${location.fourSquarelink}">${location.rank}. ${location.name}</a></div>`);
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

function handleFourSquareData(data, index) {
  return { name: data.venue.name,
    rank: index + 1,
    rating: data.venue.rating,
    blurb: (data.tips ? data.tips[0].text : 'Sorry, nothing to show.'),
    fourSquarelink: (data.tips ? data.tips[0].canonicalUrl : 'does not exist'),
    imgUrl:  (function() {
      if (data.venue.photos.groups.length && data.venue.photos.groups[0].items[0].hasOwnProperty('prefix')) {
        return data.venue.photos.groups[0].items[0].prefix + '150x150' + data.venue.photos.groups[0].items[0].suffix
      }
      else {
        return '//:0'
      }
    })(),
    // (function() {
    //   if (data.venue.photos.groups && data.venue.photos.groups[0].items.length) {
    //     return data.venue.photos.groups[0].items[0].prefix + '150x150' + data.venue.photos.groups[0].items[0].suffix
    //   }
    //   else {
    //     return 'does not exist'
    //   }
    // })(),
    imgUrl2: (function() {
      if (data.venue.photos.groups.length && data.venue.photos.groups[0].items[0].hasOwnProperty('prefix')) {
        return data.venue.photos.groups[0].items[0].prefix + '50x50' + data.venue.photos.groups[0].items[0].suffix
      }
      else {
        return '//:0'
      }
    })(),
    lat: (data.venue.location.labeledLatLngs ? data.venue.location.labeledLatLngs[0].lat : data.venue.location.lat),
    lng:(data.venue.location.labeledLatLngs ? data.venue.location.labeledLatLngs[0].lng : data.venue.location.lng)
  }
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

  Promise.all([callWeather, callFourSquareFun, callFourSquareFood]).catch(error => {
    alert('Sorry, there was an error!  Please check the format and try again' );
    $('#loading').text('Unable to Load.');
    console.log(error);
    throw error;
  })
  .then((responses) => {
    $('#loading').empty();
    console.log(responses[1], responses[2])
    postWeatherResults(responses[0]);
    // postFourSquareFunResults(responses[1]);
    // postFourSquareFoodResults(responses[2]);
    const parsedFunResults = responses[1].response.groups[0].items.splice(0, 10).map(handleFourSquareData);
    const parsedFoodResults = responses[2].response.groups[0].items.splice(0, 10).map(handleFourSquareData);
    console.log(parsedFunResults, parsedFoodResults)
    $('#js-fun-results').empty().append(`<h2>What to Do</h2>`);
    $('#js-food-results').empty().append(`<h2>What to Eat</h2>`);
    parsedFunResults.forEach(postFourSquareFunResults);
    parsedFoodResults.forEach(postFourSquareFoodResults);

    const destinationInput = responses[1].response.geocode.center;
    // const funLocations = responses[1].response.groups[0].items.splice(0, 10).map(function(item, index) {
    //   return [
    //     item.venue.name,
    //     (item.venue.location.labeledLatLngs ? item.venue.location.labeledLatLngs[0].lat : item.venue.location.lat),
    //     (item.venue.location.labeledLatLngs ? item.venue.location.labeledLatLngs[0].lng : item.venue.location.lng),
    //     index + 1,
    //     item.tips[0].canonicalUrl,
    //     item.venue.photos.groups[0].items[0].prefix + '50x50' + item.venue.photos.groups[0].items[0].suffix
    //   ];
    // });
    // const foodLocations = responses[2].response.groups[0].items.splice(0, 10).map(function(item, index) {
    //   return [
    //     item.venue.name,
    //     (item.venue.location.labeledLatLngs ? item.venue.location.labeledLatLngs[0].lat : item.venue.location.lat),
    //     (item.venue.location.labeledLatLngs ? item.venue.location.labeledLatLngs[0].lng : item.venue.location.lng),
    //     index + 1,
    //     item.tips[0].canonicalUrl,
    //     item.venue.photos.groups[0].items[0].prefix + '50x50'+ item.venue.photos.groups[0].items[0].suffix
    //   ];
    // });
    let locationDataByType = {
      fun: {
        objects: parsedFunResults,
        iconURL: 'http://maps.google.com/mapfiles/ms/micons/POI.png'
      },
      food: {
        objects: parsedFoodResults,
        iconURL: 'http://maps.google.com/mapfiles/ms/micons/restaurant.png'
      }
    };
    mapLocations(locationDataByType, destinationInput);
  });
}


function planIt() {
  listenForClick();
  const defaultLocation = {
    city: 'Santa Barbara',
    state: 'CA'
  };
  callAPIs(defaultLocation);
}

//On page load, call the function 'weekender'
$(planIt);
