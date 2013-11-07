
$.noConflict();
jQuery(document).ready(function($) {

  var miMap;

  var map;

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
          map.setView([data.resultado.y, data.resultado.x], 16);
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


  map = new L.Map('map', { 
    center: [20,-20],
    zoom: 3
  })

  L.tileLayer('https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-4xtxp73f/{z}/{x}/{y}.png', {
    attribution: 'Mapbox <a href="http://mapbox.com/about/maps" target="_blank">Terms &amp; Feedback</a>'
  }).addTo(map);

  var layerUrl = 'http://documentation.cartodb.com/api/v2/viz/9af23dd8-ea10-11e2-b5ac-5404a6a683d5/viz.json';

  var sublayers = [];

  var LayerActions = {
    all: function(){
      sublayers[0].setSQL("SELECT * FROM ne_10m_populated_p_2");
      return true;
    },
    capitals: function(){
      sublayers[0].setSQL("SELECT * FROM ne_10m_populated_p_2 WHERE featurecla = 'Admin-0 capital'");
      return true;
    },
    megacities: function(){
      sublayers[0].setSQL("SELECT * FROM ne_10m_populated_p_2 WHERE megacity = 1");
      return true;
    }
  }

  cartodb.createLayer(map, layerUrl)
    .addTo(map)
    .on('done', function(layer) {
      // change the query for the first layer
      var subLayerOptions = {
        sql: "SELECT * FROM ne_10m_populated_p_2",
        cartocss: "#ne_10m_populated_p_2{marker-fill: #F84F40; marker-width: 8; marker-line-color: white; marker-line-width: 2; marker-clip: false; marker-allow-overlap: true;}"
      }

      var sublayer = layer.getSubLayer(0);

      sublayer.set(subLayerOptions);

      sublayers.push(sublayer);
    }).on('error', function() {
      //log the error
    });

    $('.button').click(function() {
      $('.button').removeClass('selected');
      $(this).addClass('selected');
      LayerActions[$(this).attr('id')]();
    });
    
  // miMap = L.map('map', { 
  //   zoomControl: false,
  //   center: [-34.618234674892, -58.404178619384766],
  //   zoom: 12
  // })

  // // add a nice baselayer from mapbox
  // L.tileLayer('http://a.tiles.mapbox.com/v3/pixelbeat.map-pet5vndu/{z}/{x}/{y}.png', {
  //   attribution: 'MapBox'
  // }).addTo(miMap);

  // cartodb.createLayer(miMap, 'http://gcba.cartodb.com/api/v1/viz/bacheo/viz.json', {
  //   query: 'select * from {{table_name}}'

  // }).on('done', function(layer) {
  //   miMap.addLayer(layer);
  //   myLayer = layer;

  //   // layer.on('featureOver', function(e, pos, latlng, data) {
  //   //   cartodb.log.log(e, pos, latlng, data);
  //   // });
  //   layer.infowindow.set('template', $('#infowindow_template').html());

  //   layer.on('error', function(err) {
  //     cartodb.log.log('error: ' + err);
  //   });

  // }).on('error', function() {
  //   cartodb.log.log("some error occurred");
  // });
        
});





