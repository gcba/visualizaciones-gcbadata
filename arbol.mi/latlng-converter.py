#!/usr/bin/python
# -*- coding: utf-8 -*-

import slumber
from cartodb import CartoDBAPIKey, CartoDBException
import urllib2

api = slumber.API("http://ws.usig.buenosaires.gob.ar/rest/")
user =  'gcba'
API_KEY ='5ebd92316d11854603dd60b67019350c7412de80'
cartodb_domain = 'gcba'
cl = CartoDBAPIKey(API_KEY, cartodb_domain)
batch_size = 100

# 
# print answer['resultado']['y']
# print answer['resultado']['x']

answer = cl.sql('SELECT cartodb_id, latitude, longitude, coord_x, coord_y FROM censo_arbolado_recoleta')
batch_sql = ""
batch_count = 0
for row in answer['rows']:
	batch_count += 1
	if not row['latitude']:
		usig_answer = api.convertir_coordenadas.get(x= row['coord_x'], y= row['coord_y'], output='lonlat')
		lng = usig_answer['resultado']['x']
		lat = usig_answer['resultado']['y']
		sql_text = "UPDATE censo_arbolado_recoleta SET longitude='%s', latitude='%s' WHERE cartodb_id = %s ;" % (
			lng, lat, row['cartodb_id']);
		print sql_text
		batch_sql += sql_text
	if batch_count % batch_size == 0 and batch_sql:
		cl.sql(batch_sql)
		batch_sql = ''

# def parseLine(line):
# 	columns = line.split(',')
# 	return "INSERT INTO bacheo_prueba (id,codigo,tipo_c,orden,ubicacion,estado,date_st,date_end,tiempo_obra,the_geom) VALUES (%s,%s,'%s',%s,'%s','%s','%s',%s,%s,%s)" % (
# 			'1',
# 			'1',
# 			'a',
# 			columns[1],
# 			columns[12],
# 			columns[2],
# 			columns[4],
# 			"'" + columns[5] + "'" if columns[5] != 'None' else 'NULL',
# 			'0',
# 			columns[14].replace('POINT', 'ST_MAKEPOINT')
# 			)


# try:
# 	cl.sql('Truncate bacheo_prueba')
#   #   urlfile = urllib2.urlopen("http://epok.buenosaires.gov.ar/mayep/exportCAREs/");
#   #   firstLine = True
#   #   for line in urlfile:
#   #   	if firstLine:
#   #   		firstLine = False
#   #   		continue;
# # cl.sql(parseLine(line) )
# # break
# 	myline = "1,6001504,EJEC,Obra en Ejecución,2013-04-24,None,,,11.A.Cierre de Aperturas de Servicios Publicos,,0,B-VP-02106-00501-PAR,BOULOGNE SUR MER 502-600 Acera Par,POINT (105195.2509049999935087 102768.6409929999936139),POINT (-34.6042989999999975 -58.4066630000000018),BOULOGNE SUR MER 502,20130502154712"
# 	sql_line = parseLine(myline)
# 	print sql_line
# 	cl.sql(sql_line)
# except CartoDBException as e:
#     print ("some error ocurred", e)


