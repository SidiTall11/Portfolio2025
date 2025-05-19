document.addEventListener('DOMContentLoaded', () => {
    const pages = document.querySelectorAll('.book-page.page-right');
    const coverRight = document.querySelector('.cover.cover-right');
    const pageLeft = document.querySelector('.book-page.page-left');
    const book = document.querySelector('.book');
    const openBtn = document.querySelector('.open-btn');
    const closeBtn = document.querySelector('.close-btn');
    const progressBar = document.querySelector('.progress-bar');
    const coverText = document.querySelector('.cover-text');
    const wrapper = document.querySelector('.wrapper');
    const totalPages = pages.length;
    let pageNumber = 0;

    // Vérifier que les éléments existent
    if (!coverRight || !pageLeft || !book || !pages.length || !openBtn || !closeBtn || !progressBar || !coverText || !wrapper) {
        console.error('Erreur : Certains éléments du livre sont introuvables.');
        return;
    }

    // Configuration de la vitesse des animations (en millisecondes)
    const PAGE_TURN_DELAY = 400;
    const INITIAL_OFFSET = 200;

    // Mettre à jour la barre de progression
    function updateProgress() {
        const progress = ((pageNumber + 1) / totalPages) * 16.67;
        progressBar.style.setProperty('--progress-width', `${progress}%`);
    }

    // Fonction pour tourner une page
    function turnPage(pageTurn, index, isTurning) {
        if (!pageTurn) return;
        pageTurn.classList.add('turning', 'crinkled');
        const signature = pageTurn.querySelector('.signature');
        if (signature) {
            signature.style.animation = 'none';
            setTimeout(() => {
                signature.style.animation = 'ink-dry 1s ease-out forwards';
            }, 10);
        }
        setTimeout(() => {
            pageTurn.classList.remove('turning', 'crinkled');
        }, 2000);
        if (isTurning) {
            pageTurn.classList.add('turn');
            setTimeout(() => {
                pageTurn.style.zIndex = 20 + index;
                pageNumber = index;
                updateProgress();
            }, 500);
        } else {
            pageTurn.classList.remove('turn');
            setTimeout(() => {
                pageTurn.style.zIndex = 20 - index;
                pageNumber = index;
                updateProgress();
            }, 500);
        }
    }

    // Fonction pour ouvrir le livre
    function openBook() {
        book.classList.remove('closed');
        coverRight.classList.add('turn');
        setTimeout(() => {
            coverRight.style.zIndex = -1;
            pageLeft.style.zIndex = 20;
            pages.forEach((page, index) => {
                pageNumber = (pageNumber - 1 + totalPages) % totalPages;
                turnPage(page, index, false);
            });
            updateProgress();
            const signature = document.querySelector('.signature[data-page="profile"]');
            if (signature) {
                signature.style.animation = 'none';
                setTimeout(() => {
                    signature.style.animation = 'stamp 1s ease-out forwards';
                }, 10);
            }
        }, 2000);
    }

    // Fonction pour fermer le livre
    function closeBook() {
        book.classList.add('closed');
        coverRight.classList.remove('turn');
        coverRight.style.zIndex = 100;
        pageLeft.style.zIndex = -1;
        pages.forEach(page => {
            page.classList.add('turn');
            page.style.zIndex = 0;
        });
        pageNumber = 0;
        updateProgress();
        triggerCloseParticles();
    }

    // Clic sur le bouton ouvrir
    openBtn.addEventListener('click', () => {
        if (book.classList.contains('closed')) {
            openBook();
        }
    });

    // Clic sur le bouton fermer
    closeBtn.addEventListener('click', () => {
        closeBook();
    });

    // Easter egg : 5 clics sur "le GEEK"
    coverText.addEventListener('click', () => {
        let clicks = parseInt(coverText.getAttribute('data-clicks')) + 1;
        coverText.setAttribute('data-clicks', clicks);
        if (clicks >= 5) {
            const spaceship = document.createElement('div');
            spaceship.classList.add('spaceship');
            wrapper.appendChild(spaceship);
            spaceship.style.display = 'block';
            setTimeout(() => {
                spaceship.remove();
                coverText.setAttribute('data-clicks', '0');
            }, 5000);
        }
    });

    // Message UV sur "MERCI"
    const backCoverText = document.querySelector('.cover.back .cover-text');
    if (backCoverText) {
        backCoverText.addEventListener('click', () => {
            backCoverText.classList.toggle('uv-active');
        });
    }

    // Boutons next/prev
    document.querySelectorAll('.nextprev-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const pageTurnId = btn.getAttribute('data-page');
            const pageTurn = document.getElementById(pageTurnId);
            turnPage(pageTurn, index, !pageTurn.classList.contains('turn'));
        });
    });

    // Bouton contact
    document.querySelector('.btn.contact-me').addEventListener('click', () => {
        pages.forEach((page, index) => {
            setTimeout(() => {
                turnPage(page, index, true);
            }, (index + 1) * PAGE_TURN_DELAY + INITIAL_OFFSET);
        });
    });

    // Bouton retour au profil
    document.querySelector('.back-profile').addEventListener('click', () => {
        pages.forEach((_, index) => {
            setTimeout(() => {
                pageNumber = (pageNumber - 1 + totalPages) % totalPages;
                turnPage(pages[pageNumber], index, false);
            }, (index + 1) * PAGE_TURN_DELAY + INITIAL_OFFSET);
        });
    });

    // Formulaire de contact (simulation)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Message envoyé avec succès ! (Simulation)');
            e.target.reset();
        });
    }

    // Spotlight dynamique
    wrapper.addEventListener('mousemove', e => {
        const rect = wrapper.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        wrapper.style.setProperty('--mouse-x', `${x}%`);
        wrapper.style.setProperty('--mouse-y', `${y}%`);
    });

    // Fond 3D (réseau neuronal) et pluie Matrix
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const nodes = [];
    const nodeCount = 50;
    let mouseX = 0, mouseY = 0;
    let matrixActive = false;

    class Node {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.z = Math.random() * 500;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.speedZ = (Math.random() - 0.5) * 0.2;
        }
        update() {
            this.x += this.speedX + (mouseX - canvas.width / 2) * 0.0001;
            this.y += this.speedY + (mouseY - canvas.height / 2) * 0.0001;
            this.z += this.speedZ;
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            if (this.z < 0 || this.z > 500) this.speedZ *= -1;
        }
        draw() {
            const scale = 500 / (500 + this.z);
            const x2d = this.x * scale + canvas.width / 2;
            const y2d = this.y * scale + canvas.height / 2;
            ctx.fillStyle = `rgba(0, 255, 204, ${scale})`;
            ctx.beginPath();
            ctx.arc(x2d, y2d, 3 * scale, 0, Math.PI * 2);
            ctx.fill();
            return { x2d, y2d, scale };
        }
    }

    // Pluie Matrix
    const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
    const matrixDrops = [];
    const fontSize = 14;
    const columns = canvas.width / fontSize;

    class MatrixDrop {
        constructor() {
            this.x = Math.floor(Math.random() * columns) * fontSize;
            this.y = -Math.random() * canvas.height;
            this.speed = Math.random() * 5 + 5;
            this.chars = [];
            for (let i = 0; i < 20; i++) {
                this.chars.push(matrixChars[Math.floor(Math.random() * matrixChars.length)]);
            }
        }
        update() {
            this.y += this.speed;
            if (this.y > canvas.height) {
                this.y = -Math.random() * canvas.height;
                this.x = Math.floor(Math.random() * columns) * fontSize;
            }
        }
        draw() {
            for (let i = 0; i < this.chars.length; i++) {
                const opacity = 1 - i / this.chars.length;
                ctx.fillStyle = `rgba(0, 255, 0, ${opacity})`;
                ctx.font = `${fontSize}px monospace`;
                ctx.fillText(this.chars[i], this.x, this.y - i * fontSize);
            }
        }
    }

    function initNodes() {
        for (let i = 0; i < nodeCount; i++) {
            nodes.push(new Node());
        }
    }

    function initMatrix() {
        for (let i = 0; i < 30; i++) {
            matrixDrops.push(new MatrixDrop());
        }
    }

    function animateNodes() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (matrixActive) {
            matrixDrops.forEach(drop => {
                drop.update();
                drop.draw();
            });
        } else {
            const nodePositions = nodes.map(node => {
                node.update();
                return node.draw();
            });
            for (let i = 0; i < nodePositions.length; i++) {
                for (let j = i + 1; j < nodePositions.length; j++) {
                    const dx = nodePositions[i].x2d - nodePositions[j].x2d;
                    const dy = nodePositions[i].y2d - nodePositions[j].y2d;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 100) {
                        ctx.strokeStyle = `rgba(0, 255, 204, ${0.5 * (1 - distance / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(nodePositions[i].x2d, nodePositions[i].y2d);
                        ctx.lineTo(nodePositions[j].x2d, nodePositions[j].y2d);
                        ctx.stroke();
                    }
                }
            }
        }
        requestAnimationFrame(animateNodes);
    }

    // Particules de fermeture
    const closeParticles = [];
    class CloseParticle {
        constructor() {
            this.x = canvas.width / 2;
            this.y = canvas.height / 2;
            this.size = Math.random() * 5 + 2;
            this.angle = Math.random() * Math.PI * 2;
            this.speed = Math.random() * 5 + 2;
            this.life = 60;
        }
        update() {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            this.life--;
        }
        draw() {
            ctx.fillStyle = `rgba(0, 255, 204, ${this.life / 60})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function triggerCloseParticles() {
        for (let i = 0; i < 50; i++) {
            closeParticles.push(new CloseParticle());
        }
        function animateCloseParticles() {
            closeParticles.forEach((particle, index) => {
                particle.update();
                particle.draw();
                if (particle.life <= 0) closeParticles.splice(index, 1);
            });
            if (closeParticles.length > 0) {
                requestAnimationFrame(animateCloseParticles);
            }
        }
        animateCloseParticles();
    }

    // Konami Code
    const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let input = [];
    document.addEventListener('keydown', e => {
        input.push(e.key);
        if (input.length > konami.length) input.shift();
        if (input.join('') === konami.join('')) {
            alert('Matrix activé !');
            matrixActive = true;
            initMatrix();
            input = [];
        }
    });

    initNodes();
    animateNodes();

    // Interaction souris
    window.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Ajuster le canvas en cas de redimensionnement
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        columns = canvas.width / fontSize;
    });

    // Navigation au clavier
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' && pageNumber < totalPages - 1) {
            const pageTurn = pages[pageNumber];
            turnPage(pageTurn, pageNumber, true);
        } else if (e.key === 'ArrowLeft' && pageNumber > 0) {
            const pageTurn = pages[pageNumber - 1];
            turnPage(pageTurn, pageNumber - 1, false);
        } else if (e.key === 'Escape' && !book.classList.contains('closed')) {
            closeBook();
        }
    });
});