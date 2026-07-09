# Captacion de clientes Rakium

## Enfoque recomendado

La seccion nueva del admin debe tratar prospectos como una entidad propia, separada de clientes reales. Un lead puede venir de Google Places, Google Search, Instagram, carga manual o CSV, y recien pasa a `Client` cuando hay una oportunidad concreta.

## Fuentes

1. Google Places: barrido por ciudad y rubro para conseguir nombre, direccion, telefono, web, ubicacion y link a Maps.
2. Instagram: revision posterior del perfil para detectar si existe, si esta descuidado, si publica poco o si no tiene link claro.
3. Google Search manual/asistido: busquedas del tipo `site:instagram.com "Necochea" "restaurante"` o `"Tandil" "sin pagina web" rubro`.
4. Carga manual: para locales vistos por navegador, referencias o caminatas comerciales.

## Rubros iniciales

Restaurantes, cafes, bares, hoteles, turismo, inmobiliarias, gimnasios, estetica, peluquerias, odontologos, veterinarias, indumentaria, mueblerias, ferreterias, corralones, concesionarias, talleres, panaderias, estudios juridicos y profesionales.

## Score comercial

Prioridad alta:

- No tiene sitio web.
- Tiene Instagram pero sin identidad clara, sin highlights utiles o con publicaciones viejas.
- Tiene telefono y ubicacion confirmada.
- Es rubro con alta conversion visual: gastronomia, estetica, turismo, gimnasios, inmobiliarias, retail.

Prioridad media:

- Tiene web vieja o lenta.
- Tiene Instagram activo pero sin landing, catalogo o pauta.
- Tiene varios locales o buena ubicacion.

Prioridad baja:

- Sitio actual bueno, redes cuidadas o marca grande.

## Flujo operativo

1. Importar leads desde Places con `npm run prospect:places -- --out leads-necochea-tandil.json`.
2. Revisar la lista en `/admin/leads`.
3. Enriquecer Instagram/web mala desde navegador.
4. Mandar mensaje inicial por Instagram.
5. Marcar `IG enviado`.
6. En cada pasada, actualizar `Respondio`, `Reunion`, `Perdido` o programar follow-up.

## Automatizacion posible

Con una key de Google Places activa, se puede correr el script de forma diaria/semanal y hacer upsert por `source + sourceId`. Para Instagram conviene empezar semiautomatico desde navegador, porque automatizar mensajes masivos puede disparar bloqueos o limites de la cuenta.
