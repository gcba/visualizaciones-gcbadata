
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

  cartodb.createLayer(map, 'http://gcbadata.cartodb.com/api/v1/viz/16866/viz.json', {
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
  		tipo_sql = " AND tipo = 'CALLE'";
  		break;
  	case 'vereda':
  		tipo_sql = " AND tipo = 'VEREDA'";
  		break;
  }

  estado_sql = ""
  switch(estado)
  {
  	case 'ejecutado':
  		estado_sql = " AND estado = 'EJEC'"
  		break;
  	case 'verificado':
  		estado_sql = " AND estado = 'VERI'"
  		break;
  	case 'iniciado':
  		estado_sql = " AND estado = 'INIC'"
  		break;
  }
  sql = "select * from " + 
  		myLayer.options.table_name + 
  		" where " +
  		"end_ts < '" + lastDate.toUTCString() + 
  		"' and start_ts > '" + firstDate.toUTCString() + "'" +
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


		$("#comuna-all").click(function(e){
			map.setView([-34.618234674892, -58.404178619384766], 12);
			e.preventDefault();
		});	
		$("#comuna-2").click(function(e){
			map.setView([-34.586237270093079,-58.395217792415608], 14);
			e.preventDefault();
		});
		$("#comuna-5").click(function(e){
			map.setView([-34.617350525637796,-58.420606574780031], 14);
			e.preventDefault();
		});
		$("#comuna-6").click(function(e){
			map.setView([-34.616825186030511,-58.443603279618749], 14);
			e.preventDefault();
		});
		$("#comuna-7").click(function(e){
			map.setView([-34.636536531689949,-58.451923117924601], 14);
			e.preventDefault();
		});
		$("#comuna-9").click(function(e){
			map.setView([-34.651720387872778,-58.499097139247077], 14);
			e.preventDefault();
		});
		$("#comuna-10").click(function(e){
			map.setView([-34.627819642674119,-58.50287233034566], 14);
			e.preventDefault();
		});
		$("#comuna-11").click(function(e){
			map.setView([-34.6060970617606,-58.496878676242396], 14);
			e.preventDefault();
		});
		$("#comuna-12").click(function(e){
			map.setView([-34.566316140740597,-58.490428047774479], 14);
			e.preventDefault();
		});
		$("#comuna-14").click(function(e){
			map.setView([-34.573901590522794,-58.422434896459286], 14);
			e.preventDefault();
		});
		$("#comuna-3").click(function(e){
			map.setView([-34.613824541269658,-58.402684826383954], 14);
			e.preventDefault();
		});
		$("#comuna-15").click(function(e){
			map.setView([-34.591865572590308,-58.462810196185515], 14);
			e.preventDefault();
		});
		$("#comuna-8").click(function(e){
			map.setView([-34.674457001475545,-58.462180158010675], 14);
			e.preventDefault();
		});
		$("#comuna-4").click(function(e){
			map.setView([-34.642288664610525,-58.388842544531947], 14);
			e.preventDefault();
		});
		$("#comuna-1").click(function(e){
			map.setView([-34.6063224902313,-58.371693887275981], 14);
			e.preventDefault();
		});
		$("#comuna-13").click(function(e){
			map.setView([-34.554665199180789,-58.454152403904935], 14);
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

