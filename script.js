const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");

let score = 0;
let lives = 3;
let gameOver = false;
let highScore = localStorage.getItem("highScore") || 0;

const player = {
    x: 225,
    y: 620,
    width: 50,
    height: 50,
    speed: 7
};

const keys = {};
const bullets = [];
const enemies = [];
const explosions = [];
const stars = [];
const powers = [];

let boss = null;
let laserMode = false;

for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 2 + 1
    });
}

document.addEventListener("keydown", e => {
    keys[e.key] = true;

    if (e.code === "Space" && !gameOver) {
        bullets.push({
            x: player.x + 22,
            y: player.y,
            power: laserMode ? 3 : 1
        });
    }

    if (e.key.toLowerCase() === "r" && gameOver) {
        location.reload();
    }
});

document.addEventListener("keyup", e => {
    keys[e.key] = false;
});

function spawnEnemy() {
    if (!gameOver && !boss) {
        enemies.push({
            x: Math.random() * 450,
            y: -40,
            width: 40,
            height: 40,
            speed: 2 + Math.random() * 3
        });
    }
}

setInterval(spawnEnemy, 800);

setInterval(() => {
    if (!gameOver) {
        powers.push({
            x: Math.random() * 450,
            y: 0
        });
    }
}, 10000);

function update() {
    if (gameOver) return;

    if (keys["ArrowLeft"] && player.x > 0)
        player.x -= player.speed;

    if (keys["ArrowRight"] && player.x < canvas.width - player.width)
        player.x += player.speed;

    stars.forEach(star => {
        star.y += star.speed;

        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });

    bullets.forEach((bullet, bi) => {
        bullet.y -= 10;

        if (bullet.y < 0) {
            bullets.splice(bi, 1);
        }
    });

    enemies.forEach((enemy, ei) => {
        enemy.y += enemy.speed;

        if (enemy.y > canvas.height) {
            enemies.splice(ei, 1);
            lives--;

            if (lives <= 0) {
                gameOver = true;
            }
        }

        if (
            enemy.x < player.x + player.width &&
            enemy.x + enemy.width > player.x &&
            enemy.y < player.y + player.height &&
            enemy.y + enemy.height > player.y
        ) {
            enemies.splice(ei, 1);

            explosions.push({
                x: enemy.x,
                y: enemy.y,
                radius: 10
            });

            lives--;

            if (lives <= 0) {
                gameOver = true;
            }
        }

        bullets.forEach((bullet, bi) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + 5 > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + 10 > enemy.y
            ) {
                enemies.splice(ei, 1);
                bullets.splice(bi, 1);

                explosions.push({
                    x: enemy.x,
                    y: enemy.y,
                    radius: 10
                });

                score++;
            }
        });
    });

    if (score >= 20 && boss === null) {
        boss = {
            x: 150,
            y: 50,
            width: 200,
            height: 80,
            hp: 30,
            dir: 1
        };
    }

    if (boss) {
        boss.x += boss.dir * 3;

        if (
            boss.x <= 0 ||
            boss.x + boss.width >= canvas.width
        ) {
            boss.dir *= -1;
        }

        bullets.forEach((bullet, bi) => {
            if (
                bullet.x > boss.x &&
                bullet.x < boss.x + boss.width &&
                bullet.y > boss.y &&
                bullet.y < boss.y + boss.height
            ) {
                bullets.splice(bi, 1);
                boss.hp -= bullet.power;

                if (boss.hp <= 0) {
                    score += 50;
                    boss = null;
                }
            }
        });
    }

    powers.forEach((p, i) => {
        p.y += 2;

        if (
            p.x < player.x + player.width &&
            p.x + 20 > player.x &&
            p.y < player.y + player.height &&
            p.y + 20 > player.y
        ) {
            powers.splice(i, 1);

            laserMode = true;

            setTimeout(() => {
                laserMode = false;
            }, 5000);
        }
    });

    explosions.forEach((exp, i) => {
        exp.radius += 2;

        if (exp.radius > 30) {
            explosions.splice(i, 1);
        }
    });

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }

    scoreEl.innerText =
        `Score: ${score} ❤️ ${lives} 🏆 ${highScore}`;
}

function draw() {
    ctx.fillStyle = "#000015";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(
            star.x,
            star.y,
            star.size,
            0,
            Math.PI * 2
        );
        ctx.fill();
    });

    ctx.fillStyle = "cyan";
    ctx.beginPath();
    ctx.moveTo(player.x + 25, player.y);
    ctx.lineTo(player.x, player.y + 50);
    ctx.lineTo(player.x + 50, player.y + 50);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = laserMode ? "lime" : "yellow";

    bullets.forEach(bullet => {
        ctx.fillRect(
            bullet.x,
            bullet.y,
            5,
            15
        );
    });

    ctx.fillStyle = "red";

    enemies.forEach(enemy => {
        ctx.fillRect(
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height
        );
    });

    ctx.fillStyle = "lime";

    powers.forEach(p => {
        ctx.beginPath();
        ctx.arc(
            p.x,
            p.y,
            10,
            0,
            Math.PI * 2
        );
        ctx.fill();
    });

    explosions.forEach(exp => {
        ctx.strokeStyle = "orange";
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(
            exp.x + 20,
            exp.y + 20,
            exp.radius,
            0,
            Math.PI * 2
        );

        ctx.stroke();
    });

    if (boss) {
        ctx.fillStyle = "purple";
        ctx.fillRect(
            boss.x,
            boss.y,
            boss.width,
            boss.height
        );

        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(
            "BOSS HP: " + boss.hp,
            boss.x + 40,
            boss.y - 10
        );
    }

    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText(
            "GAME OVER",
            120,
            300
        );

        ctx.font = "25px Arial";
        ctx.fillText(
            "R bosib qayta boshlang",
            90,
            350
        );
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
