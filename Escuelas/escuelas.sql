UPDATE mapa_escuelas_con_registros 
SET inscriptos= data.insc 
FROM (
SELECT nombre, count(*) insc FROM mapa_escuelas_con_registros
GROUP BY nombre) AS data
WHERE mapa_escuelas_con_registros.nombre=data.nombre

SELECT nombre, nivel_desc, count(*) FROM mapa_escuelas_con_registros GROUP BY nombre, nivel_desc ORDER BY nombre, nivel_desc

SELECT the_geom, st_x(the_geom) lng, st_y(the_geom) lat, ciudad, count(*) as cnt FROM tmdg WHERE the_geom IS NOT NULL GROUP BY ciudad, the_geom

SELECT cartodb_id, the_geom_webmercator, nombre, nivel_desc, count(*) as cnt FROM mapa_escuelas_con_registros GROUP BY cartodb_id, the_geom_webmercator, nombre, nivel_desc ORDER BY nombre, nivel_desc

SELECT nivel_desc, count(*) as cnt FROM mapa_escuelas_con_registros GROUP BY nivel_desc ORDER BY nivel_desc

SELECT the_geom, st_x(the_geom) lng, st_y(the_geom) lat, nivel_desc, count(*) as cnt FROM mapa_escuelas_con_registros WHERE the_geom IS NOT NULL GROUP BY nivel_desc, the_geom

SELECT DISTINCT nivel_desc, modalidad_desc FROM mapa_escuelas_con_registros 
ORDER BY nivel_desc

SELECT * FROM mapa_escuelas_con_registros WHERE modalidad_desc IN ('')

# Sumarizo columna 'gradosala_desc' con el nombre 'total_grado'

UPDATE mapa_escuelas_con_registros 
SET total_grado=data.total_grado 
FROM (
SELECT nombre, gradosala_desc, count(*) total_grado FROM mapa_escuelas_con_registros
GROUP BY nombre, gradosala_desc) AS data
WHERE mapa_escuelas_con_registros.gradosala_desc=data.gradosala_desc


# Sumarizo columna 'barriodescripcion' con el nombre 'total_barrio'

UPDATE mapa_escuelas_con_registros 
SET total_barrio=data.total_barrio 
FROM (
SELECT barriodescripcion, count(*) total_barrio FROM mapa_escuelas_con_registros
GROUP BY barriodescripcion) AS data
WHERE mapa_escuelas_con_registros.barriodescripcion=data.barriodescripcion


# Sumarizo columna 'comunadescripcion' con el nombre 'total_comuna'

UPDATE mapa_escuelas_con_registros 
SET total_comuna=data.total_comuna 
FROM (
SELECT comunadescripcion, count(*) total_comuna FROM mapa_escuelas_con_registros
GROUP BY comunadescripcion) AS data
WHERE mapa_escuelas_con_registros.comunadescripcion=data.comunadescripcion


SELECT count(*) FROM (SELECT nombre, count(*) FROM(SELECT distinct nombre, modalidad_desc FROM mapa_escuelas_con_registros
order by nombre) as data
GROUP BY nombre) as data1
WHERE count>1

SELECT nombre, modalidad_desc, count(*) FROM mapa_escuelas_con_registros
GROUP BY nombre, modalidad_desc
ORDER BY nombre, modalidad_desc


SELECT mapa_escuelas_con_registros.*, escuelas_modalidad.count incriptos_modalidad FROM mapa_escuelas_con_registros, escuelas_modalidad 
WHERE mapa_escuelas_con_registros.nombre= escuelas_modalidad.nombre and mapa_escuelas_con_registros.modalidad_desc= escuelas_modalidad.modalidad_desc

http://fotos.usig.buenosaires.gob.ar//getFoto?smp=35-009A-0FRA
