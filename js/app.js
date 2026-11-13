import { iniciales } from './datos.js';

const pantalla = document.querySelector('#pantalla');
const campos = [
    'nombre',
    'tipo',
    'descripcion',
    'altura',
    'peso',
    'generacion',
    'hp',
    'ataque',
    'velocidad',
    'defensa',
    'habilidad',
    'tieneEvolucion',
    'evolucion',
    'nivelEvolucion',
    'rareza',
    'imagen',
    'sonido',
    'shiny',
    'imagenShiny'
];

let pokemones = JSON.parse(localStorage.getItem('pokemones')) || iniciales;

let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [
    {
        id: 1,
        nombre: 'Administrador',
        email: 'admin@pokeapp.com',
        username: 'admin',
        password: '1234',
        avatar: '',
        admin: true
    }
];

let usuario = JSON.parse(localStorage.getItem('sesion')) || null;

let turno = 0;
let busqueda = '';
let shinyActivo = false;

// GUARDAR DATOS

function guardar() {
    localStorage.setItem('pokemones', JSON.stringify(pokemones));
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

// LIMPIAR TEXTOS

function limpiar(texto) {
    return String(texto ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

// ACTUALIZAR MENÚ

function actualizarMenu() {
    document.querySelector('#botonAdmin').hidden = !usuario?.admin;
    document.querySelector('#salir').hidden = !usuario;

    document.querySelector('#saludo').textContent = usuario
        ? 'Hola, ' + usuario.nombre
        : 'Visitante';
}

// MOSTRAR PÁGINAS

function mostrar(pagina) {
    actualizarMenu();

    if (pagina === 'inicio') {
        pantalla.innerHTML = `
            <section class="hero">
                <div>
                    <span class="eyebrow">✦ TU AVENTURA COMIENZA ACÁ</span>

                    <h1>Un pequeño mundo<br>lleno de Pokémon ♡</h1>

                    <p>
                        Explorá tu Pokédex, descubrí datos de tus favoritos
                        y jugá una batalla donde vos elegís qué pasa.
                    </p>

                    <div class="hero-actions">
                        <button data-pagina="pokedex">
                            Explorar Pokédex →
                        </button>

                        <button class="secondary" data-pagina="batalla">
                            ⚔️ Jugar batalla
                        </button>
                    </div>

                    <div class="stats">
                        ✿ ${pokemones.length} Pokémon disponibles
                        &nbsp; ✦ Elegí tu aventura
                    </div>
                </div>

                <div class="hero-art">
                    <img
                        src="${limpiar(pokemones.find(p => p.id === 25)?.imagen || pokemones[0]?.imagen || '')}"
                        alt="Pokémon destacado"
                    >
                </div>
            </section>
        `;
    }

    if (pagina === 'pokedex') {
        verPokedex();
    }

    if (pagina === 'login') {
        formularioLogin();
    }

    if (pagina === 'registro') {
        formularioRegistro();
    }

    if (pagina === 'carga') {
        formularioPokemon();
    }

    if (pagina === 'batalla') {
        batalla(0);
    }
}

// POKEDEX

function verPokedex() {
    const lista = pokemones.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    pantalla.innerHTML = `
        <div class="section-head">
            <div>
                <span class="eyebrow">COLECCIÓN ✦</span>
                <h2>Mi Pokédex</h2>
                <p>Elegí un Pokémon para conocerlo mejor.</p>
            </div>

            <input
                class="buscador"
                id="buscar"
                placeholder="🔎 Buscar por nombre..."
                value="${limpiar(busqueda)}"
                aria-label="Buscar Pokémon"
            >
        </div>

        <div class="tarjetas">
            ${lista.map(p => `
                <article class="tarjeta">
                    <div class="foto">
                        <img
                            src="${limpiar(p.imagen)}"
                            alt="${limpiar(p.nombre)}"
                            loading="lazy"
                        >
                    </div>

                    <p class="numero">N.º ${p.id}</p>

                    <h3>${limpiar(p.nombre)}</h3>

                    <p>
                        ✦ ${limpiar(p.tipo.join(' / '))}
                        · ${limpiar(p.rareza)}
                    </p>

                    <button data-detalle="${p.id}">
                        Ver detalles ♡
                    </button>
                </article>
            `).join('')}
        </div>

        ${lista.length ? '' : '<p>No encontramos Pokémon con ese nombre.</p>'}
    `;

    const buscar = document.querySelector('#buscar');

    buscar.addEventListener('input', () => {
        const inicio = buscar.selectionStart;

        busqueda = buscar.value;

        verPokedex();

        const nuevo = document.querySelector('#buscar');

        nuevo.focus();
        nuevo.setSelectionRange(inicio, inicio);
    });
}

// DETALLES DEL POKEMON

function verDetalle(id) {
    const p = pokemones.find(x => x.id === id);

    if (!p) {
        return mostrar('pokedex');
    }

    shinyActivo = false;

    pintarDetalle(p);
}

function pintarDetalle(p) {
    const foto = shinyActivo && p.imagenShiny
        ? p.imagenShiny
        : p.imagen;

    pantalla.innerHTML = `
        <div class="caja detalle">

            <button class="secondary" data-pagina="pokedex">
                ← Volver
            </button>

            <div class="detalle-top">

                <img
                    src="${limpiar(foto)}"
                    alt="${limpiar(p.nombre)}"
                >

                <div>
                    <span class="eyebrow">
                        POKÉMON N.º ${p.id}
                    </span>

                    <h2>${limpiar(p.nombre)} ✦</h2>

                    <p>${limpiar(p.descripcion)}</p>

                    <p>
                        🌸 ${limpiar(p.tipo.join(' · '))}
                        &nbsp; · &nbsp;
                        ${limpiar(p.rareza)}
                    </p>

                    ${p.shiny && p.imagenShiny ? `
                        <button
                            class="secondary"
                            data-shiny="${p.id}"
                        >
                            ${shinyActivo
                                ? 'Ver versión normal'
                                : '✨ Ver versión shiny'}
                        </button>
                    ` : ''}
                </div>

            </div>

            <div class="datos">

                ${[
                    ['Altura', p.altura + ' m'],
                    ['Peso', p.peso + ' kg'],
                    ['Generación', p.generacion],
                    ['HP', p.hp],
                    ['Ataque', p.ataque],
                    ['Defensa', p.defensa],
                    ['Velocidad', p.velocidad],
                    ['Habilidad', p.habilidad],
                    [
                        'Evolución',
                        p.tieneEvolucion
                            ? `${p.evolucion || 'Sin especificar'}${p.nivelEvolucion ? ' (nivel ' + p.nivelEvolucion + ')' : ''}`
                            : 'No tiene'
                    ],
                    ['Shiny', p.shiny ? 'Sí' : 'No']
                ].map(d => `
                    <div class="dato">
                        <b>${d[0]}</b>
                        ${limpiar(d[1])}
                    </div>
                `).join('')}

            </div>

            ${p.sonido ? `
                <p>
                    🔊 Sonido
                    <audio controls src="${limpiar(p.sonido)}"></audio>
                </p>
            ` : ''}

        </div>
    `;
}

// INICIAR SESIÓN

function formularioLogin() {
    pantalla.innerHTML = `
        <div class="caja">

            <h2>Iniciar sesión</h2>

            <form id="login">

                <label>
                    Usuario
                    <input name="username" required>
                </label>

                <label>
                    Contraseña
                    <input
                        name="password"
                        type="password"
                        required
                    >
                </label>

                <button>Ingresar</button>

            </form>

            <p id="aviso" class="mensaje"></p>

        </div>
    `;
}

// REGISTRO

function formularioRegistro() {
    pantalla.innerHTML = `
        <div class="caja">

            <h2>Registrarse</h2>

            <form id="registro">

                <label>
                    Nombre
                    <input name="nombre" required>
                </label>

                <label>
                    Email
                    <input name="email" type="email" required>
                </label>

                <label>
                    Usuario
                    <input name="username" required>
                </label>

                <label>
                    Contraseña
                    <input
                        name="password"
                        type="password"
                        required
                    >
                </label>

                <label>
                    URL del avatar (opcional)
                    <input name="avatar">
                </label>

                <button>Crear usuario</button>

            </form>

            <p id="aviso" class="mensaje"></p>

        </div>
    `;
}

// AGREGAR POKEMON

function formularioPokemon() {
    if (!usuario?.admin) {
        pantalla.innerHTML = '<p>Solo el administrador puede entrar.</p>';
        return;
    }

    let html = `
        <div class="caja">
            <h2>Agregar Pokémon</h2>
            <form id="nuevoPokemon">
    `;

    for (const campo of campos) {

        if (campo === 'tieneEvolucion' || campo === 'shiny') {
            html += `
                <label>
                    ${campo}

                    <select name="${campo}">
                        <option value="true">Sí</option>
                        <option value="false">No</option>
                    </select>
                </label>
            `;
        }

        else if (campo === 'descripcion') {
            html += `
                <label>
                    Descripción
                    <textarea name="descripcion" required></textarea>
                </label>
            `;
        }

        else {
            const numero = [
                'altura',
                'peso',
                'generacion',
                'hp',
                'ataque',
                'velocidad',
                'defensa',
                'nivelEvolucion'
            ].includes(campo);

            const opcional = [
                'sonido',
                'imagenShiny',
                'evolucion',
                'nivelEvolucion'
            ].includes(campo);

            html += `
                <label>
                    ${campo}
                    ${campo === 'tipo' ? '(separados por coma)' : ''}

                    <input
                        name="${campo}"
                        ${numero
                            ? `type="number" min="0" step="${['altura', 'peso'].includes(campo) ? '0.1' : '1'}"`
                            : ''}
                        ${opcional ? '' : 'required'}
                    >
                </label>
            `;
        }
    }

    html += `
            <button>Guardar Pokémon</button>
        </form>

        <p id="aviso" class="mensaje"></p>
        </div>
    `;

    pantalla.innerHTML = html;
}

// BATALLA POKEMON

function batalla(paso) {
    turno = paso;

    const escenas = [
        [
            '¡Apareció un Charmander salvaje! ¿Qué querés hacer?',
            ['⚡ Atacar', '🧪 Usar poción']
        ],
        [
            '¡Buen ataque! Charmander todavía puede luchar.',
            ['⚡ Atacar otra vez', '🛡️ Defenderme']
        ],
        [
            '¡La poción te dio energía! Elegí tu siguiente movimiento.',
            ['⚡ Atacar', '🏃 Escapar']
        ],
        [
            '¡Ganaste! Tu Pokémon consiguió la victoria. 🎉',
            ['↻ Volver a jugar']
        ],
        [
            'Te defendiste y el rival se fue. ¡Empate! 🤝',
            ['↻ Volver a jugar']
        ],
        [
            'Escapaste sin problemas. ¡Fin de la batalla! 🌸',
            ['↻ Volver a jugar']
        ]
    ];

    const [mensaje, opciones] = escenas[paso];

    pantalla.innerHTML = `
        <div class="caja">

            <span class="eyebrow">MINIJUEGO ✦</span>

            <h2>Batalla Pokémon</h2>

            <div class="batalla-arte">

                <img
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
                    alt="Pikachu"
                >

                <span class="versus">VS</span>

                <img
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png"
                    alt="Charmander"
                >

            </div>

            <p class="${paso > 2 ? 'resultado' : ''}">
                ${mensaje}
            </p>

            <div class="opciones">

                ${opciones.map((op, i) => `
                    <button data-opcion="${i}">
                        ${op}
                    </button>
                `).join('')}

            </div>

            <p style="color:#a59aac;font-size:13px">
                Elegí una opción para continuar la historia.
                No necesitás calcular puntos.
            </p>

        </div>
    `;
}

// ELEGIR ACCIÓN DE BATALLA

function elegir(opcion) {
    const siguiente = {
        0: [1, 2],
        1: [3, 4],
        2: [3, 5],
        3: [0],
        4: [0],
        5: [0]
    };

    batalla(siguiente[turno][opcion]);
}

// EVENTOS DE LOS BOTONES

document.addEventListener('click', evento => {

    const boton = evento.target.closest('button');

    if (!boton) return;

    if (boton.dataset.pagina) {
        mostrar(boton.dataset.pagina);
    }

    if (boton.dataset.detalle) {
        verDetalle(Number(boton.dataset.detalle));
    }

    if (boton.dataset.opcion !== undefined) {
        elegir(Number(boton.dataset.opcion));
    }

    if (boton.dataset.shiny) {
        const p = pokemones.find(
            x => x.id === Number(boton.dataset.shiny)
        );

        shinyActivo = !shinyActivo;

        if (p) {
            pintarDetalle(p);
        }
    }

    if (boton.id === 'salir') {
        usuario = null;

        localStorage.removeItem('sesion');

        mostrar('inicio');
    }
});

// EVENTOS DE LOS FORMULARIOS

document.addEventListener('submit', evento => {

    evento.preventDefault();

    const form = evento.target;
    const datos = new FormData(form);

    // INICIAR SESIÓN

    if (form.id === 'login') {

        const encontrado = usuarios.find(u =>
            u.username === datos.get('username') &&
            u.password === datos.get('password')
        );

        if (!encontrado) {
            document.querySelector('#aviso').textContent =
                'Usuario o contraseña incorrectos';

            return;
        }

        usuario = encontrado;

        localStorage.setItem('sesion', JSON.stringify(usuario));

        mostrar('inicio');
    }

    // REGISTRAR USUARIO

    if (form.id === 'registro') {

        if (usuarios.some(u =>
            u.username === datos.get('username') ||
            u.email === datos.get('email')
        )) {
            document.querySelector('#aviso').textContent =
                'Ese usuario ya existe';

            return;
        }

        const nuevo = {
            id: Date.now(),
            nombre: datos.get('nombre'),
            email: datos.get('email'),
            username: datos.get('username'),
            password: datos.get('password'),
            avatar: datos.get('avatar'),
            admin: false
        };

        usuarios.push(nuevo);

        guardar();

        usuario = nuevo;

        localStorage.setItem('sesion', JSON.stringify(usuario));

        mostrar('inicio');
    }

    // GUARDAR NUEVO POKEMON

    if (form.id === 'nuevoPokemon' && usuario?.admin) {

        const p = {
            id: Math.max(0, ...pokemones.map(x => x.id)) + 1
        };

        for (const campo of campos) {

            let valor = datos.get(campo);

            if ([
                'altura',
                'peso',
                'generacion',
                'hp',
                'ataque',
                'velocidad',
                'defensa',
                'nivelEvolucion'
            ].includes(campo)) {
                valor = valor === '' ? null : Number(valor);
            }

            if (campo === 'tipo') {
                valor = valor
                    .split(',')
                    .map(x => x.trim())
                    .filter(Boolean);
            }

            if (campo === 'tieneEvolucion' || campo === 'shiny') {
                valor = valor === 'true';
            }

            p[campo] = valor;
        }

        if (!p.tipo.length || !p.nombre.trim()) {
            document.querySelector('#aviso').textContent =
                'Completá el nombre y al menos un tipo.';

            return;
        }

        pokemones.push(p);

        guardar();

        busqueda = '';

        mostrar('pokedex');
    }
});
guardar();
mostrar('inicio');