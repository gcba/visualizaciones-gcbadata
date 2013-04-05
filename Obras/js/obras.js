
var myLayer;
var map;

function main() {

  map = L.map('map', { 
    zoomControl: false,
    center: [-34.618234674892, -58.404178619384766],
    zoom: 12
  })

  // add a nice baselayer from mapbox
  L.tileLayer('http://a.tiles.mapbox.com/v3/pixelbeat.map-pet5vndu/{z}/{x}/{y}.png', {
    attribution: 'MapBox'
  }).addTo(map);

  cartodb.createLayer(map, 'http://tataka.cartodb.com/api/v1/viz/12556/viz.json', {
    query: 'select * from {{table_name}}'

  }).on('done', function(layer) {
    map.addLayer(layer);
    myLayer = layer;
    initControls();


    layer.on('featureOver', function(e, pos, latlng, data) {
      cartodb.log.log(e, pos, latlng, data);
    });

    layer.on('error', function(err) {
      cartodb.log.log('error: ' + err);
    });

  }).on('error', function() {
    cartodb.log.log("some error occurred");
  });
}

function updateMap() {
  tipo = $("input[name=radioTipo]:checked").val();
  estado = $("input[name=radioEstado]:checked").val();
  firstDate = $("#datePickerStart").datepicker("getDate");
  lastDate = $("#datePickerEnd").datepicker("getDate")
  tipo_sql = ""
  switch(tipo)
  {
  	case 'calle':
  		tipo_sql = " AND clase = 'CALZADA'";
  		break;
  	case 'vereda':
  		tipo_sql = " AND clase = 'ACERA'";
  		break;
  }

  estado_sql = ""
  switch(estado)
  {
  	case 'ejecutado':
  		estado_sql = " AND status = 'EJEC'"
  		break;
  	case 'verificado':
  		estado_sql = " AND status = 'VERI'"
  		break;
  	case 'iniciado':
  		estado_sql = " AND status = 'INIC'"
  		break;
  	case 'finalizado':
  		estado_sql = " AND status = 'TFIN'"
  		break;
  	case 'insepeccionado':
  		estado_sql = " AND status = 'INSP'"
  		break;
  	case 'denegado':
  		estado_sql = " AND status = 'DENE'"
  		break;
  }
  sql = "select * from " + 
  		myLayer.options.table_name + 
  		" where " +
  		"date_end < '" + lastDate.toUTCString() + 
  		"' and date_st > '" + firstDate.toUTCString() + "'" +
  		tipo_sql +
  		estado_sql 
      myLayer.setQuery( sql)
}

function updateSlider(minDate) {
  one_day = 1000*60*60*24
  firstDate = $("#datePickerStart").datepicker("getDate");
  lastDate = $("#datePickerEnd").datepicker("getDate")
  $("#slider-range").slider("values", 0, Math.ceil((new Date(firstDate) - minDate)/one_day))
  $("#slider-range").slider("values", 1, Math.ceil((new Date(lastDate) - minDate)/one_day))
}

// you could use $(window).load(main);
window.onload = main;


function initControls() {

	var sql = new cartodb.SQL({ user: 'gcbadata' });
	var coords = {
		"comuna-all":[[-34.618234674892, -58.404178619384766],12],
		"comuna-2":[[-34.586237270093079,-58.395217792415608],14],
		"comuna-5":[[-34.617350525637796,-58.420606574780031],14],
		"comuna-6":[[-34.616825186030511,-58.443603279618749],14],
		"comuna-7":[[-34.636536531689949,-58.451923117924601],14],
		"comuna-9":[[-34.651720387872778,-58.499097139247077],14],
		"comuna-10":[[-34.627819642674119,-58.50287233034566],14],
		"comuna-11":[[-34.6060970617606,-58.496878676242396],14],
		"comuna-12":[[-34.566316140740597,-58.490428047774479],14],
		"comuna-14":[[-34.573901590522794,-58.422434896459286],14],
		"comuna-3":[[-34.613824541269658,-58.402684826383954],14],
		"comuna-15":[[-34.591865572590308,-58.462810196185515],14],
		"comuna-8":[[-34.674457001475545,-58.462180158010675],14],
		"comuna-4":[[-34.642288664610525,-58.388842544531947],14],
		"comuna-1":[[-34.6063224902313,-58.371693887275981],14],
		"comuna-13":[[-34.554665199180789,-58.454152403904935],14],
	};
	sql.execute("SELECT MIN (START_TS) FROM plan_de_obras")
	
	.done(function(data) {
	  	var minDate = new Date(Date.parse(data.rows[0].min));
	  	var one_day = 1000*60*60*24;
  		var timeNow = new Date();
  		var max_days = Math.ceil((timeNow-minDate)/one_day)

  		$("#datePickerStart").datepicker({ defaultDate: -max_days, minDate: -max_days, maxDate: 0});
		$("#datePickerStart").datepicker( "setDate", minDate );
		$("#datePickerStart").change(function(eventData) {
			updateSlider(minDate);
			updateMap();
		});

		$("#datePickerEnd").datepicker({ defaultDate: 0, minDate: -max_days, maxDate: 0});
		$("#datePickerEnd").datepicker( "setDate", timeNow);
		$("#datePickerEnd").change(function(eventData) {
			updateSlider(minDate);
			updateMap();
		});

		$('#radioset-tipo').buttonset();
		$('#radioset-tipo').change(updateMap);

		$('#radioset-estado').buttonset();
		$('#radioset-estado').change(updateMap);

		$('#comunas ul li').click(function(e) {
			comuna_key = e.currentTarget.id
			comuna = coords[comuna_key]
			map.setView(comuna[0], comuna[1])
			title = e.currentTarget.children[0].children[0].innerHTML
			$('#comunas button:first-child').html(comuna_key)
			e.preventDefault();
		});

		

		$( "#slider-range" ).slider({
			range: true,
			min: 0,
			max: max_days,
			values: [ 0, max_days ],
			slide: function(event, ui) {
			  	setMinDate = new Date(minDate.getTime() + ui.values[0]*24*60*60*1000);
			  	setMaxDate = new Date(minDate.getTime() + ui.values[1]*24*60*60*1000);
			  	$("#datePickerStart").datepicker( "setDate", setMinDate);
				$("#datePickerEnd").datepicker( "setDate", setMaxDate);
			},
			stop: updateMap,
		});
	})
	.error(function(errors) {
	  // errors contains a list of errors
	  console.log("error:" + err);
	})

}

