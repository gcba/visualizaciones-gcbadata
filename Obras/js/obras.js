$(window).load(function() {
  $('.flexslider').flexslider({
    animation: "slide"
  });

  

});




var myLayer;
var map;

function main() {

  // map = L.map('map', { 
  //   zoomControl: false,
  //   center: [-34.618234674892, -58.404178619384766],
  //   zoom: 12
  // })

  // add a nice baselayer from mapbox
  // L.tileLayer('https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-eeoepub0/{z}/{x}/{y}.png', {
  //   attribution: 'MapBox'
  // }).addTo(map);


  cartodb.createVis(
    'map', 
    'http://gcba.cartodb.com/api/v1/viz/bacheo/viz.json',
    {
      zoom: 12
    }).done(function(vis, layers) {

    layer = layers[1]
    myLayer = layer;

    map = vis.getNativeMap();
    
    
    initControls();

    layer.infowindow.set('template', $('#infowindow_template').html());
    layer.infowindow.addField('pretty_st')

    layer.on('featureOver', function(e, pos, latlng, data) {
      cartodb.log.log(e, pos, latlng, data);
    });

    layer.on('error', function(err) {
      cartodb.log.log('error: ' + err);
    });

  })
}

function updateMap() {
  //tipo = $("input[name=radioTipo]:checked").val();
  estado = $("input[name=radioEstado]:checked").val();
  firstDate = $("#datePickerStart").datepicker("getDate");

  lastDate = $("#datePickerEnd").datepicker("getDate")
  //tipo_sql = ""

  // switch(tipo)
  // {
  // 	case 'calle':
  // 		tipo_sql = " AND clase = 'CALZADA'";
  // 		break;
  // 	case 'vereda':
  // 		tipo_sql = " AND clase = 'ACERA'";
  // 		break;
  // }

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
  	case 'insepeccionado':
  		estado_sql = " AND estado = 'INSP'"
  		break;
  }
  sql = "select * from " + 
  		myLayer.options.table_name + 
  		" where " +
  		"date_end >= '" + firstDate.toUTCString() + 
  		"' and date_st <= '" + lastDate.toUTCString() + "'" +
  		//tipo_sql +
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

/* Inicialización en español para la extensión 'UI date picker' para jQuery. */
/* Traducido por Vester (xvester@gmail.com). */
(function($) {
        $.datepicker.regional['es'] = {
                renderer: $.ui.datepicker.defaultRenderer,
                monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
                monthNamesShort: ['Ene','Feb','Mar','Abr','May','Jun',
                'Jul','Ago','Sep','Oct','Nov','Dic'],
                dayNames: ['Domingo','Lunes','Martes','Mi&eacute;rcoles','Jueves','Viernes','S&aacute;bado'],
                dayNamesShort: ['Dom','Lun','Mar','Mi&eacute;','Juv','Vie','S&aacute;b'],
                dayNamesMin: ['Do','Lu','Ma','Mi','Ju','Vi','S&aacute;'],
                dateFormat: 'dd/mm/yy',
                firstDay: 1,
                prevText: '&#x3c;Ant', prevStatus: '',
                prevJumpText: '&#x3c;&#x3c;', prevJumpStatus: '',
                nextText: 'Sig&#x3e;', nextStatus: '',
                nextJumpText: '&#x3e;&#x3e;', nextJumpStatus: '',
                currentText: 'Hoy', currentStatus: '',
                todayText: 'Hoy', todayStatus: '',
                clearText: '-', clearStatus: '',
                closeText: 'Cerrar', closeStatus: '',
                yearStatus: '', monthStatus: '',
                weekText: 'Sm', weekStatus: '',
                dayStatus: 'DD d MM',
                defaultStatus: '',
                isRTL: false
        };
        $.extend($.datepicker.defaults, $.datepicker.regional['es']);
        
})(jQuery);



function initControls() {

	var sql = new cartodb.SQL({ user: 'gcba' });
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
	sql.execute("SELECT MIN (date_st), MAX (date_end) FROM bacheo")
	
	.done(function(data) {
	  	var minDate = new Date(Date.parse(data.rows[0].min));
	  	var one_day = 1000*60*60*24;
  		var maxDate = new Date(Date.parse(data.rows[0].max));
                var now = new Date()
                var minus = Math.ceil((now-minDate)/one_day)
                var max = Math.ceil((maxDate-now)/one_day)
  		var max_days = Math.ceil((maxDate-minDate)/one_day)

  		$("#datePickerStart").datepicker({ defaultDate: -minus, minDate: -minus, maxDate: max});
		$("#datePickerStart").datepicker( "setDate", minDate );
    $("#datePickerStart" ).datepicker( "option", $.datepicker.regional[ "es" ] );
    
		$("#datePickerStart").change(function(eventData) {
			updateSlider(minDate);
			updateMap();
		});

		$("#datePickerEnd").datepicker({ defaultDate: max, minDate: -minus, maxDate: max});
		$("#datePickerEnd").datepicker( "setDate", maxDate);
    $("#datePickerEnd" ).datepicker( "option", $.datepicker.regional[ "es" ] );
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


    $('#radioset-estado label').tooltip();

    $('.explicacion a').tooltip();

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

