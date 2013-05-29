
$.noConflict();
jQuery(document).ready(function($) {

  var myLayer;
  var miMap;

  var closeBanner = function() {
    $('.banner').css('display', 'none'); 
  }
  
  var ac = new usig.AutoCompleter('input-dir', {
    afterGeoCoding: function(pt) {
      $.ajax({
        url: 'http://ws.usig.buenosaires.gob.ar/rest/convertir_coordenadas?x='+ pt.getX() +'&y=' + pt.getY() + '&output=lonlat',
        dataType: 'jsonp'
      }).done(function(data){
          closeBanner();
          miMap.setView([data.resultado.y, data.resultado.x], 18);
      });
    }
  });

  $('.flexslider').flexslider({animation: "slide"});
  
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

    layer.on('error', function(err) {
      cartodb.log.log('error: ' + err);
    });

  }).on('error', function() {
    cartodb.log.log("some error occurred");
  });
        
});





