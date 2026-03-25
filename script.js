// --- Interactive Navbar ---
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// --- Advanced Scroll Observers & Staggered Reveal Animation ---
const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("active");

            // Sub-element cascading staggers for grid systems
            if (entry.target.classList.contains('cards-grid')) {
                const cards = entry.target.querySelectorAll('.info-card, .data-card');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('fade-in-up');
                    }, index * 150); // Fluid 150ms delay
                });
            }
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll(".reveal, .cards-grid").forEach(el => {
        scrollObserver.observe(el);
    });

    // --- Interactive Button Ripple Injector ---
    document.querySelectorAll('.btn, .quiz-option').forEach(button => {
        button.addEventListener('click', function (e) {
            const rect = e.target.getBoundingClientRect();
            // Determine relative precise pointer click
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.classList.add('ripple');

            this.appendChild(ripple);
            setTimeout(() => { ripple.remove(); }, 600);
        });
    });
});

// --- Interactive Hero Journey Animation ---
const spaceScene = document.getElementById('hero-space-scene');
const beginJourneyBtn = document.getElementById('begin-journey-btn');
const heroContent = document.querySelector('.hero-content');
const heroFooter = document.querySelector('.hero-footer');
const flightPath = document.getElementById('flight-path');
const heroRocket = document.getElementById('hero-rocket');
let journeyStarted = false;

function createSpark(x, y) {
    if (!spaceScene) return;
    const spark = document.createElement('div');
    spark.classList.add('thruster-spark');

    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;

    const size = Math.random() * 8 + 3;
    spark.style.width = `${size}px`;
    spark.style.height = `${size}px`;

    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 50 + 20;

    spark.style.setProperty('--tx', `${Math.cos(angle) * velocity}px`);
    spark.style.setProperty('--ty', `${Math.sin(angle) * velocity}px`);

    spaceScene.appendChild(spark);
    setTimeout(() => { if (spark.parentNode) spark.parentNode.removeChild(spark); }, 1000);
}

function animateRocketArc() {
    if (!flightPath || !heroRocket || !spaceScene) return;

    heroRocket.style.transition = 'none'; // Give structural control entirely to JS

    const pathLength = flightPath.getTotalLength();
    const duration = 4000;
    let startTime = null;

    document.body.classList.add('shake-screen');

    function play(timestamp) {
        if (!startTime) startTime = timestamp;
        let progress = (timestamp - startTime) / duration;
        if (progress > 1) progress = 1;

        // Smooth ease-in-out curve
        const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

        const point = flightPath.getPointAtLength(ease * pathLength);
        heroRocket.style.left = `${point.x}%`;
        heroRocket.style.top = `${point.y}%`;
        heroRocket.style.bottom = 'auto';

        const sceneRect = spaceScene.getBoundingClientRect();
        const pxX = (point.x / 100) * sceneRect.width;
        const pxY = (point.y / 100) * sceneRect.height;

        if (Math.random() > 0.3 && progress < 0.95) {
            createSpark(pxX, pxY);
        }

        const tangent = flightPath.getPointAtLength(Math.min(pathLength, (ease + 0.01) * pathLength));
        const pxX2 = (tangent.x / 100) * sceneRect.width;
        const pxY2 = (tangent.y / 100) * sceneRect.height;

        const angle = Math.atan2(pxY2 - pxY, pxX2 - pxX) * 180 / Math.PI;
        heroRocket.style.transform = `translate(-50%, -50%) rotate(${angle + 90}deg)`;

        if (progress < 1) {
            requestAnimationFrame(play);
        } else {
            document.body.classList.remove('shake-screen');
        }
    }

    requestAnimationFrame(play);
}

function startHeroJourney() {
    if (journeyStarted) return;
    journeyStarted = true;
    if (spaceScene) spaceScene.classList.add('journey-active');
    if (heroContent) heroContent.classList.add('dimmed');

    animateRocketArc();
}

if (beginJourneyBtn) {
    beginJourneyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        startHeroJourney();
        // Wait for the rocket animation to play somewhat before scrolling
        setTimeout(() => {
            const targetSection = document.getElementById('launch-sequence') || document.getElementById('travel');
            if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
        }, 1500);
    });
}

window.addEventListener('scroll', () => {
    let scrollPos = window.scrollY;

    // Trigger background transition
    if (scrollPos > 100) {
        startHeroJourney();
    } else if (scrollPos < 20) {
        // Reset when user is back at the very top
        journeyStarted = false;
        if (spaceScene) spaceScene.classList.remove('journey-active');
        if (heroContent) heroContent.classList.remove('dimmed');
    }

    // Standard parallax for text while not fully transitioned
    if (heroContent && !journeyStarted) {
        heroContent.style.transform = `translateY(${scrollPos * 0.2}px)`;
    }

    // Fade out footer blocks completely early on
    if (heroFooter) {
        heroFooter.style.opacity = 1 - (scrollPos / 300);
    }
});

// --- Interactive Launch Sequence ---
const launchBtn = document.getElementById('launch-btn');
const rocketWrapper = document.getElementById('rocket-wrapper');
const mainFlame = document.getElementById('main-flame');
const audio = document.getElementById('rocket-audio');
const smokeContainer = document.getElementById('smoke-container');
const starsAnimation = document.querySelector('.launch-bg .stars-animation');
const launchControl = document.querySelector('.launch-control');
let hasLaunched = false;

if (launchBtn) {
    launchBtn.addEventListener('click', () => {
        if (hasLaunched) return;
        hasLaunched = true;

        // 1. Play Sound (if browser allows autoplay rules)
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio autoplay prevented by browser"));

        // 2. Shake Screen globally
        document.body.classList.add('shake-screen');

        // 3. Ignite massive engine flame
        mainFlame.classList.add('launch-fire');

        // 4. Hide control panel
        launchControl.style.opacity = '0';
        launchControl.style.pointerEvents = 'none';

        // 5. Generate Smoke Particles over ~3 seconds
        let smokeInterval = setInterval(() => {
            let smoke = document.createElement('div');
            smoke.classList.add('smoke-particle');

            // Randomize downward and outward drift
            let drift = (Math.random() - 0.5) * 60;
            smoke.style.setProperty('--drift', `${drift}px`);
            smoke.style.animation = `smokeExpand ${1.5 + Math.random()}s forwards cubic-bezier(0.1, 0.8, 0.3, 1)`;

            smokeContainer.appendChild(smoke);

            // Auto cleanup smoke
            setTimeout(() => { smoke.remove(); }, 2500);
        }, 100);

        // 6. Lift off delay to build suspense
        setTimeout(() => {
            clearInterval(smokeInterval);

            // Visually "move" stars to simulate velocity
            if (starsAnimation) {
                starsAnimation.classList.add('stars-fast');
            }

            // Fire rocket far upwards out of view
            rocketWrapper.style.transform = `translateX(-50%) translateY(-2500px)`;

        }, 1500);

        // 7. Cleanup and smooth scroll
        setTimeout(() => {
            document.body.classList.remove('shake-screen');

            const nextSection = document.getElementById('why-mars') || document.getElementById('travel');
            if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
            }

            // Reset sequence strictly for re-playability if requested
            setTimeout(() => {
                rocketWrapper.style.transition = 'none';
                rocketWrapper.style.transform = `translateX(-50%) translateY(0px)`;
                mainFlame.classList.remove('launch-fire');
                if (starsAnimation) starsAnimation.classList.remove('stars-fast');
                launchControl.style.opacity = '1';
                launchControl.style.pointerEvents = 'auto';

                setTimeout(() => { rocketWrapper.style.transition = 'transform 3s cubic-bezier(0.5, 0, 0.2, 1)'; }, 100);
                hasLaunched = false;
            }, 1000);

        }, 4500);
    });
}

// --- Accordion Interactivity ---
const accordionHeaders = document.querySelectorAll('.accordion-header');

accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        const isActive = header.classList.contains('active');

        // Close any currently open accordions for a cleaner UI
        accordionHeaders.forEach(otherHeader => {
            otherHeader.classList.remove('active');
            otherHeader.nextElementSibling.style.maxHeight = null;
            otherHeader.setAttribute('aria-expanded', 'false');
        });

        // Open the clicked one if it wasn't already open
        if (!isActive) {
            header.classList.add('active');
            header.setAttribute('aria-expanded', 'true');
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
});

// --- Earth vs Mars Interactive Toggle ---
const planetToggle = document.getElementById('planet-toggle');
const labelEarth = document.getElementById('label-earth');
const labelMars = document.getElementById('label-mars');
const comparisonGrid = document.querySelector('.comparison-grid');

const dataGravity = document.getElementById('data-gravity');
const descGravity = document.getElementById('desc-gravity');
const dataTemp = document.getElementById('data-temp');
const descTemp = document.getElementById('desc-temp');
const dataLiving = document.getElementById('data-living');
const descLiving = document.getElementById('desc-living');

const planetData = {
    earth: {
        gravity: "9.81 m/s²",
        gravityDesc: "The gravity you know. A 100kg person weighs exactly 100kg.",
        temp: "14°C",
        tempDesc: "Comfortable and temperate. Our atmosphere acts as a perfect blanket.",
        living: "Breathable",
        livingDesc: "Lush, open air. Full protection from cosmic radiation via our magnetic field."
    },
    mars: {
        gravity: "3.72 m/s²",
        gravityDesc: "You would feel 62% lighter. A 100kg person weighs only 38kg.",
        temp: "-60°C",
        tempDesc: "Bone-chilling cold. Temperatures can drop to -125°C at the poles.",
        living: "Extreme",
        livingDesc: "Zero breathable air. Lethal radiation outside shielded pressure domes."
    }
}

if (planetToggle) {
    planetToggle.addEventListener('change', (e) => {
        const isMars = e.target.checked;
        const data = isMars ? planetData.mars : planetData.earth;

        // Animation Elements Array
        const textElements = [dataGravity, descGravity, dataTemp, descTemp, dataLiving, descLiving];

        // Step 1: Trigger CSS fade-out & shrink
        textElements.forEach(el => el.classList.add('data-fade-out'));

        // Step 2: Toggle UI Highlights visually instantly
        if (isMars) {
            labelMars.classList.add('active');
            labelEarth.classList.remove('active');
            comparisonGrid.classList.add('mars-mode');
            comparisonGrid.classList.remove('earth-mode');

            // Revert label color to normal
            labelEarth.style.color = '';
            labelEarth.style.textShadow = '';
        } else {
            labelEarth.classList.add('active');
            labelMars.classList.remove('active');
            comparisonGrid.classList.add('earth-mode');
            comparisonGrid.classList.remove('mars-mode');

            // Force Earth blue
            labelEarth.style.color = '#409cff';
            labelEarth.style.textShadow = '0 0 15px #409cff';
        }

        // Step 3: Swap text data and trigger fade-in after transition delay
        setTimeout(() => {
            dataGravity.innerText = data.gravity;
            descGravity.innerText = data.gravityDesc;
            dataTemp.innerText = data.temp;
            descTemp.innerText = data.tempDesc;
            dataLiving.innerText = data.living;
            descLiving.innerText = data.livingDesc;

            textElements.forEach(el => {
                el.classList.remove('data-fade-out');
                el.classList.add('data-fade-in');
            });

            // Clean up fade-in class to reset default state
            setTimeout(() => {
                textElements.forEach(el => el.classList.remove('data-fade-in'));
            }, 300);

        }, 300); // 300ms matches the CSS transiton duration
    });
}

// --- Interactive Mars Survival Quiz Logic ---
const quizData = [
    {
        question: "What is the average surface temperature on Mars?",
        options: ["-60°C (-81°F)", "20°C (68°F)", "-10°C (14°F)", "-150°C (-238°F)"],
        answer: 0
    },
    {
        question: "How much gravity does Mars have compared to Earth?",
        options: ["About 80%", "About 10%", "About 38%", "Exactly the same"],
        answer: 2
    },
    {
        question: "What is the Martian atmosphere predominantly made of?",
        options: ["Oxygen", "Nitrogen", "Methane", "Carbon Dioxide"],
        answer: 3
    },
    {
        question: "How long does a typical journey to Mars take with current technology?",
        options: ["2 weeks", "3 months", "7 months", "Over 2 years"],
        answer: 2
    }
];

let currentQuestion = 0;
let userScore = 0;

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-question-btn');
const quizContent = document.getElementById('quiz-content');
const quizResult = document.getElementById('quiz-result');
const scoreText = document.getElementById('score-text');
const scoreMessage = document.getElementById('score-message');
const restartBtn = document.getElementById('restart-quiz-btn');

function loadQuestion() {
    if (!optionsContainer) return;
    nextBtn.classList.add('hidden');
    optionsContainer.innerHTML = '';
    const currentData = quizData[currentQuestion];

    questionText.textContent = currentData.question;

    currentData.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.classList.add('quiz-option');
        btn.textContent = option;

        btn.addEventListener('click', () => selectAnswer(index, btn));
        optionsContainer.appendChild(btn);
    });
}

function selectAnswer(selectedIndex) {
    const isCorrect = selectedIndex === quizData[currentQuestion].answer;

    const allOptions = optionsContainer.querySelectorAll('.quiz-option');
    allOptions.forEach((btn, index) => {
        btn.disabled = true;
        if (index === quizData[currentQuestion].answer) {
            btn.classList.add('correct');
        } else if (index === selectedIndex && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });

    if (isCorrect) userScore++;
    nextBtn.classList.remove('hidden');
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        currentQuestion++;
        if (currentQuestion < quizData.length) {
            loadQuestion();
        } else {
            showResults();
        }
    });
}

function showResults() {
    quizContent.classList.add('hidden');
    quizResult.classList.remove('hidden');

    scoreText.textContent = `Score: ${userScore} / ${quizData.length}`;
    if (userScore === quizData.length) {
        scoreMessage.textContent = "You can survive on Mars 🚀 Exceptional knowledge!";
    } else if (userScore >= quizData.length / 2) {
        scoreMessage.textContent = "You need more training 🧠 You'd survive initially, but preparation is key.";
    } else {
        scoreMessage.textContent = "You need more training 🧠 The Martian elements would overwhelm you.";
    }
}

if (restartBtn) {
    restartBtn.addEventListener('click', () => {
        currentQuestion = 0;
        userScore = 0;
        quizResult.classList.add('hidden');
        quizContent.classList.remove('hidden');
        loadQuestion();
    });
}

if (questionText) loadQuestion();

// --- Deep Space Canvas Background ---
const canvas = document.getElementById('space-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];
    let shootingStars = [];

    // Interactive 3D Tracking Limits
    let targetMX = 0, currentMX = 0;
    let targetMY = 0, currentMY = 0;
    let currentScroll = 0;

    window.addEventListener('mousemove', (e) => {
        targetMX = (e.clientX / window.innerWidth) * 2 - 1; // Maps bounds -1 to 1
        targetMY = (e.clientY / window.innerHeight) * 2 - 1;
    });

    window.addEventListener('scroll', () => {
        currentScroll = window.scrollY;
    });

    function initCanvas() {
        width = canvas.parentElement.offsetWidth;
        height = canvas.parentElement.offsetHeight;
        canvas.width = width;
        canvas.height = height;
        createStars();
    }

    function createStars() {
        stars = [];
        const numStars = Math.floor((width * height) / 500); // Ultra dense starfield
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * (width + 200) - 100, // Spawn past canvas edge to allow parallax panning
                y: Math.random() * (height + 200) - 100,
                r: Math.random() * 2.5 + 0.5,
                alpha: Math.random() * 0.5 + 0.5,
                twinkleDir: Math.random() > 0.5 ? 1 : -1,
                twinkleSpeed: Math.random() * 0.025 + 0.01,
                depth: Math.random() * 4 + 0.5, // Crucial for 3D mouse field layering
                color: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'rgba(200, 220, 255,' : 'rgba(255, 230, 200,') : 'rgba(255, 255, 255,'
            });
        }
    }

    function drawSpace() {
        // Interpolate mouse physics natively into frame
        currentMX += (targetMX - currentMX) * 0.03;
        currentMY += (targetMY - currentMY) * 0.03;

        ctx.clearRect(0, 0, width, height);

        stars.forEach(star => {
            if (Math.random() > 0.85) {
                star.alpha += star.twinkleSpeed * star.twinkleDir;
                if (star.alpha > 1) {
                    star.alpha = 1;
                    star.twinkleDir = -1;
                } else if (star.alpha < 0.3) {
                    star.alpha = 0.3;
                    star.twinkleDir = 1;
                }
            }

            star.x -= star.depth * 0.04;
            star.y += star.depth * 0.05; // Added top -> bottom diagonal drift

            // Reassign wrapped horizontal AND vertical coordinates dynamically
            if (star.x < -100) {
                star.x = width + 100;
                star.y = Math.random() * (height + 200) - 100;
            }
            if (star.y > height + 100) {
                star.y = -100;
                star.x = Math.random() * (width + 200) - 100;
            }

            // Calculate true deep-space layered mouse offsets
            const drawX = star.x + (currentMX * star.depth * 15);
            const drawY = star.y + (currentMY * star.depth * 15);

            if (star.r > 1.0) {
                ctx.shadowBlur = Math.random() * 15 + 5;
                ctx.shadowColor = 'rgba(255, 255, 255, 1)';
            } else {
                ctx.shadowBlur = 0;
            }

            ctx.beginPath();
            ctx.arc(drawX, drawY, star.r, 0, Math.PI * 2);
            ctx.fillStyle = `${star.color}${star.alpha})`;
            ctx.fill();
        });

        // Trigger Sporadic Shooting Stars
        if (Math.random() > 0.985) {
            shootingStars.push({
                x: Math.random() * width + 200, // spawn slightly further right
                y: -50,
                length: Math.random() * 80 + 30,
                speed: Math.random() * 15 + 10,
                angle: Math.PI / 4 + (Math.random() * 0.1 - 0.05), // ~45 deg downward
                opacity: 1
            });
        }

        // Render Shooting Stars
        ctx.shadowBlur = 0;
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            let ss = shootingStars[i];
            ss.x -= Math.cos(ss.angle) * ss.speed;
            ss.y += Math.sin(ss.angle) * ss.speed;
            ss.opacity -= 0.02;

            if (ss.opacity <= 0 || ss.x < -100 || ss.y > height + 100) {
                shootingStars.splice(i, 1);
                continue;
            }

            // Gradient trail mapping
            let trail = ctx.createLinearGradient(ss.x, ss.y, ss.x + Math.cos(ss.angle) * ss.length, ss.y - Math.sin(ss.angle) * ss.length);
            trail.addColorStop(0, `rgba(255, 255, 255, ${ss.opacity})`);
            trail.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.moveTo(ss.x, ss.y);
            ctx.lineTo(ss.x + Math.cos(ss.angle) * ss.length, ss.y - Math.sin(ss.angle) * ss.length);
            ctx.strokeStyle = trail;
            ctx.lineWidth = ss.opacity * 2;
            ctx.stroke();
        }

        requestAnimationFrame(drawSpace);

        // Broadcast interactive offsets directly to HTML/CSS layers
        const milkyWay = document.querySelector('.milky-way');
        const nebulaBg = document.querySelector('.nebula-bg');

        canvas.style.transform = `translateY(${currentScroll * 0.15}px)`;
        if (milkyWay) milkyWay.style.transform = `translate(${currentMX * 50}px, ${currentScroll * 0.3 + currentMY * 50}px) rotate(15deg)`;
        if (nebulaBg) nebulaBg.style.transform = `translate(${currentMX * -20}px, ${currentMY * -20}px)`; // Pushes nebula in opposite depth ratio
    }

    initCanvas();
    drawSpace();

    // Handle viewport fluidity
    window.addEventListener('resize', () => {
        // Debounce resize minimally
        clearTimeout(canvas.resizeTimeout);
        canvas.resizeTimeout = setTimeout(initCanvas, 150);
    });
}
