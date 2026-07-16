// Función para cambiar de escena
let viewer;

function getHotspotLabel(targetId, fallback) {
    if (!targetId) return fallback || '';
    const auMatch = /^au_(\d+)$/i.exec(targetId);
    if (auMatch) return `Aula ${auMatch[1]}`;
    if (/^(pb|p1)_?/i.test(targetId)) return 'Pasillo';
    if (/^esc/i.test(targetId)) return 'Escaleras';
    if (/^dir/i.test(targetId)) return 'Dirección';
    if (/^cf/i.test(targetId)) return 'Cafetería';
    if (typeof scenes !== 'undefined' && scenes[targetId] && scenes[targetId].title) return scenes[targetId].title;
    return fallback || targetId;
}

// Aurora overlay control
const _aurora = {
    overlay: null,
    timerId: null,
    nextTimeout: null
};

function createAuroraOverlay() {
    if (_aurora.overlay) return _aurora.overlay;
    const overlay = document.createElement('div');
    overlay.className = 'aurora-overlay';
    overlay.innerHTML = '<div class="aurora-band b1"></div><div class="aurora-band b2"></div><div class="aurora-band b3"></div>';
    document.body.appendChild(overlay);
    _aurora.overlay = overlay;
    return overlay;
}

function startAuroraLoop() {
    const overlay = createAuroraOverlay();
    if (!overlay) return;
    overlay.classList.add('active');

    // pulse occasionally with random intervals
    function schedulePulse() {
        const delay = 5000 + Math.random() * 14000; // 5s - 19s
        _aurora.nextTimeout = setTimeout(() => {
            overlay.classList.add('pulse');
            // remove pulse class after 3s
            setTimeout(() => overlay.classList.remove('pulse'), 3000);
            schedulePulse();
        }, delay);
    }

    // start initial subtle movement
    overlay.classList.add('pulse');
    setTimeout(() => overlay.classList.remove('pulse'), 1800);
    schedulePulse();
}

function stopAuroraLoop() {
    if (_aurora.nextTimeout) {
        clearTimeout(_aurora.nextTimeout);
        _aurora.nextTimeout = null;
    }
    if (_aurora.overlay) {
        _aurora.overlay.classList.remove('active');
        _aurora.overlay.classList.remove('pulse');
        // remove overlay after transition
        setTimeout(() => {
            if (_aurora.overlay && _aurora.overlay.parentNode) {
                _aurora.overlay.parentNode.removeChild(_aurora.overlay);
            }
            _aurora.overlay = null;
        }, 900);
    }
}

function createHotspot(hotSpotDiv, args) {
    // Visuals: gradient, rounded, shadow
    hotSpotDiv.style.width = '34px';
    hotSpotDiv.style.height = '34px';
    hotSpotDiv.style.borderRadius = '50%';
    hotSpotDiv.style.background = 'linear-gradient(135deg, #3d6db9 0%, #01dfff 50%, #00fff1 100%)';
    hotSpotDiv.style.border = '2px solid rgba(255,255,255,0.9)';
    hotSpotDiv.style.cursor = 'pointer';
    hotSpotDiv.style.display = 'flex';
    hotSpotDiv.style.alignItems = 'center';
    hotSpotDiv.style.justifyContent = 'center';
    hotSpotDiv.style.boxShadow = '0 6px 14px rgba(0,0,0,0.25)';
    hotSpotDiv.style.position = 'relative';
    hotSpotDiv.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease, opacity 150ms ease';

    const labelText = args && args.label ? args.label : (args && args.sceneId ? getHotspotLabel(args.sceneId, '') : 'Ir');
    hotSpotDiv.innerHTML = `<span style="font-size:0.65rem; color:#ffffff; text-align:center; line-height:1.1; font-weight:700;">${labelText}</span>`;

    hotSpotDiv.addEventListener('mouseenter', () => {
        hotSpotDiv.style.transform = 'scale(1.12)';
        hotSpotDiv.style.boxShadow = '0 10px 20px rgba(0,0,0,0.32)';
    });

    // Ensure hotspots created by pannellum (including 'scene' type with sprite) show our gradient.
    function applyInlineHotspotStyles() {
        const nodes = document.querySelectorAll('.pnlm-hotspot, .pnlm-hotspot-base');
        nodes.forEach(el => {
            el.style.background = 'linear-gradient(135deg, #3d6db9 0%, #01dfff 50%, #00fff1 100%)';
            el.style.backgroundImage = 'none';
            el.style.width = '36px';
            el.style.height = '36px';
            el.style.borderRadius = '50%';
            el.style.border = '2px solid rgba(255,255,255,0.9)';
            el.style.boxShadow = '0 6px 14px rgba(0,0,0,0.25)';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.color = '#fff';
            // show any inner text
            const span = el.querySelector('span');
            if (span) {
                span.style.color = '#fff';
                span.style.fontWeight = '700';
                span.style.fontSize = '0.7rem';
                span.style.display = 'block';
                span.style.padding = '2px 6px';
            }
        });
    }

    // Apply now and watch for additions
    setTimeout(applyInlineHotspotStyles, 300);
    const renderContainer = document.querySelector('.pnlm-render-container');
    if (renderContainer) {
        const mo = new MutationObserver(() => applyInlineHotspotStyles());
        mo.observe(renderContainer, { childList: true, subtree: true });
    }
    hotSpotDiv.addEventListener('mouseleave', () => {
        hotSpotDiv.style.transform = 'scale(1)';
        hotSpotDiv.style.boxShadow = '0 6px 14px rgba(0,0,0,0.25)';
    });
    hotSpotDiv.addEventListener('click', () => {
        if (viewer && args && args.sceneId) {
            viewer.loadScene(args.sceneId);
        }
    });
}
const panoramasElement = document.getElementById('panoramas');
if (panoramasElement) {
    viewer = pannellum.viewer('panoramas', {

        default: {
            firstScene: 'entrada',
            autoLoad: true,
            sceneFadeDuration: 1000
        },

        estacionamiento: {
            title: 'Estacionamiento',
            panorama: 'imagenes360/estacionamiento360.jpg',
            hotSpots: [
                {
                    pitch: 0,
                    yaw: 0,
                    type: 'custom',
                    createTooltipFunc: createHotspot,
                    createTooltipArgs: {
                        label: 'Entrada',
                        sceneId: 'entrada'
                    }
                }
            ]
        },

        entrada: {
            title: 'Entrada',
            panorama: 'imagenes360/entrada.jpg',
            hotSpots: [
                {
                    pitch: 0,
                    yaw: 0,
                    type: 'custom',
                    createTooltipFunc: createHotspot,
                    createTooltipArgs: {
                        label: 'Pasillo Entrada',
                        sceneId: 'direccion'
                    }
                },
                {
                    pitch: -5,
                    yaw: -90,
                    type: 'custom',
                    createTooltipFunc: createHotspot,
                    createTooltipArgs: {
                        label: 'Volver',
                        sceneId: 'estacionamiento'
                    }
                }
            ]
        },

        direccion: {
            title: 'Pasillo Entrada',
            panorama: 'imagenes360/pasillo_entrada.jpg',
            hotSpots: [
                {
                    pitch: 0,
                    yaw: 0,
                    type: 'custom',
                    createTooltipFunc: createHotspot,
                    createTooltipArgs: {
                        label: 'Patio Aulas',
                        sceneId: 'aulas'
                    }
                }
            ]
        },

        cafeteria: {
            title: 'Cafetería',
            panorama: 'imagenes360/patio_cafeteria.jpeg',
            hotSpots: [
                {
                    pitch: 0,
                    yaw: 0,
                    type: 'scene',
                    text: 'Volver a Patio Aulas',
                    sceneId: 'aulas'
                }
            ]
        },

        sanitarios: {
            title: 'Sanitarios',
            panorama: 'imagenes360/pasillo_esc_baño.jpg',
            hotSpots: [
                {
                    pitch: 0,
                    yaw: 0,
                    type: 'scene',
                    text: 'Ir a Auditorio',
                    sceneId: 'auditorio'
                }
            ]
        },

        aulas: {
            title: 'Patio Aulas',
            panorama: 'imagenes360/patio_aulas360.jpg.jpeg',
            hotSpots: [
                {
                    pitch: 0,
                    yaw: 0,
                    type: 'custom',
                    createTooltipFunc: createHotspot,
                    createTooltipArgs: {
                        label: 'Patio Cafetería',
                        sceneId: 'cafeteria'
                    }
                },
                {
                    pitch: -10,
                    yaw: 45,
                    type: 'custom',
                    createTooltipFunc: createHotspot,
                    createTooltipArgs: {
                        label: 'Pasillo Entrada',
                        sceneId: 'direccion'
                    }
                }
            ]
        },

        auditorio: {
            title: 'Auditorio',
            panorama: 'panormas/Aula19.jpg',
            hotSpots: [
                {
                    pitch: 0,
                    yaw: -50,
                    type: 'scene',
                    text: 'Volver a Estacionamiento',
                    sceneId: 'estacionamiento'
                }
            ]
        }
    });
}

// Función para cambiar escenas desde botones
function cambiarEscena(nombreEscena) {
    if (viewer) {
        viewer.loadScene(nombreEscena);
    }
}

const tourRooms = {
    estacionamiento: {
        title: 'Estacionamiento',
        description: 'Comienza aquí tu recorrido en el acceso principal y sigue hacia las zonas más destacadas del plantel.',
        image: 'panormas/Estacionamiento.jpeg',
        link: 'estacionamiento.html',
        type: 'pano',
        scene: 'estacionamiento'
    },
    entrada: {
        title: 'Entrada',
        description: 'Avanza hacia la entrada principal y observa el punto de acceso al campus.',
        image: 'panormas/Pasillo1.jpeg',
        link: 'entrada.html',
        type: 'photo',
        scene: null
    },
    direccion: {
        title: 'Dirección',
        description: 'Llega al área de Dirección y Control Escolar para conocer dónde se atiende al alumnado.',
        image: 'panormas/oficina2.jpeg',
        link: 'direccion-control-escolar.html',
        type: 'photo',
        scene: null
    },
    cafeteria: {
        title: 'Cafetería',
        description: 'Visita la cafetería, un espacio de convivencia y descanso dentro del recorrido.',
        image: 'panormas/oficina5.jpeg',
        link: 'cafeteria.html',
        type: 'pano',
        scene: 'cafeteria'
    },
    sanitarios: {
        title: 'Sanitarios',
        description: 'Conoce los servicios del plantel en el recorrido virtual.',
        image: 'panormas/oficina6.jpeg',
        link: 'sanitarios.html',
        type: 'pano',
        scene: 'sanitarios'
    },
    aulas: {
        title: 'Aulas',
        description: 'Explora las aulas donde se imparten las clases y siente el ambiente académico.',
        image: 'panormas/Aula1.jpeg',
        link: 'aulas.html',
        type: 'pano',
        scene: 'aulas'
    },
    auditorio: {
        title: 'Auditorio',
        description: 'Finaliza el recorrido en el auditorio, el espacio destinado a eventos y presentaciones.',
        image: 'panormas/Aula19.jpg',
        link: 'auditorio.html',
        type: 'pano',
        scene: 'auditorio'
    }
};

let currentTourRoom = 'estacionamiento';
let audioContext = null;
let ambientSound = null;
let ambientGain = null;

function initTour() {
    const roomButtons = document.querySelectorAll('.tour-room-btn');
    const prevBtn = document.getElementById('tourPrev');
    const nextBtn = document.getElementById('tourNext');
    const soundBtn = document.getElementById('tourSoundToggle');
    const autoRotateBtn = document.getElementById('tourAutoRotate');
    const startOverBtn = document.getElementById('tourStartOver');
    const fallbackImage = document.getElementById('tourFallbackImage');

    const tourPreviewCard = createTourPreviewCard();
    roomButtons.forEach(button => {
        button.addEventListener('click', () => {
            loadTourRoom(button.dataset.room);
        });
        button.addEventListener('mouseenter', (event) => {
            showTourPreview(button.dataset.room, button, tourPreviewCard);
        });
        button.addEventListener('mouseleave', () => {
            hideTourPreview(tourPreviewCard);
        });
        button.addEventListener('focus', (event) => {
            showTourPreview(button.dataset.room, button, tourPreviewCard);
        });
        button.addEventListener('blur', () => {
            hideTourPreview(tourPreviewCard);
        });
    });

    const tourVisual = document.querySelector('.tour-visual');
    if (tourVisual) {
        let swipeStartX = null;
        tourVisual.addEventListener('pointerdown', (event) => {
            swipeStartX = event.clientX;
        });
        tourVisual.addEventListener('pointerup', (event) => {
            if (swipeStartX === null) return;
            const swipeDistance = event.clientX - swipeStartX;
            if (Math.abs(swipeDistance) > 80) {
                navigateTour(swipeDistance < 0 ? 1 : -1);
            }
            swipeStartX = null;
        });
    }

    if (fallbackImage) {
        fallbackImage.addEventListener('mousemove', (event) => {
            const rect = fallbackImage.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            const moveX = x * 10;
            const moveY = y * 8;
            fallbackImage.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) scale(1.05)`;
        });
        fallbackImage.addEventListener('mouseleave', () => {
            fallbackImage.style.transform = 'translate3d(0,0,0) scale(1.02)';
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            navigateTour(-1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            navigateTour(1);
        });
    }

    if (autoRotateBtn) {
        autoRotateBtn.addEventListener('click', () => {
            toggleAutoRotate(autoRotateBtn);
        });
    }

    if (soundBtn) {
        soundBtn.addEventListener('click', () => {
            toggleAmbientSound(soundBtn);
        });
    }

    if (startOverBtn) {
        startOverBtn.addEventListener('click', () => {
            loadTourRoom('estacionamiento');
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') {
            navigateTour(1);
        }
        if (event.key === 'ArrowLeft') {
            navigateTour(-1);
        }
    });

    loadTourRoom('estacionamiento');
}

function loadTourRoom(roomKey) {
    const room = tourRooms[roomKey] || tourRooms.estacionamiento;
    currentTourRoom = roomKey;

    const title = document.getElementById('tourTitle');
    const description = document.getElementById('tourDescription');
    const gotoLink = document.getElementById('tourGoto');
    const roomButtons = document.querySelectorAll('.tour-room-btn');

    if (title) title.textContent = room.title;
    if (description) description.textContent = room.description;
    if (gotoLink) {
        gotoLink.href = room.link;
        gotoLink.textContent = `Visitar ${room.title}`;
    }
    roomButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.room === roomKey);
    });

    const panoContainer = document.getElementById('panoramas');
    const fallbackImage = document.getElementById('tourFallbackImage');
    const hint = document.getElementById('tourHint');
    const autoRotateBtn = document.getElementById('tourAutoRotate');
    const progressLabel = document.getElementById('tourProgressLabel');
    const progressFill = document.getElementById('tourProgressFill');
    const status = document.getElementById('tourStatus');

    updateTourProgress(progressLabel, progressFill);
    if (status) {
        status.textContent = `Explorando ${room.title}. Usa los controles o las teclas ← y →.`;
    }

    const tourDisplay = document.querySelector('.tour-display');
    const infoPanelText = document.getElementById('infoPanelText');

    if (tourDisplay) {
        tourDisplay.classList.add('transitioning');
        window.setTimeout(() => tourDisplay.classList.remove('transitioning'), 320);
    }

    if (room.type === 'pano' && room.scene && viewer && typeof viewer.loadScene === 'function') {
        if (fallbackImage) {
            fallbackImage.classList.remove('visible');
            fallbackImage.classList.add('hidden');
        }
        if (hint) {
            hint.textContent = 'Panorama 360°: arrastra para girar y explora cada hotspot.';
            hint.classList.remove('visible');
        }
        if (panoContainer) {
            panoContainer.style.display = 'block';
        }
        viewer.loadScene(room.scene);
    } else {
        if (panoContainer) {
            panoContainer.style.display = 'none';
        }
        if (fallbackImage) {
            fallbackImage.src = room.image;
            fallbackImage.alt = `Foto del ${room.title}`;
            fallbackImage.classList.add('visible');
            fallbackImage.classList.remove('hidden');
            fallbackImage.style.transform = 'translate3d(0,0,0) scale(1.02)';
        }
        if (hint) {
            hint.textContent = 'Foto interactiva: mueve el cursor para activar el efecto 3D.';
            hint.classList.add('visible');
        }
        if (autoRotateBtn && autoRotateBtn.dataset.active === 'true' && viewer && typeof viewer.stopAutoRotate === 'function') {
            viewer.stopAutoRotate();
            autoRotateBtn.dataset.active = 'false';
            autoRotateBtn.textContent = 'Auto-rotar';
            autoRotateBtn.classList.remove('active');
        }
    }

    if (infoPanelText) {
        infoPanelText.textContent = `Ahora estás en ${room.title}. ${room.description} Usa las teclas ← / → o los botones para navegar.`;
    }
}

function ensureAudioContext() {
    if (audioContext) {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        return;
    }

    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return;

    audioContext = new AudioCtor();
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function startAmbientSound() {
    if (!audioContext) ensureAudioContext();
    if (!audioContext || ambientSound) return;

    ambientGain = audioContext.createGain();
    ambientGain.gain.value = 0.001;
    ambientGain.connect(audioContext.destination);

    const baseOsc = audioContext.createOscillator();
    baseOsc.type = 'triangle';
    baseOsc.frequency.value = 112;

    const modOsc = audioContext.createOscillator();
    modOsc.type = 'sine';
    modOsc.frequency.value = 0.08;

    const modGain = audioContext.createGain();
    modGain.gain.value = 18;
    modOsc.connect(modGain).connect(baseOsc.frequency);

    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    filter.Q.value = 1.1;

    baseOsc.connect(filter).connect(ambientGain);
    baseOsc.start();
    modOsc.start();

    ambientSound = { baseOsc, modOsc, filter };
    ambientGain.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 1.4);
}

function stopAmbientSound() {
    if (!ambientSound || !ambientGain) return;
    ambientGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
    ambientSound.baseOsc.stop(audioContext.currentTime + 0.5);
    ambientSound.modOsc.stop(audioContext.currentTime + 0.5);
    ambientSound = null;
    ambientGain = null;
}

function toggleAmbientSound(button) {
    if (!button) return;
    ensureAudioContext();
    if (!audioContext) return;

    const active = button.dataset.active === 'true';
    if (active) {
        stopAmbientSound();
        button.dataset.active = 'false';
        button.textContent = 'Ambiente';
        button.classList.remove('sound-on');
    } else {
        startAmbientSound();
        button.dataset.active = 'true';
        button.textContent = 'Ambiente activado';
        button.classList.add('sound-on');
    }
}

function playClickFeedback() {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    ensureAudioContext();
    if (!audioContext) return;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'square';
    osc.frequency.value = 560;
    gain.gain.value = 0.15;
    osc.connect(gain).connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);
}

function createTourPreviewCard() {
    const card = document.createElement('div');
    card.className = 'tour-preview-card';
    card.innerHTML = '<img src="" alt="Vista previa"><h4></h4><p></p>';
    document.body.appendChild(card);
    return card;
}

function showTourPreview(roomKey, button, card) {
    const room = tourRooms[roomKey];
    if (!room || !card) return;
    const img = card.querySelector('img');
    const title = card.querySelector('h4');
    const description = card.querySelector('p');
    if (img) {
        img.src = room.image;
        img.alt = `Vista previa de ${room.title}`;
    }
    if (title) title.textContent = room.title;
    if (description) description.textContent = room.description;
    const rect = button.getBoundingClientRect();
    card.style.left = `${rect.right + 12}px`;
    card.style.top = `${rect.top}px`;
    card.classList.add('visible');
}

function hideTourPreview(card) {
    if (card) {
        card.classList.remove('visible');
    }
}

function updateTourProgress(labelEl, fillEl) {
    const keys = Object.keys(tourRooms);
    const currentIndex = keys.indexOf(currentTourRoom);
    const total = keys.length;
    const percentage = ((currentIndex + 1) / total) * 100;
    if (labelEl) {
        labelEl.textContent = `${currentIndex + 1} / ${total}`;
    }
    if (fillEl) {
        fillEl.style.width = `${percentage}%`;
    }
}

function navigateTour(direction) {
    const keys = Object.keys(tourRooms);
    const currentIndex = keys.indexOf(currentTourRoom);
    const nextIndex = (currentIndex + direction + keys.length) % keys.length;
    loadTourRoom(keys[nextIndex]);
}

function toggleAutoRotate(button) {
    if (!viewer || !button) return;
    const isActive = button.dataset.active === 'true';
    if (isActive) {
        viewer.stopAutoRotate();
        button.dataset.active = 'false';
        button.textContent = 'Auto-rotar';
        button.classList.remove('active');
    } else {
        viewer.startAutoRotate(3);
        button.dataset.active = 'true';
        button.textContent = 'Detener auto-rotar';
        button.classList.add('active');
    }
}

// Pantalla de inicio
function activarPantallaInicio() {
    const landingScreen = document.getElementById('landing-screen');
    const mainContent = document.getElementById('main-content');
    const selectionScreen = document.getElementById('selection-screen');
    if (landingScreen && selectionScreen) {
        landingScreen.classList.add('hidden');
        selectionScreen.classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Si la URL contiene #selection, mostrar directamente la pantalla de selección
    if (location.hash === '#selection') {
        const landingScreen = document.getElementById('landing-screen');
        const selectionScreen = document.getElementById('selection-screen');
        if (landingScreen && selectionScreen) {
            landingScreen.classList.add('hidden');
            selectionScreen.classList.remove('hidden');
        }
    }
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('click', activarPantallaInicio);
    }
    const choiceCards = document.querySelectorAll('.choice-card');
    choiceCards.forEach(card => {
        card.addEventListener('click', () => {
            const selectedTitle = card.dataset.title;
            let targetUrl = 'index.html';
            
            if (selectedTitle === 'Oficinas') {
                targetUrl = 'oficinas.html';
            } else if (selectedTitle === 'Plantel Tultepec') {
                targetUrl = 'plantel-tultepec.html';
            } else if (selectedTitle === 'Plantel Teoloyucan') {
                targetUrl = 'plantel-teoloyucan.html';
            }
            
            window.location.href = targetUrl;
        });
    });
    // Add pressed interaction feedback for buttons and choice cards
    const interactiveSelectors = Array.from(document.querySelectorAll('.button, .choice-card, .nav-button, .landing-button'));
    interactiveSelectors.forEach(el => {
        // mouse
        el.addEventListener('mousedown', () => el.classList.add('pressed'));
        el.addEventListener('mouseup', () => el.classList.remove('pressed'));
        el.addEventListener('mouseleave', () => el.classList.remove('pressed'));
        // touch
        el.addEventListener('touchstart', () => el.classList.add('pressed'), {passive: true});
        el.addEventListener('touchend', () => el.classList.remove('pressed'));
        // click ripple
        el.addEventListener('click', (e) => {
            // create ripple element
            const rect = el.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            const size = Math.max(rect.width, rect.height) * 1.5;
            ripple.style.width = ripple.style.height = size + 'px';
            const left = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left - size / 2;
            const top = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top - size / 2;
            ripple.style.left = left + 'px';
            ripple.style.top = top + 'px';
            el.appendChild(ripple);
            setTimeout(() => {
                ripple.remove();
            }, 700);
            playClickFeedback();
        });
        // keyboard
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                el.classList.add('pressed');
            }
        });
        el.addEventListener('keyup', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                el.classList.remove('pressed');
            }
        });
        // tilt 3D
        // enable only for pointer devices
        el.classList.add('tilt-enabled');
        const maxTilt = 10; // degrees
        function onPointerMove(ev) {
            // ignore touch
            if (ev.touches) return;
            const rect = el.getBoundingClientRect();
            const x = ev.clientX - rect.left;
            const y = ev.clientY - rect.top;
            const px = (x / rect.width) - 0.5;
            const py = (y / rect.height) - 0.5;
            const rotY = px * (maxTilt * 2);
            const rotX = -py * (maxTilt * 2);
            el.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        }
        function onPointerLeave() {
            el.style.transform = '';
        }
        el.addEventListener('mousemove', onPointerMove);
        el.addEventListener('mouseleave', onPointerLeave);
    });
    const exitButton = document.getElementById('exit-button');
    if (exitButton) {
        exitButton.addEventListener('click', () => {
            const mainContent = document.getElementById('main-content');
            const selectionScreen = document.getElementById('selection-screen');
            if (mainContent && selectionScreen) {
                mainContent.classList.add('hidden');
                selectionScreen.classList.remove('hidden');
            }
        });
    }

    const backStart = document.getElementById('back-start');
    if (backStart) {
        backStart.addEventListener('click', () => {
            const selectionScreen = document.getElementById('selection-screen');
            const landingScreen = document.getElementById('landing-screen');
            if (selectionScreen && landingScreen) {
                selectionScreen.classList.add('hidden');
                landingScreen.classList.remove('hidden');
            }
        });
    }

    setupGallery();
    initTour();
    setupImageCardEffects();
    setupScrollReveal();
    setupActiveMenuLinks();
    setupDarkModeToggle();
    initializeCarousels();
});

function setupScrollReveal() {
    const elements = document.querySelectorAll('.tour-stage, .section-content, .images-grid, .choice-card, .image-card, .video-card, .header-inner, .selection-card');
    const options = { threshold: 0.15 };
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, options) : null;

    elements.forEach(el => {
        el.classList.add('reveal');
        if (observer) {
            observer.observe(el);
        } else {
            window.setTimeout(() => el.classList.add('visible'), 100);
        }
    });
}

function setupActiveMenuLinks() {
    const links = document.querySelectorAll('.menu a');
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    links.forEach(link => {
        const href = link.getAttribute('href')?.split('/').pop();
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active-nav');
        }
    });
}

function setupImageCardEffects() {
    const cards = document.querySelectorAll('.image-card');
    cards.forEach(card => {
        const img = card.querySelector('img');
        if (!img) return;

        const onMove = (event) => {
            const rect = card.getBoundingClientRect();
            const x = ((event.clientX || (event.touches && event.touches[0].clientX)) - rect.left) / rect.width;
            const y = ((event.clientY || (event.touches && event.touches[0].clientY)) - rect.top) / rect.height;
            const rotateY = (x - 0.5) * 16;
            const rotateX = (0.5 - y) * 12;
            img.style.transform = `perspective(1200px) scale(1.04) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            card.classList.add('active-img-hover');
        };

        const reset = () => {
            img.style.transform = 'perspective(1200px) scale(1) rotateX(0deg) rotateY(0deg)';
            card.classList.remove('active-img-hover');
        };

        card.addEventListener('mousemove', onMove);
        card.addEventListener('touchmove', onMove, { passive: true });
        card.addEventListener('mouseleave', reset);
        card.addEventListener('touchend', reset);
        card.addEventListener('touchcancel', reset);
    });
}

let currentType = null;
let currentIndex = 0;
let galleryItems = [];
let galleryPanoViewer = null;

function setupGallery() {
    const imageCards = document.querySelectorAll('.image-card[data-type="image"], .image-card[data-type="pano"]');
    const videoCards = document.querySelectorAll('.video-card[data-type="video"]');
    const galleryModal = document.getElementById('galleryModal');
    if (!galleryModal) return;

    galleryItems = Array.from(imageCards).concat(Array.from(videoCards));

    galleryItems.forEach((card, index) => {
        if (!card.dataset.title) {
            const titleText = card.querySelector('img')?.alt || card.querySelector('video')?.dataset.title || `Elemento ${index + 1}`;
            card.dataset.title = titleText;
        }
        card.dataset.index = index;
        card.addEventListener('click', () => {
            currentType = card.dataset.type;
            currentIndex = index;
            openGallery();
        });
    });

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const closeGallery = document.getElementById('closeGallery');

    if (prevBtn) prevBtn.addEventListener('click', showPrevious);
    if (nextBtn) nextBtn.addEventListener('click', showNext);
    if (closeGallery) closeGallery.addEventListener('click', closeGalleryModal);
    galleryModal.addEventListener('click', (e) => {
        if (e.target.id === 'galleryModal') {
            closeGalleryModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (galleryModal.classList.contains('active')) {
            if (e.key === 'ArrowLeft') showPrevious();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'Escape') closeGalleryModal();
        }
    });
}

function openGallery() {
    document.getElementById('galleryModal').classList.add('active');
    showCurrentItem();
}

function closeGalleryModal() {
    const galleryModal = document.getElementById('galleryModal');
    if (galleryModal) galleryModal.classList.remove('active');
    const galleryImage = document.getElementById('galleryImage');
    const galleryVideo = document.getElementById('galleryVideo');
    if (galleryImage) galleryImage.style.display = 'none';
    if (galleryVideo) {
        galleryVideo.pause();
        galleryVideo.style.display = 'none';
        galleryVideo.src = '';
    }
    const panoViewerEl = document.getElementById('panoViewer');
    if (panoViewerEl) {
        panoViewerEl.style.display = 'none';
        // destroy pannellum viewer if created
        try {
            if (galleryPanoViewer && typeof galleryPanoViewer.destroy === 'function') {
                galleryPanoViewer.destroy();
            }
        } catch (e) {
            // ignore
        }
        galleryPanoViewer = null;
    }
}

function showCurrentItem() {
    const item = galleryItems[currentIndex];
    const galleryImage = document.getElementById('galleryImage');
    const galleryVideo = document.getElementById('galleryVideo');
    if (!item || !galleryImage || !galleryVideo) return;

    galleryImage.style.display = 'none';
    galleryVideo.style.display = 'none';

    if (item.dataset.type === 'image') {
        const img = item.querySelector('img');
        galleryImage.src = img ? img.src : '';
        galleryImage.style.display = 'block';
        // ensure pano viewer hidden
        const panoViewerEl = document.getElementById('panoViewer');
        if (panoViewerEl) panoViewerEl.style.display = 'none';
        if (galleryPanoViewer && typeof galleryPanoViewer.destroy === 'function') {
            galleryPanoViewer.destroy();
            galleryPanoViewer = null;
        }
    } else if (item.dataset.type === 'pano') {
        // Show panorama using Pannellum
        const img = item.querySelector('img');
        const panoSrc = img ? img.src : '';
        const panoViewerEl = document.getElementById('panoViewer');
        if (!panoViewerEl) return;
        // hide other media
        galleryImage.style.display = 'none';
        galleryVideo.style.display = 'none';
        panoViewerEl.style.display = 'block';
        // destroy existing viewer
        try { if (galleryPanoViewer && typeof galleryPanoViewer.destroy === 'function') galleryPanoViewer.destroy(); } catch (e) {}
        try {
            galleryPanoViewer = pannellum.viewer('panoViewer', {
                type: 'equirectangular',
                panorama: panoSrc,
                autoLoad: true,
                compass: false,
                hotSpotDebug: false
            });
        } catch (e) {
            // if pannellum not available, fallback to image
            const galleryImage = document.getElementById('galleryImage');
            if (galleryImage) {
                galleryImage.src = panoSrc;
                galleryImage.style.display = 'block';
            }
            if (panoViewerEl) panoViewerEl.style.display = 'none';
        }
    } else {
        const video = item.querySelector('video');
        if (video) {
            galleryVideo.src = video.src || video.dataset.src || '';
            galleryVideo.style.display = 'block';
            galleryVideo.load();
        }
    }
    updateCounter();
}

function showPrevious() {
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    showCurrentItem();
}

function showNext() {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    showCurrentItem();
}

function updateCounter() {
    const counter = document.getElementById('galleryCounter');
    if (counter) {
        counter.textContent = `${currentIndex + 1} / ${galleryItems.length}`;
    }
}

// Dark mode toggle: injects a button into the header and persists preference
function setupDarkModeToggle() {
    try {
        const headerInner = document.querySelector('.header-inner') || document.querySelector('header');
        const landingScreen = document.getElementById('landing-screen');
        if (!headerInner && !landingScreen) return;

        // factory to create a toggle button and wire events
        const createToggle = () => {
            const btn = document.createElement('button');
            btn.className = 'dark-toggle';
            btn.setAttribute('aria-label', 'Toggle dark mode');
            return btn;
        };

        const syncAll = (isDark) => {
            const all = document.querySelectorAll('.dark-toggle');
            all.forEach(btn => {
                btn.classList.toggle('active', !!isDark);
                btn.title = isDark ? 'Modo claro' : 'Modo oscuro';
                btn.innerHTML = isDark ? '<span class="icon">☀️</span><span class="dark-label">Claro</span>' : '<span class="icon">🌙</span><span class="dark-label">Oscuro</span>';
            });
        };

        const apply = (isDark) => {
            if (isDark) {
                document.body.classList.add('dark');
                startAuroraLoop();
            } else {
                document.body.classList.remove('dark');
                stopAuroraLoop();
            }
            syncAll(isDark);
        };

        // Read saved preference or system preference
        const saved = localStorage.getItem('darkMode');
        let preferDark = null;
        if (saved === 'true') preferDark = true;
        if (saved === 'false') preferDark = false;
        if (preferDark === null) {
            preferDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        // create toggles in header and landing screen (if present)
        if (headerInner && !headerInner.querySelector('.dark-toggle')) {
            const t = createToggle();
            t.addEventListener('click', () => {
                const isDark = document.body.classList.toggle('dark');
                localStorage.setItem('darkMode', isDark ? 'true' : 'false');
                apply(isDark);
            });
            headerInner.appendChild(t);
        }

        if (landingScreen && !landingScreen.querySelector('.dark-toggle')) {
            const landingCard = landingScreen.querySelector('.landing-card') || landingScreen.querySelector('.selection-card') || landingScreen;
            const t2 = createToggle();
            t2.classList.add('fixed-outside');

            const positionLandingToggle = () => {
                try {
                    const rect = landingCard.getBoundingClientRect();
                    // place button slightly above and to the right of the card
                    const top = Math.max(12, rect.top - 14);
                    const left = rect.right + 12; // outside to the right
                    t2.style.top = `${top}px`;
                    t2.style.left = `${left}px`;
                } catch (e) {
                    // fallback: place top-right
                    t2.style.top = '12px';
                    t2.style.right = '12px';
                }
            };

            t2.addEventListener('click', () => {
                const isDark = document.body.classList.toggle('dark');
                localStorage.setItem('darkMode', isDark ? 'true' : 'false');
                apply(isDark);
            });

            // initial position and keep it updated on resize/scroll
            positionLandingToggle();
            window.addEventListener('resize', positionLandingToggle);
            window.addEventListener('scroll', positionLandingToggle, { passive: true });

            document.body.appendChild(t2);
        }
        // If a toggle already exists inside landingScreen (from previous runs), ensure it's fixed and positioned
        if (landingScreen) {
            const existing = landingScreen.querySelector('.dark-toggle');
            if (existing) {
                    existing.classList.add('fixed-outside');
                    // force fixed position with !important to override any CSS
                    try { existing.style.setProperty('position', 'fixed', 'important'); } catch (e) {}
                const landingCard = landingScreen.querySelector('.landing-card') || landingScreen.querySelector('.selection-card') || landingScreen;
                const positionExisting = () => {
                    try {
                        const rect = landingCard.getBoundingClientRect();
                        const top = Math.max(12, rect.top - 14);
                        const left = rect.right + 12;
                            existing.style.top = `${top}px`;
                            existing.style.left = `${left}px`;
                    } catch (e) {
                        existing.style.top = '12px';
                        existing.style.right = '12px';
                    }
                };
                positionExisting();
                window.addEventListener('resize', positionExisting);
                window.addEventListener('scroll', positionExisting, { passive: true });
            }
        }
        // ensure landing toggle is correctly positioned (force inline fixed) after everything
        const adjustLandingToggle = () => {
            const ls = document.getElementById('landing-screen');
            if (!ls) return;
            const t = ls.querySelector('.dark-toggle');
            const landingCard = ls.querySelector('.landing-card') || ls.querySelector('.selection-card') || ls;
            if (!t || !landingCard) return;
            try {
                t.style.setProperty('position', 'fixed', 'important');
                t.style.setProperty('z-index', '1400', 'important');
                const rect = landingCard.getBoundingClientRect();
                const top = Math.max(12, rect.top - 14);
                const left = rect.right + 12;
                t.style.top = `${top}px`;
                t.style.left = `${left}px`;
            } catch (e) {}
        };
        // call once and on resize/scroll
        adjustLandingToggle();
        window.addEventListener('resize', adjustLandingToggle);
        window.addEventListener('scroll', adjustLandingToggle, { passive: true });

        // initial apply to sync state and buttons
        apply(preferDark);
    } catch (e) {
        console.error('Dark mode toggle failed', e);
    }
}

// Carousel functionality for images-grid
function initializeCarousels() {
    const carousels = document.querySelectorAll('.image-carousel');
    
    carousels.forEach((carousel, carouselIndex) => {
        const items = carousel.querySelectorAll('.carousel-item');
        if (items.length === 0) return;
        
        let currentIndex = 0;
        const container = carousel.querySelector('.carousel-container');
        const prevBtn = carousel.querySelector('.carousel-btn-prev');
        const nextBtn = carousel.querySelector('.carousel-btn-next');
        const counter = carousel.querySelector('.carousel-counter');
        
        function updateCarousel() {
            if (!container) return;
            const offset = currentIndex * -100;
            container.style.transform = `translateX(${offset}%)`;
            
            if (counter) {
                counter.textContent = `${currentIndex + 1} / ${items.length}`;
            }
            
            // Update button states
            if (prevBtn) {
                prevBtn.disabled = currentIndex === 0;
            }
            if (nextBtn) {
                nextBtn.disabled = currentIndex === items.length - 1;
            }
        }
        
        function goToNext() {
            if (currentIndex < items.length - 1) {
                currentIndex++;
                updateCarousel();
            }
        }
        
        function goToPrevious() {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', goToPrevious);
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', goToNext);
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Check if carousel is in viewport or has focus
            const rect = carousel.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    goToPrevious();
                }
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    goToNext();
                }
            }
        });
        
        // Initial state
        updateCarousel();
    });
}

// Carousel functionality for images-grid
function initializeCarousels() {
    const carousels = document.querySelectorAll('.image-carousel');
    
    carousels.forEach((carousel, carouselIndex) => {
        const items = carousel.querySelectorAll('.carousel-item');
        if (items.length === 0) return;
        
        let currentIndex = 0;
        const container = carousel.querySelector('.carousel-container');
        const prevBtn = carousel.querySelector('.carousel-btn-prev');
        const nextBtn = carousel.querySelector('.carousel-btn-next');
        const counter = carousel.querySelector('.carousel-counter');
        
        function updateCarousel() {
            if (!container) return;
            const offset = currentIndex * -100;
            container.style.transform = `translateX(${offset}%)`;
            
            if (counter) {
                counter.textContent = `${currentIndex + 1} / ${items.length}`;
            }
            
            // Update button states
            if (prevBtn) {
                prevBtn.disabled = currentIndex === 0;
            }
            if (nextBtn) {
                nextBtn.disabled = currentIndex === items.length - 1;
            }
        }
        
        function goToNext() {
            if (currentIndex < items.length - 1) {
                currentIndex++;
                updateCarousel();
            }
        }
        
        function goToPrevious() {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', goToPrevious);
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', goToNext);
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Check if carousel is in viewport or has focus
            const rect = carousel.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    goToPrevious();
                }
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    goToNext();
                }
            }
        });
        
        // Initial state
        updateCarousel();
    });
}
