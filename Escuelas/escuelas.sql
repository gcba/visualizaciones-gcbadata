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