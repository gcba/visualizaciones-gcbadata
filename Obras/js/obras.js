
$.noConflict();
jQuery(document).ready(function($) {

  var myLayer;
  var miMap;

  $('#banner-container').html($('#banner_template').html());


  var closeBanner = function() {
    $('#banner-container').empty();
    $('#banner-container').html($('#banner_template').html());
    
    var banner = $('.banner');
    banner.removeClass('banner');
    banner.addClass('banner-aside');
    
    $('.flexslider').flexslider({
      slideshow: false,
      startAt: 3
    });
    
    var ac = new usig.AutoCompleter('input-dir', {
      afterGeoCoding: function(pt) {
        changeZoom(pt);
      } 
    });
    
  }

  var changeZoom = function (pt) {
    if ( typeof pt.getX === 'function' )
    {
      $.ajax({
        url: 'http://ws.usig.buenosaires.gob.ar/rest/convertir_coordenadas?x='+ pt.getX() +'&y=' + pt.getY() + '&output=lonlat',
        dataType: 'jsonp'
      }).done(function(data){
          miMap.setView([data.resultado.y, data.resultado.x], 18);
          var geo = new usig.GeoCoder();
          geo.reverseGeoCoding(data.resultado.x, data.resultado.y, function (data) {
            
          }); 
      });
      return true;
    }
    return false;
  }

  
  var ac = new usig.AutoCompleter('input-dir', {
    afterGeoCoding: function(pt) {
      if ( changeZoom(pt) ) {
        closeBanner();
      }
    }
  });

  $('.flexslider').flexslider({
    animation: "slide",
    pauseOnHover: true,
    startAt: 0,
    slideshow: true
  });
  
  $('.close').click(function(){ 
    $('.banner').css('display', 'none'); 
  });

  miMap = L.map('map', { 
    zoomControl: false,
    center: [-34.618234674892, -58.404178619384766],
    zoom: 12
  })

  // add a nice baselayer from mapbox
  L.tileLayer('http://a.tiles.mapbox.com/v3/pixelbeat.map-pet5vndu/{z}/{x}/{y}.png', {
    attribution: 'MapBox'
  }).addTo(miMap);

  cartodb.createLayer(miMap, 'http://gcba.cartodb.com/api/v1/viz/bacheo/viz.json', {
    query: 'select * from {{table_name}}'

  }).on('done', function(layer) {
    miMap.addLayer(layer);
    myLayer = layer;

    // layer.on('featureOver', function(e, pos, latlng, data) {
    //   cartodb.log.log(e, pos, latlng, data);
    // });
    layer.infowindow.set('template', $('#infowindow_template').html());

    layer.on('error', function(err) {
      cartodb.log.log('error: ' + err);
    });

  }).on('error', function() {
    cartodb.log.log("some error occurred");
  });
        
});





