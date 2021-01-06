var TURN_SPEED = 0.06;
var ACCEL_SPEED = 0.04;
var MAX_SPEED = 3.0;
var X_MAX = 1200;
var Y_MAX = 500;
var SHOOT_SPEED = 7;
var MAX_BULLETS = 5;
var BULLET_LIFESPAN = 100;

function makeShip() {
    var ship = {
        x:200,
        y:200,
        xV:0.0,
        yV:0.0,
        accel:false,
        turningRight:false,
        turningLeft:false,
        direction:0.0,
        bullets:[],

        nextFrame: function() {
            removeDeadBullets(this.bullets);
            this.bullets.forEach(function(bullet) {
                bullet.nextFrame();
            });
            this.x += this.xV;
            this.y += this.yV;
            this.x = this.x % X_MAX;
            this.y = this.y % Y_MAX;
            if (this.x < 0) {
                this.x += X_MAX;
            }
            if (this.y < 0) {
                this.y += Y_MAX;
            }
            if (this.accel) {
                yAccel = Math.sin(this.direction) * ACCEL_SPEED;
                xAccel = Math.cos(this.direction) * ACCEL_SPEED;
                this.xV += xAccel;
                this.yV += yAccel;
                if (this.xV > MAX_SPEED) {
                    this.xV = MAX_SPEED;
                }
                if (this.yV > MAX_SPEED) {
                    this.yV = MAX_SPEED;
                }
                if (this.xV < MAX_SPEED * -1) {
                    this.xV = MAX_SPEED * -1;
                }
                if (this.yV < MAX_SPEED * -1) {
                    this.yV = MAX_SPEED * -1;
                }
            }
            if (this.turningRight) {
                this.direction += TURN_SPEED;
            }
            else if (this.turningLeft) {
                this.direction -= TURN_SPEED;
            }
        },
        draw: function() {
            this.bullets.forEach(function(bullet) {
                bullet.draw();
            });

            var distMidToNose = 10;
            var distMidToRight = 5;
            var distMidToLeft = 5;
            var frontTipX = this.x + distMidToNose * Math.cos(this.direction);
            var frontTipY = this.y + distMidToNose * Math.sin(this.direction);
            var rightBackX = this.x + distMidToRight * Math.cos(this.direction + degreesToRadians(120));
            var rightBackY = this.y + distMidToRight * Math.sin(this.direction + degreesToRadians(120));
            var leftBackX = this.x + distMidToLeft * Math.cos(this.direction + degreesToRadians(240));
            var leftBackY = this.y + distMidToLeft * Math.sin(this.direction + degreesToRadians(240));
            var pointSize = 3;
            var ctx = document.getElementById("canvas").getContext("2d");

            ctx.fillStyle = '#FFFFFF';

            ctx.beginPath();
            ctx.moveTo(frontTipX, frontTipY);
            ctx.lineTo(rightBackX, rightBackY);
            ctx.lineTo(leftBackX, leftBackY);
            ctx.fill();
        },
        shoot: function() {
            var shootXV = SHOOT_SPEED * Math.cos(this.direction);
            var shootYV = SHOOT_SPEED * Math.sin(this.direction);
            if (this.bullets.length < 5) {
                var bullet = makeBullet(this.x, this.y, shootXV, shootYV);
                this.bullets.push(bullet);
            }
        },
        collides: function(barrier) {
            var distMidToNose = 10;
            var distMidToRight = 5;
            var distMidToLeft = 5;
            var frontTipX = this.x + distMidToNose * Math.cos(this.direction);
            var frontTipX2 = frontTipX + this.xV;
            var frontTipY = this.y + distMidToNose * Math.sin(this.direction);
            var frontTipY2 = frontTipY + this.yV;
            var rightBackX = this.x + distMidToRight * Math.cos(this.direction + degreesToRadians(120));
            var rightBackX2 = rightBackX + this.xV;
            var rightBackY = this.y + distMidToRight * Math.sin(this.direction + degreesToRadians(120));
            var rightBackY2 = rightBackY + this.yV;
            var leftBackX = this.x + distMidToLeft * Math.cos(this.direction + degreesToRadians(240));
            var leftBackX2 = leftBackX + this.xV;
            var leftBackY = this.y + distMidToLeft * Math.sin(this.direction + degreesToRadians(240));
            var leftBackY2 = leftBackY + this.yV;
            var collision = false;
            if (linesIntersect(frontTipX, frontTipY, frontTipX2, frontTipY2, barrier.x1, barrier.y1, barrier.x2, barrier.y2)) {
                collision = true;
            }
            if (linesIntersect(rightBackX, rightBackY, rightBackX2, rightBackY2, barrier.x1, barrier.y1, barrier.x2, barrier.y2)) {
                collision = true;
            }
            if (linesIntersect(leftBackX, leftBackY, leftBackX2, leftBackY2, barrier.x1, barrier.y1, barrier.x2, barrier.y2)) {
                collision = true;
            }
            return collision;
        },
        bounceOff: function(barrier) {
            var barrierAngle = Math.atan2(barrier.y2-barrier.y1, barrier.x2-barrier.x1);
            var velocityAngle = Math.atan2(this.yV, this.xV);
            var velocityMagnitude = Math.sqrt(Math.pow(this.xV, 2) + Math.pow(this.yV, 2));
            var contactAngle = barrierAngle - velocityAngle;
            console.log('Adding to direction: ' + contactAngle * 2);
            var newVelocityAngle = velocityAngle + (contactAngle * 2);
            this.xV = velocityMagnitude * Math.cos(newVelocityAngle);
            this.yV = velocityMagnitude * Math.sin(newVelocityAngle);
        }
    }
    return ship;
}

function linesIntersect(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
    var am = (ay2 - ay1) / (ax2 - ax1);
    var ab = ay1 - (am * ax1);
    var bm = (by2 - by1) / (bx2 - bx1);
    var bb = by1 - (bm * bx1);
    if (am - bm == 0) {
        return false;
    }
    var intersectX = (bb - ab) / (am - bm);
    var intersectY = (am * intersectX) + ab;
    if ((intersectX <= ax1 && intersectX >= ax2 || intersectX >= ax1 && intersectX <= ax2) &&
        (intersectX <= bx1 && intersectX >= bx2 || intersectX >= bx1 && intersectX <= bx2) &&
        (intersectY <= ay1 && intersectY >= ay2 || intersectY >= ay1 && intersectY <= ay2) &&
        (intersectY <= by1 && intersectY >= by2 || intersectY >= by1 && intersectY <= by2)) {
        return true;
    }
    return false;
}

function makeBullet(x, y, xV, yV) {
    var bullet = {
        x: x,
        y: y,
        xV: xV,
        yV: yV,
        lifespan: BULLET_LIFESPAN,
        destroyed: false,
        nextFrame: function() {
            if (!this.destroyed) {
                this.x += this.xV;
                this.y += this.yV;
                this.lifespan--;
            }
            if (this.lifespan <= 0) {
                this.destroyed = true;
            }
        },
        draw: function() {
            var pointSize = 1;
            var ctx = document.getElementById("canvas").getContext("2d");

            ctx.fillStyle = '#FFFFFF';

            ctx.beginPath();
            ctx.arc(this.x, this.y, pointSize, 0, Math.PI * 2, true);
            ctx.fill();
        }
    }
    return bullet;
}

function degreesToRadians(degrees) {
    var pi = Math.PI;
    return degrees * (pi/180);
}

function clearScreen() {
    document.getElementById("canvas").getContext("2d").clearRect(0, 0, X_MAX, Y_MAX);
}

function getBarriers() {
    var barriers = [
        {x1:50, y1:10, x2:80, y2: 500},
        {x1:800, y1:10, x2:1050, y2: 500},
        {x1:20, y1:20, x2: 1000, y2:50},
        {x1:20, y1:420, x2: 1300, y2:480}
    ];

    return barriers;
}

function drawBarriers(barriers) {
    barriers.forEach(function(barrier) {
        drawBarrier(barrier);
    });
}

function drawBarrier(barrier) {
    var ctx = document.getElementById("canvas").getContext("2d");

    ctx.fillStyle = '#FFFFFF';

    ctx.beginPath();
    ctx.moveTo(barrier.x1, barrier.y1);
    ctx.lineTo(barrier.x2, barrier.y2);
    ctx.lineTo(barrier.x2+1, barrier.y2+1);
    ctx.lineTo(barrier.x1+1, barrier.y1+1);
    ctx.fill();
}

function begin() {
    var ship = makeShip();
    var barriers = getBarriers();
    var canvas = document.getElementById("canvas");
    document.addEventListener("keydown", (event) => {
        event.preventDefault();
        if (event.keyCode == 37) { // Left arrow key
            ship.turningLeft = true;
        } else if (event.keyCode == 38) { // up arrow key
            ship.accel = true;
        } else if (event.keyCode == 39) { // right arrow key
            ship.turningRight = true;
        } else if (event.keyCode == 32) { // space bar
            ship.shoot();
        }
    });

    document.addEventListener("keyup", (event) => {
        event.preventDefault();
        if (event.keyCode == 37) { // Left arrow key
            ship.turningLeft = false;
        } else if (event.keyCode == 38) { // up arrow key
            ship.accel = false;
        } else if (event.keyCode == 39) { // right arrow key
            ship.turningRight = false;
        } else if (event.keyCode == 32) { // space bar
            // shoot gun
        }
    });
    createProcessingSections();
    window.setInterval(() => {
        ship.nextFrame();
        configureProcessingSections(ship, barriers);
        checkForCollisions(barriers, ship);
        clearScreen();
        drawBarriers(barriers);
        ship.draw();
    }, 1000 / 60);
}

function removeDeadBullets(bullets) {
    deadBulletsIndexes = [];
    bullets.forEach(function(bullet, index) {
        if (bullet.destroyed) {
            deadBulletsIndexes.push(index);
        }
    });
    deadBulletsIndexes.forEach(function(index) {
        bullets.splice(index, 1);
    });
}

// HANDLE PROCESSING IN SPATIAL CHUNKS FOR PERFORMANCE:
var processingSectionSize = 80;
var processingSectionOverlap = 40;
var processingSections = [];

function createProcessingSections() {
    var x = 0;
    var y = 0;

    for (var j = 0; j * (processingSectionSize - processingSectionOverlap) < X_MAX; j++) {
        for (var k = 0; k * (processingSectionSize - processingSectionOverlap) < Y_MAX; k++) {
            var processingSection = {
                left: j * processingSectionSize - j * processingSectionOverlap,
                right: (j + 1) * processingSectionSize - j * processingSectionOverlap,
                top: k * processingSectionSize - k * processingSectionOverlap,
                bottom: (k + 1) * processingSectionSize - k * processingSectionOverlap,
                ships: [],
                bullets: [],
                barriers: []
            };
            processingSections.push(processingSection);
        }
    }
}

function configureProcessingSections(ship, barriers) {
    processingSections.forEach(function (section) {
        section.barriers = [];
        section.ships = [];
        section.bullets = [];
    });
    addShipToProcessingSections(ship);
    addBarriersToProcessingSections(barriers);
}

function addShipToProcessingSections(ship) {
    addBulletsToProcessingSections(ship.bullets);
    ship.processingSections = [];
    processingSections.forEach(function (section) {
        if (ship.x >= section.left && ship.x < section.right && ship.y >= section.top && ship.y < section.bottom) {
            section.ships.push(ship);
            ship.processingSections.push(section);
        }
    });
}

function addBulletsToProcessingSections(bullets) {
    bullets.forEach(function(bullet) {
        bullet.processingSections = [];
        processingSections.forEach(function (section) {
            if (bullet.x >= section.left && bullet.x < section.right && bullet.y >= section.top && bullet.y < section.bottom) {
                section.bullets.push(bullet);
                bullet.processingSections.push(section);
            }
        });
    });
}

function addBarriersToProcessingSections(barriers) {
    barriers.forEach(function (barrier) {
        barrier.processingSections = [];
        processingSections.forEach(function (section) {
            // if it is a vertical line, use this approach
            if (barrier.x2 == barrier.x1) {
                if (((barrier.x1 >= section.left && barrier.x1 < section.right)
                    || (barrier.x2 >= section.left && barrier.x2 < section.right)
                    || (barrier.x1 >= section.left && barrier.x1 >= section.right && barrier.x2 < section.left && barrier.x2 < section.right)
                    || (barrier.x1 < section.left && barrier.x1 < section.right && barrier.x2 >= section.left && barrier.x2 >= section.right))
                    && ((barrier.y1 >= section.top && barrier.y1 < section.bottom)
                        || (barrier.y2 >= section.top && barrier.y2 < section.bottom)
                        || (barrier.y1 >= section.top && barrier.y1 >= section.bottom && barrier.y2 < section.top && barrier.y2 < section.bottom)
                        || (barrier.y1 < section.top && barrier.y1 < section.bottom && barrier.y2 >= section.top && barrier.y2 >= section.bottom))) {
                    section.barriers.push(barrier);
                    barrier.processingSections.push(section);
                }
            } else { // Otherwise, convert line to slope-intercept form
                var match = false;
                var m = (barrier.y2 - barrier.y1) / (barrier.x2 - barrier.x1);
                var b = barrier.y1 - (m * barrier.x1);
                var xCheck = (section.top - b) / m;
                if (xCheck <= section.right && xCheck >= section.left) {
                    match = true;
                }
                xCheck = (section.bottom - b) / m;
                if (xCheck <= section.right && xCheck >= section.left) {
                    match = true;
                }
                var yCheck = (m * section.left) + b;
                if (yCheck <= section.top && yCheck >= section.bottom) {
                    match = true;
                }
                yCheck = (m * section.right) + b;
                if (yCheck <= section.top && yCheck >= section.bottom) {
                    match = true;
                }
                if (match) {
                    section.barriers.push(barrier);
                    barrier.processingSections.push(section);
                }
            }
        });
    });
}

function checkForCollisions(barriers, ship) {
    var shipSections = ship.processingSections;
    var allLocalBarriers = [];
    shipSections.forEach(function(section) {
        allLocalBarriers.push.apply(allLocalBarriers, section.barriers);
    });
    allLocalBarriers.forEach(function(barrier) {
        if (ship.collides(barrier)) {
            ship.bounceOff(barrier);
        }
    });
}


begin();





