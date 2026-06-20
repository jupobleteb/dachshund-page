# Club de las Salchichas 🌭

Página tierna e informativa sobre perros salchicha (dachshund): historia, salud,
una **trivia con dos niveles** (Dueños y Veterinarios) y un **mini-juego** donde
tu perro se hace cada vez más largo. Hecha en HTML/CSS/JS puro, sin dependencias,
lista para GitHub Pages.

## Estructura

```
index.html        Estructura y secciones
css/styles.css    Diseño tierno y colorido + responsive
js/main.js        Length-o-meter (scroll), nav móvil, animaciones
js/trivia.js      Trivia con modos Dueños (15) y Veterinarios (15, nivel clínico)
js/game.js        Juego "Salta Salchicha" en canvas
```

## Ver en local

Abre `index.html` en el navegador, o levanta un servidor simple:

```bash
python3 -m http.server 8000
# luego abre http://localhost:8000
```

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub y sube estos archivos:
   ```bash
   git init
   git add .
   git commit -m "Club de las Salchichas"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```
2. En GitHub: **Settings → Pages**.
3. En *Source* elige **Deploy from a branch**, rama `main`, carpeta `/ (root)`.
4. Guarda. En 1–2 minutos tu página estará en:
   `https://TU_USUARIO.github.io/TU_REPO/`

¡Comparte el enlace con tus amigos salchicheros! 🐾

> Página informativa de fans. No reemplaza la opinión de tu veterinario.
