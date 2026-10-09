# CV web · Luis Carlos Solís Rodríguez

Sitio estático (HTML + CSS + JS). Sin build, sin dependencias.

## Probar en local
Abre `index.html` en el navegador, o:
```
npx serve .
```

## Subir a GitHub y Vercel
1. Crea un repo nuevo en GitHub (ej. `cv-web`).
2. En esta carpeta:
```
git init
git add .
git commit -m "CV web inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/cv-web.git
git push -u origin main
```
3. En Vercel: **Add New → Project → Import** el repo. Framework: *Other*. Deploy.
   Cada `git push` redespliega solo.

## Qué editar
- Experiencia (CINDEA): `index.html`, sección `#experiencia`, lista `<ul>`.
- Textos del terminal: atributo `data-lines` en `#termBody`.
- Colores: variables al inicio de `style.css` (`--cyan`, `--violet`, `--green`).
- Foto: reemplaza `assets/foto.jpg` (cuadrada, 640 px).
- Botón "Descargar PDF": usa imprimir del navegador (hay estilos de impresión limpios).
