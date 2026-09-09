# Control de Artes de Empaque

Versión web estática inspirada en el sistema de seguimiento de Aprobación de Artes de Empaque.

## Funciones
- Seguimiento de registros.
- Dashboard de indicadores.
- Búsqueda y filtros.
- Alta, edición y eliminación de registros.
- Semáforo de estados y vencimientos.
- Análisis por área/responsable.
- Importación de Excel (.xlsx, .xls, .csv).
- Exportación a Excel.
- Persistencia local en el navegador mediante localStorage.

## Publicar en GitHub Pages
1. Crear un repositorio en GitHub.
2. Subir `index.html`, `styles.css` y `app.js`.
3. En Settings → Pages, seleccionar la rama principal y `/root`.
4. Guardar y esperar el despliegue.

## Importante
Esta versión no usa una base de datos compartida: los datos quedan guardados en el navegador de cada usuario. Para trabajo multiusuario en tiempo real se recomienda conectar Supabase/Firebase o un backend.

El lector de Excel usa SheetJS desde CDN.
