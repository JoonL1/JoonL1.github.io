/* Project: Starry Juxtaposition 

• Background [Mountain Range] Derived as a Continuation of Project: "Rocky Frontiers" by @Joon111: 

https://www.khanacademy.org/computer-programming/rocky-frontiers-advanced-javascript-natural-simulations-noise-project-mountain-range/5925118952914944

And

• Background [Starry Foreground] Derived from Program: "The Station" by @dreamingoftokyo:

https://www.khanacademy.org/computer-programming/the-station/5909578440032256



• Force Manipulation [Predator-Prey Relationship Mechanics] Inspired from Project: "Spin-off of 'Project: Creature Comforts and Critter Jitters'" by Anthony 

https://www.khanacademy.org/computer-programming/spin-off-of-project-creature-comforts-and-critter-jitters/4558274919219200



• Foreground Inspired from Project: "Swimming Fish" by @jt654321:

https://www.khanacademy.org/computer-programming/swimming-fish-spin-off-of-project-computational-creatures/5620365525516288

And

• Project: "Spin-off of 'Project: Curling, Crawling, Circling Creatures'" by Harley:

https://www.khanacademy.org/computer-programming/spin-off-of-project-curling-crawling-circling-creatures/6315232407060480

*/

angleMode = "radians";

frameRate(15);

/*Global variables.*/

var skyColor = color(167, 237, 242);

/*Water tank.*/

/*Appearance and size.*/
var wtHeight = height * (2/5);
var wtColor = color(9, 230, 212);

/*Forces.*/
var waterWavAngVel = PI / 45; // Waving angular velocity.
var waterWaveNumber = 1;     // Water waving wave number.
var waterFriction = 50;         // Water friction coefficient.

/*Branch.*/

/*Forces on branches.*/
var branchDensity = 0.98;       // Branches material density.
var branchAVelLimit = 0.03;     // Angular velocity limit.
var branchWaterCoeff = 0.4;   // Water force coefficient.


/*Appearance of branches.*/
var branchColor = color(17, 219, 105,220);  // The branch color.
var growShapeRatio = 0.12;              // thickness vs. length rate.
var growRate = 0.5;                    // growing rate.

/*Fruit.*/
var branchFruitColor = color(199, 144, 4); // The fruit color.
var branchFruitSizeFactor = 0.3; // fruit size/branch length ratio.
var fruitDensity = 1.2;     // Fruit is denser than water.

/*Tree.*/
var ramificationThreshold = height/3; // Threshold height for new branches.
var branchesAngle = 80;         // Angle between branches in degrees.
var ramificationCoeff = 2;      // How many branches are formed.
var branchesStartRatio = 1/10;  // Threshold fraction.
var branchingProb = 1/30;      // Chances to fork.
var treeSize = 15;              // Max branches in a tree.
var treesCount = 1;             // Trees count.

/*Normal fishes */
var impulseVelocity = 8;    // How energetically the fishes push.
var creaturesCount = 5;     // How many baby-fishes.
var speedThreshold = 2;     // Threshold velocity for impulse.
var attraction = 14;        // Attraction toward the Sun.
var fishAttraction = 21;    // Attraction toward the brother fish. 
var fishBaseMass = 1;       // Constant for the fishes mass.
var gravityMag = 0.3;       // Gravity acceleration coefficient
var fishWaterFriction = 0.03; // Water friction on the fish.
/* Create an array of PVectors */
var createPVArray = function(xArray, yArray) {
    var pVArray = [];
    for(var k = 0; k < min(xArray.length, yArray.length); k++) {
        pVArray.push(new PVector(xArray[k], yArray[k]));   
    }
    return pVArray;
};

/* PVectors array for the fish shape*/
var xFish = [-32, -35, -25, -20, -15, -10, -5,  2,  5,    
               2,  -5, -10, -15, -20, -25, -35,-32];
               
var yFish = [ 0, -9, -2, -5, -7, -8,  -7,  -3,   0,
               3, 7,  8,  7,  5,   2,  9,  0];
               
var fishShape = createPVArray(xFish, yFish);

/* Bottom fin.*/
var xBFin = [-22, -9, -18];
var yBFin = [ -12,-8,  -7];
var bFin = createPVArray(xBFin, yBFin);

/*Strange fishes shape.*/
var xFishSn = [ 3.5,  1.5,    0, -0.5,   -1, -2.5,   -5, -7.5,  -10,
              -12.5,  -15,-17.5,  -20,-22.5,  -25,-27.5,  -33, -15,
                -33, -27.5, -25, -22.5, -20,-17.5,  -15, -12.5,
               -10,  -7.5,   -5, -2.5,   -1, -0.5,    0,  1.5,  3.5];
               
var yFishSn = [-0.5, -1.5, -2.0, -1.5, -1.5,  -0.5,  -0.5, -0.8,  -1,
                -1.5,   -2, -2.5,   -3,  -3.5,   -4,  -4.5,   -5,  0,
                  5,  4.5,    4,  3.5,     3,  2.5,    2,   1.5,
                  1,  0.8,  0.5,  0.5,   1.5,  1.5,  2.0,  1.5, 0.5];
               
var fishShapeSn = createPVArray(xFishSn, yFishSn);              

/* Creatures life.*/
var fishLifeLength = 230;
var fishLiveCons = 0.2;
var fishLiveConsMin = 0.07;

var fishMassLimit = 3;
var fishMassGain = 0.3;

var maxPopulationSize = 6;



// First pointing position until the fruits are ready to be eaten.
var mousePosition = new PVector(width * 1/2, height* 1/4);

/*The water tank, a simple object that draw itself
  as a rectangle and make some waves.*/
var WaterTank = function(wth, wtc) {
    this.wtHeight = wth;
    this.wtColor = wtc;
    this.waveAV = waterWavAngVel;
    this.waveN = waterWaveNumber;
    this.friction = waterFriction;
};

WaterTank.prototype.display = function() {
    noStroke();
    fill(this.wtColor);
    rect(0, height - this.wtHeight, width, this.wtHeight);
};

WaterTank.prototype.fishInside = function(mover) {
    return mover.position.y > height - this.wtHeight;
};

/*Branch, basic element of a tree.*/
var Branch = function(basePos, lgth, angle, threshold, density) {
    
    /*Basic characteristics.*/
    
    /* Branch base.*/
    this.basePos = basePos;
    
    /* Branch length.*/
    this.lgth = lgth;
    
    /* Branch inclination.*/
    this.angle = angle;
    
    /*Branch thickness*/
    this.thickness = 1.0;
    
    /*Density*/
    this.density = density;
    
    /*Parent branch.*/
    this.parentBranch = null;
    
    /*Is final*/
    this.isFinal = true;
    
    /*Forking threshold.*/
    this.threshold = threshold;
    
    /*Movements.*/
    this.aVelocity = 0.0;
    
    this.aAcceleration = 0.0;
  
};

/*Display a branch.*/
Branch.prototype.display = function() {
    var finalPos = this.finalPos();
    noFill();
    stroke(branchColor);
    strokeWeight(this.thickness);
    line(this.basePos.x, this.basePos.y,
        finalPos.x, finalPos.y);
};

/* Branch update method.*/
Branch.prototype.update = function() {
    if(this.parentBranch !== null) {
        this.basePos = this.parentBranch.finalPos();   
    }
    this.aVelocity += this.aAcceleration;
    this.aVelocity = constrain(this.aVelocity,
                    -branchAVelLimit, branchAVelLimit);
                    
    this.angle += this.aVelocity;
    
    this.aAcceleration = 0;
};

/* Branch apply torque.*/
Branch.prototype.applyTorque = function(torque) {
    var momInert = this.calcInMom();
    this.aAcceleration += torque / momInert;
};

/* Branch grow method.*/
Branch.prototype.grow = function() {
    this.lgth += growRate;
    this.thickness += growShapeRatio * growRate;
    this.thickness = constrain(this.thickness, 0, 10);
};

/*Branch grow thickness only.*/
Branch.prototype.growThickness = function() {
    this.thickness += growShapeRatio * growRate;
    this.thickness = constrain(this.thickness, 0, 10);
};

/*Help: get final point.*/
Branch.prototype.finalPos = function() {
    var branchVector = new PVector(0, -this.lgth);
    branchVector.rotate(this.angle);
    branchVector.add(this.basePos);
    return branchVector;
};

/*Help: momentum of inertia.*/
Branch.prototype.calcInMom = function() {
    return (1/3) * pow(this.lgth, 3) *
            PI * pow(this.thickness, 2) * 0.25 *
            this.density;
};

/*Help: calculate water waving torque.*/
Branch.prototype.calcWavMom = function(waterTank) {
    if(this.basePos.y > height - waterTank.wtHeight) {
        return this.thickness * this.lgth *
            branchWaterCoeff * 
            sin(waterTank.waveAV * frameCount -
                waterTank.waveN * this.basePos.x) * cos(this.angle);
    } else {
            return 0;
        }
};

/*Help: calculate water friction.*/
Branch.prototype.calcWaterFriction = function(waterTank) {
    if(this.basePos.y > height - waterTank.wtHeight) {
        return -waterTank.friction * this.aVelocity *
            this.thickness * this.lgth;
    } else {
        return 0;   
    }
};

/*Help: calculate torque.*/
Branch.prototype.calcMom = function(density, lgth) {
    return (PI * this.thickness * this.thickness * 0.125) *
            9.81 * pow(lgth ,2) * sin(this.angle) * density * 0.001;
};

/*Help: calculate length under water*/
Branch.prototype.calcLUW = function(waterTank) {
    var pos = this.finalPos();
    if(min(pos.y, this.basePos.y) >= height - waterTank.wtHeight) {
        return this.lgth;   
    } else if (max(pos.y, this.basePos.y) <= height - 
                                        waterTank.wtHeight ) {
        return 0;
    } else {
        return this.lgth * (max(pos.y, this.basePos.y) - 
            height + waterTank.wtHeight)/abs(pos.y - this.basePos.y);
    }
};

/*Help: calculate flotation force.*/
Branch.prototype.calcFlotMom = function(waterTank) {
    var specForce;
    var pos = this.finalPos();
    if(min(pos.y, this.basePos.y) >= height - waterTank.wtHeight) {
        
        return  this.calcMom(this.density -1, this.lgth);
        
    } else if (max(pos.y, this.basePos.y) <= height - 
                                        waterTank.wtHeight ) {
        return  this.calcMom(this.density, this.lgth);
        
    } else if (pos.y < this.basePos.y) {
        
        return  this.calcMom(this.density, this.lgth) +
            this.calcMom(-1, this.calcLUW(waterTank));
            
    } else if (pos.y > this.basePos.y) {
        
        return  -this.calcMom(this.density, this.lgth) -
            this.calcMom(-1, this.lgth - this.calcLUW(waterTank));
            
    } else {
        return  this.calcMom(this.density, this.lgth);
    }
};

/* Branch check grow limit.*/
Branch.prototype.growLimit = function() {
    return this.lgth >= this.threshold;  
};

/*A fruit as inherited object from a branch.*/
var Fruit = function(angle, threshold, density) {
    Branch.call(this, new PVector(width/2, height), 1, 
                    angle,threshold, density);
};

Fruit.prototype = Object.create(Branch.prototype);

Fruit.prototype.display = function() {
    noStroke();
    fill(branchFruitColor);
    pushMatrix();
    translate(this.basePos.x, this.basePos.y);
    rotate(this.angle);

    bezier(0, 0 ,
            this.thickness * branchFruitSizeFactor * 8,
            -this.lgth * branchFruitSizeFactor,
            -this.thickness * branchFruitSizeFactor * 8,
            -this.lgth * branchFruitSizeFactor,
            0,0);
    
    popMatrix();
};

/*Return the central position of the fruit.*/
Fruit.prototype.center = function() {
    var cntr = new PVector(this.lgth/2 * sin(this.angle) * branchFruitSizeFactor,
            -this.lgth/2 * cos(this.angle) * branchFruitSizeFactor);
    //cntr.rotate(this.angle);
    cntr.add(this.basePos);
    return cntr;
};

/*Eat a fruit.*/
Fruit.prototype.eat = function() {
    this.lgth = 1.0;
    this.thickness = 1.0;
};

/* Fruit is grown enough to be eaten.*/
Fruit.prototype.fruitReady = function() {
    return this.lgth > 9/10 * this.threshold;
};


/*Fish is close enough*/
Fruit.prototype.canEat = function(whereCreature) {
    return (PVector.dist(this.center(), whereCreature) < 
            this.lgth/4 && this.fruitReady());
};

/* Tree, an object made by branches.*/
var Tree = function(waterTank) {
  this.branches = [];
  this.branches.push(new Branch(new PVector(width/2, height),
                        ramificationThreshold * branchesStartRatio,
                        0*(PI/180),
                        random(ramificationThreshold/3,
                                        ramificationThreshold),
                        branchDensity));
    this.wt = waterTank;
};

/*Fork tree.*/ 
Tree.prototype.fork = function(index) {
    if((index >=0) && (index < this.branches.length)) {
        if(this.branches[index].isFinal) {
            for(var j = 0; j <ramificationCoeff; j++) {
            this.branches.push(new Branch(
                new PVector(random(0, width), height),
                    ramificationThreshold * branchesStartRatio,
                    (j-(ramificationCoeff-1)/2) *
                            random(branchesAngle * 1.4,
                                        branchesAngle * 0.6) *
                                (PI/180), 
                    random(ramificationThreshold/3,
                                    ramificationThreshold),
                                    branchDensity));
    this.branches[this.branches.length -1].parentBranch = this.branches[index];
            }
            this.branches[index].isFinal = false;
            
        }
    }
};

/*Grow fruits.*/
Tree.prototype.growFruits = function(index) {
    if((index >=0) && (index < this.branches.length)) {
        if(this.branches[index].isFinal &&
            !(this.branches[index] instanceof Fruit)) {
            this.branches.push(new Fruit(random(170,190),
            random(ramificationThreshold/4,ramificationThreshold),
            fruitDensity));
    this.branches[this.branches.length -1].parentBranch = this.branches[index];
    this.branches[index].isFinal = false;
        }
    }
};

/*Eaten fruits*/
Tree.prototype.eatFruits = function(fish) {
    var j = 0;
    while (j < this.branches.length) {
        if(this.branches[j] instanceof Fruit) {
            if(this.branches[j].canEat(fish.position)) {
                this.branches[j].eat();
                if(fish.lifeDecr > fishLiveConsMin) {
                    fish.lifeDecr *= 0.8;
                }
                if(fish.mass < fishMassLimit) {
                    fish.mass += fishMassGain;   
                }
                fish.childFishMass += fishMassGain;
                
            } else if (this.branches[j].fruitReady() &&
                fish.hasNoEatableGoal()) {
                fish.goal = this.branches[j];
            }
        }
        j++;
    }
};

/* Run Tree*/
Tree.prototype.run = function() {
    var presentArrayLength = this.branches.length;

        for(var i = 0; i<presentArrayLength ; i++) {
            
            if(random(0,1) < branchingProb/ramificationCoeff) {
                if(presentArrayLength < treeSize) {
                    this.fork(i);
                } else if (presentArrayLength  < 2 * treeSize) {
                    this.growFruits(i);
                }
            }
        }
        
    for(var i = 0; i<this.branches.length; i++) {
        if(presentArrayLength < treeSize) {
            if(!this.branches[i].growLimit()) {
                this.branches[i].grow();
            } else {
               this.branches[i].growThickness();   
            }
        } else {
            if(this.branches[i] instanceof Fruit &&
                !this.branches[i].growLimit()) {
                this.branches[i].grow();
            }
            
        }
        this.branches[i].applyTorque(
                    this.branches[i].calcWavMom(this.wt));
        this.branches[i].applyTorque(
                    this.branches[i].calcFlotMom(this.wt));
        this.branches[i].applyTorque(
                    this.branches[i].calcWaterFriction(this.wt));
        this.branches[i].update();
        this.branches[i].display();
    }
};

/*Our fishes.*/
/* A Mover for the baby fish.*/
var Mover = function(coorX, coorY, mColor, mass, followedFish, 
                    mShape, mBFin, mWaterTank) {
    this.followedFish = followedFish;
    this.mass = mass;
    this.position = new PVector(coorX, coorY);
    this.velocity = PVector.rotate(
            new PVector(impulseVelocity,0),
            random(360));
    this.acceleration = new PVector(0,0);
    this.mColor = mColor;
    
    this.fShape = mShape;
    
    this.bFin = mBFin;
    
    this.fishWaving = 1;
    this.fishBending = 0;
    
    this.waterTank = mWaterTank;
    
    this.goal = null;
    
    this.timeToLive = fishLifeLength;
    
    this.lifeDecr = fishLiveCons;
    
    this.childFishMass = 0;
    
};


/* Align with motion direction.*/
Mover.prototype.alignFish = function(someVector, mSomeVersor) {
    
    var someVersor = mSomeVersor.get();
    someVersor.rotate(this.fishBending);
    
    /* Here this.fishWaving modify the position of
       each point.*/
    var output =  new PVector(someVector.x * someVersor.x *
                this.fishWaving + 
                someVector.y * someVersor.y , 
                someVector.x * someVersor.y * 
                this.fishWaving - 
                someVector.y * someVersor.x);
    output.mult(this.mass/2);
    output.add(this.position);
    
    return output;
    
};


/* Draw the baby fish .*/
Mover.prototype.display = function() {
    
    fill(this.mColor);
    stroke(this.mColor);
    strokeWeight(2);
    
    /* Calculate the versor from the velocity.*/
    var fishVersor = this.velocity.get();
    fishVersor.normalize();
    
    /* Take the points from the this.fShape
       then generate and adapt the shape.*/
    beginShape();
    for(var j = 0; j < this.fShape.length ; j++) {
        var mPoint = this.fShape[j].get();
        var fPoint = this.alignFish(mPoint,fishVersor);
        vertex(fPoint.x, fPoint.y ); 
    }
    endShape();
    
    /* Draw the eye.*/
    stroke(0,0,0);
    strokeWeight(this.mass*2);
    point(this.position.x, this.position.y);
    
    /* Draw the fins from this.bFin array. */
    stroke(175, 194, 242);
    fill(175, 194, 242);
    strokeWeight(this.mass*1/2);
    
    var fishBFin = [];
    
    for(var j = 0; j < this.bFin.length; j++) {
        fishBFin.push(this.alignFish(this.bFin[j].get(), fishVersor));
    }
    
    triangle(fishBFin[0].x, fishBFin[0].y, 
            fishBFin[1].x, fishBFin[1].y, 
            fishBFin[2].x, fishBFin[2].y);
    
    for(var j = 0; j < this.bFin.length; j++) {
        var fishFin = this.bFin[j].get();
        fishFin.y *= -0.95;
        fishFin.x *=  0.8;
        fishBFin.push(this.alignFish(fishFin, fishVersor));
    }
    
    triangle(fishBFin[3].x, fishBFin[3].y, 
        fishBFin[4].x, fishBFin[4].y, 
          fishBFin[5].x, fishBFin[5].y);
};

/* Oscillate tail.*/
Mover.prototype.oscillateTail = function() {
        this.fishWaving = 0.03 * this.velocity.mag() * 
                sin(frameCount * PI* 0.05 * this.velocity.mag()) + 
                    0.8; 
        this.fishBending = 0.05 * this.velocity.mag() * 
                sin(frameCount * PI* 0.0005 * this.velocity.mag()); 
};


/* Move the baby fishes. */
Mover.prototype.update = function() {
    this.applyImpulse(this.waterTank);
    this.applyForce(this.calculateFriction(this.waterTank));
    this.applyForce(this.calculateGravity(this.waterTank));
    this.velocity.add(this.acceleration);
    this.velocity.limit(10);
    this.position.add(this.velocity);
    this.checkFences();
    this.acceleration.mult(0);
    
    if(this.timeToLive > 0) {
        this.timeToLive -= this.lifeDecr;
    }
};

/* Check for the border, eventually change direction:
invert the velocity perpendicular component.*/
Mover.prototype.checkFences = function() {
    
    if(this.position.x > width && this.velocity.x > 0) {
         this.position.x = width;
         if(this.velocity.x !== 0) {
            this.velocity.x *= -1;
         } else {
            this.velocity.x = -1;
         }
    } else if (this.position.x < 0 && this.velocity.x < 0) {
        this.position.x = 0;
        if(this.velocity.x !== 0) {
            this.velocity.x *= -1;
        } else {
            this.velocity.x = 1;   
        }
    }
    
    if(this.position.y > height && this.velocity.y > 0) {
         this.position.y  = height;
         if(this.velocity.y !== 0) {
            this.velocity.y *= -1;
         } else {
            this.velocity.y = -1;   
         }
    } else if (this.position.y < 0 && this.velocity.y < 0) {
        this.position.y = 0;
        if(this.velocity.y !== 0) {
            this.velocity.y *= -1;
        } else {
            this.velocity.y = 1;   
        }
    }
};


/* Movement should be by repeated impulses, like a fish in the water
 food attraction is calculated only as the aby fish pushes.*/
Mover.prototype.applyImpulse = function(mWaterTank) {

    /* As the baby fish feels the speed is under a certain
    threshold, push again.*/
    if(this.velocity.mag() < speedThreshold &&
        mWaterTank.fishInside(this)) {
        this.velocity = PVector.mult(
            PVector.normalize(this.velocity),
            impulseVelocity * (this.timeToLive / fishLifeLength));
        /* Calculate the acceleration forward taking into
    account the friction opposite and proportional to the velocity. */
    if(this.followedFish === null) {
        this.applyForce(this.calculateFoodAttraction(attraction));
    } else {
        this.applyForce(this.calculateFoodAttraction(fishAttraction));
    }
    } 
    
    //println(this.isDead());
    
};

/* Method apply force.*/
Mover.prototype.applyForce = function(mForce) {
    var mAcc = mForce.get();
    mAcc.div(this.mass);
    this.acceleration.add(mAcc);
};

/* Calculate water friction, laminar flow.*/
Mover.prototype.calculateFriction = function(mWaterTank) {
    var frictionForce = this.velocity.get();
    if(mWaterTank.fishInside(this)) {
    frictionForce.mult(-fishWaterFriction);
    } else {
        frictionForce.mult(0);
    }
    return frictionForce;
};

/*Calculate gravity.*/
Mover.prototype.calculateGravity = function(mWaterTank) {
    var gravity;
    if (mWaterTank.fishInside(this)) {
        gravity = this.mass * 
            max((fishLifeLength - 3 * this.timeToLive) * 
                (gravityMag / fishLifeLength),0);
    } else {
        gravity = this.mass*gravityMag;
    }
    return new PVector(0,gravity);
};

/* Calculate attraction.*/
Mover.prototype.calculateFoodAttraction = function(attraction) {
    /* Calculate the acceleration toward the food.*/
    var attrForce;
    if(this.followedFish === null) {
        if(this.goal === null) {
            attrForce = PVector.sub(mousePosition,this.position);
        } else {
            attrForce = PVector.sub(this.goal.center(),this.position);
        }
    } else {
        attrForce = PVector.sub(this.followedFish.position,this.position);
    }
    attrForce.normalize();
    attrForce.mult(attraction * min(1, 3 *(this.timeToLive / fishLifeLength)));
    return attrForce;
};

/* Return if the fish is dead.*/
Mover.prototype.isDead = function() {
    if(this.timeToLive > 0 ||
            this.position.y < (49/50) * height) {
        return false;   
    } else {
        return true;   
    }
};

/* Return if the fish is following an eatable fruit*/
Mover.prototype.hasNoEatableGoal = function() {
    if (this.goal === null) {
        return true;
    } else if (this.goal.fruitReady()) {
        return false;
    } else {
        return true;   
    }
};


/*Run the mover.*/
Mover.prototype.run = function(tree) {
    this.update();
    this.oscillateTail();
    this.display();
    tree.eatFruits(this);
};

/*Strange like fish.*/
var SnFish = function(coordX, coordY, mColor, mass, followedFish,
    mWaterTank) {
    Mover.call(this, coordX, coordY, mColor, mass, followedFish,
    fishShapeSn, null, mWaterTank);
};

/*Inherits Mover methods.*/
SnFish.prototype = Object.create(Mover.prototype);

/* Override the display method.*/
SnFish.prototype.display = function() {
    
    fill(this.mColor);
    stroke(this.mColor);
    strokeWeight(2);
    
    /* Calculate the versor from the velocity.*/
    var fishVersor = this.velocity.get();
    fishVersor.normalize();
    //fishVersor.rotate(this.rotAngle);
    
    /* Take the points from the this.fShape
       then generate and adapt the shape.*/
    beginShape();
    for(var j = 0; j < this.fShape.length ; j++) {
        var mPoint = this.fShape[j].get();
        var fPoint = this.alignFish(mPoint,fishVersor);
        vertex(fPoint.x, fPoint.y ); 
    }
    endShape();
    
    /* Draw the eye.*/
    stroke(0, 0, 0);
    strokeWeight(this.mass*1.5);
    var eyePos = this.position.get();
    eyePos.add(PVector.mult(fishVersor, this.mass *4));
    point(this.position.x, this.position.y);
    
    /* Draw the fins from this.bFin array. */
    stroke(235, 167, 115);
    fill(235, 167, 115);
    strokeWeight(this.mass*1/2);
    
};



/*Run the mover.*/
SnFish.prototype.run = function(tree) {
    this.oscillateTail();
    this.update();
    this.display();
    tree.eatFruits(this);
};

/* Override oscillate tail.*/
SnFish.prototype.oscillateTail = function() {
        this.fishWaving = 0.01 * this.velocity.mag() * 
                sin(frameCount * PI* 0.01 * this.velocity.mag()) + 
                    0.8; 
};

/* Override align with motion direction.*/
SnFish.prototype.alignFish = function(someVector, mSomeVersor) {
    
    var someVersor = mSomeVersor.get();
    /*Generates a bending curve.*/
    someVersor.rotate(someVector.x/4 * (this.fishWaving-0.8));
    
    /* Here this.fishWaving modify the position of
       each point.*/
    var output =  new PVector(someVector.x * someVersor.x *
                this.fishWaving + 
                someVector.y * someVersor.y , 
                someVector.x * someVersor.y * 
                this.fishWaving - 
                someVector.y * someVersor.x);
    output.mult(this.mass/2);
    output.add(this.position);
    
    return output;
    
};

/* A fish population.*/
var CreatureSystem = function(position) {
    this.origin = position.get();
    this.creatures = [];
};


/* Add a normal fish.*/
CreatureSystem.prototype.addFish = function(waterTank) {

            this.creatures.push(  new Mover(this.origin.x,
                        this.origin.y,
                    color(random(10,255),
                            random(10,120),
                            random(150,255)),
                            fishBaseMass,
                            null,
                            fishShape,
                            bFin,
                            waterTank));
};

/* Add a strange fish.*/
CreatureSystem.prototype.addSnFish = function(waterTank) {
            this.creatures.push(  new SnFish(this.origin.x,
                        this.origin.y,
                    color(random(10,255),
                            random(10,120),
                            random(150,255)),
                            fishBaseMass,
                            null,
                            waterTank));
};

/* Run creature system.*/
CreatureSystem.prototype.run = function(tree) {
    for(var i = this.creatures.length-1; i >=0; i--) {
        var c = this.creatures[i];
        c.run(tree);

        
        if(c.childFishMass >= fishMassLimit) {
            this.origin = c.position.get();
            
            if(c instanceof SnFish) {
                this.addSnFish(tree.wt);   
            } else {
                this.addFish(tree.wt);   
            }
            c.childFishMass = 0;
        }
        
        if(c.isDead()) {
            this.creatures.splice(i, 1);   
        }
    }
};

/*Declare and initialize a water tank.*/
var waterTank = new WaterTank(wtHeight, wtColor);

/*Add a tree*/
var tree = new Tree(waterTank);

/* Add a creatures population with one fish per each type.*/
var fishesPopulation = new CreatureSystem(new PVector(random(0,width),
                        random(0,height))); 
                        

fishesPopulation.addFish(waterTank);
fishesPopulation.addSnFish(waterTank);

var creature02Count = 5; // Cumulative Quantity of Baby Fishes
var waterFriction = 0.08; // Fluid Resistance/Water Friction
var speedThreshold = 2; // Threshold Velocity in Impulse 
var impulseVelocity = 8; // Impulse Velocity of Fish
var wallThreshold = 10; // Wall Threshold Relative to Fish Positioning 
var attraction = 14; // Force of Relative Attraction from Fish to Objects
var fishAttraction = 21; // Attraction Toward Brother Fish
var fishBaseMass = 4;//Constant for Fish's Individual Mass
var cycleCounter = 0; // Cycle Counter Quantifying Seaweed Motion 
var wallBaseBending = 20; //Rate of Seaweed Base Fluctuating  
var gravityMag = 0.3; // Aplication of Gravity Acceleration Coefficien

// Array of PVectors 
var createPVArray = function(xArray, yArray) {
    var pVArray = [];
    for(var k = 0; k < min(xArray.length, yArray.length); k++) {
        pVArray.push(new PVector(xArray[k], yArray[k]));   
    }
    return pVArray;
};

//PVectors Array for Fish Form 
var xFish = [-32, -35, -25, -20, -15, -10, -5,  2,  5,    
               2,  -5, -10, -15, -20, -25, -35,-32];
               
var yFish = [ 0, -9, -2, -5, -7, -8,  -7,  -3,   0,
               3, 7,  8,  7,  5,   2,  9,  0];
               
var fishShape = createPVArray(xFish, yFish);

//Variables Governing Fishes' Bottom Fins
var xBFin = [-22, -9, -18];
var yBFin = [ -12,-8,  -7];

var bFin = createPVArray(xBFin, yBFin);

// Mouse Positioning Variable Initialization 
var mousePosition = new PVector(width * 1/2, height* 1/4);


//Lake/Water Tank Dimensions Functional Initialization 
var WaterTank = function(tankHeight) {
  this.tankHeight = tankHeight;
};

//Water Tank Displaying Function 
WaterTank.prototype.display = function() {
  noStroke();
  fill(0, 174, 255);
  rect(0,height - this.tankHeight,width,height);
};

//Confines of Water Relative to Fish Positioning 
WaterTank.prototype.fishInside = function(babyFish) {
    if(babyFish.position.x > 0 &&
        babyFish.position.x < width &&
        babyFish.position.y > height - this.tankHeight &&
        babyFish.position.y < height) {
            return true;   
        } else {
            return false;   
        }
};

//Instance for Water Tank 
var waterTank = new WaterTank(200);

//Object Representing Seaweed Confines Relative to Mechanics of Baby Fishes' Movement 
var Wall = function(mWaterTank) {
    this.pos1 = new PVector(width/2, height - mWaterTank.tankHeight);
    this.pos2 = new PVector(width/2, height );
    this.bending = wallBaseBending;
    this.vel1 = new PVector(random(-1,1),random(0,0.1));
};
//Seaweed Displaying Function 
Wall.prototype.display = function() {
    var wallThickness = 7;
    noFill();
    stroke(43, 148, 113);
    strokeWeight(wallThickness);
    bezier(this.pos1.x, this.pos1.y,
        this.pos1.x +abs(this.bending*3), 
         this.pos1.y +this.bending,
         this.pos2.x-abs(this.bending*3), 
         this.pos2.y-this.bending, this.pos2.x, this.pos2.y);
    
    bezier(this.pos1.x + width/5, 
        this.pos1.y + height/8,
        this.pos1.x +abs(this.bending*3),
        this.pos1.y +this.bending,
         this.pos2.x-abs(this.bending*3),
         this.pos2.y-this.bending,
         this.pos2.x, this.pos2.y);
         
    bezier(this.pos1.x - width/5,
        this.pos1.y + height/3,
        this.pos1.x +abs(this.bending*3),
        this.pos1.y +this.bending,
         this.pos2.x-abs(this.bending*3), 
         this.pos2.y-this.bending, 
         this.pos2.x, 
         this.pos2.y);
         
    stroke(212, 240, 183);
    fill(43, 148, 113);
    strokeWeight(wallThickness );
    
    ellipse(this.pos1.x, this.pos1.y, 23,23);
    ellipse(this.pos1.x + width/5,this.pos1.y + height/8, 20,20);
    ellipse(this.pos1.x - width/5,this.pos1.y + height/3, 15,15);
};

//Seaweed Relative Positioning Function 
Wall.prototype.update = function() {
    this.pos1.add(this.vel1);
    this.checkFences(waterTank);
    
};

//Seaweed Fluctuation "Quantifier" Function 
Wall.prototype.checkFences = function(mWaterTank) {
    
    if(this.pos1.x > 2/3 *width && this.vel1.x > 0) {
         this.vel1.x *= -1; 
    } else if (this.pos1.x < 1/3 * width && this.vel1.x < 0) {
        this.vel1.x *= -1; 
    }
    
    if(this.pos1.y > height - (height - mWaterTank.tankHeight) *
        8/10 &&
        this.vel1.y > 0) {
         this.vel1.y *= -1; 
    } else if (this.pos1.y < height - mWaterTank.tankHeight && this.vel1.y < 0) {
        this.vel1.y *= -1; 
    }
};
//Function Returning Seaweed's Parallel and Perpendicular Versors 
Wall.prototype.vers = function() {
    return PVector.normalize(PVector.sub(this.pos2, this.pos1));  
};
Wall.prototype.perpVers = function() {
    return new PVector(-this.vers().y,this.vers().x);    
};

//Function Returning Length of Seaweed's Branches 
Wall.prototype.wLength = function() {
    return PVector.dist(this.pos1, this.pos2);  
};

//Instance for Seaweed Object 
var wall = new Wall(waterTank);

//Mover Function for Baby Fishes 
var Mover = function(coorX, coorY, mColor, mass, followedFish, 
                    mShape, mBFin) {
    this.followedFish = followedFish;
    this.mass = mass;
    this.position = new PVector(coorX, coorY);
    this.velocity = PVector.rotate(
            new PVector(impulseVelocity,0),
            random(360));
    this.acceleration = new PVector(0,0);
    this.mColor = mColor;
    
    this.fShape = mShape;
    
    this.bFin = mBFin;
    
    this.fishWaving = 1;
    this.fishBending = 0;
};


//Function Aligning Motion Direction
Mover.prototype.alignFish = function(someVector, mSomeVersor) {
    
    var someVersor = mSomeVersor.get();
    someVersor.rotate(this.fishBending);

    //fishWaving Modifying Positioning of Each Point 
    var output =  new PVector(someVector.x * someVersor.x *
                this.fishWaving + 
                someVector.y * someVersor.y , 
                someVector.x * someVersor.y * 
                this.fishWaving - 
                someVector.y * someVersor.x);
    output.mult(this.mass/2);
    output.add(this.position);
    
    return output;
};

//Mover Function Drawing Baby Fishes | Stylistic Elements in Hue and Stroke 
Mover.prototype.display = function() {
    fill(this.mColor);
    stroke(this.mColor);
    strokeWeight(2);
    //Calculation Normalizing Fish Versor from Velocity
    var fishVersor = this.velocity.get();
    fishVersor.normalize();
    
    //Acquire Points from this.fShape for Generation and Adaptation 
    beginShape();
    for(var j = 0; j < this.fShape.length ; j++) {
        var mPoint = this.fShape[j].get();
        var fPoint = this.alignFish(mPoint,fishVersor);
        vertex(fPoint.x, fPoint.y ); 
    }
    endShape();
    
    //Function Drawing Fishes' Eyes | Stylistic Elements 
    stroke(0,0,0);
    strokeWeight(this.mass*2);
    point(this.position.x, this.position.y);
    
    ///Function Drawing Fishes' Fins from b.Fins Array | Stylistic Elements 
    stroke(175, 194, 242);
    fill(175, 194, 242);
    strokeWeight(this.mass*1/2);
    
    var fishBFin = [];
    
    for(var j = 0; j < this.bFin.length; j++) {
        fishBFin.push(this.alignFish(this.bFin[j].get(), fishVersor));
    }
    
    triangle(fishBFin[0].x, fishBFin[0].y, 
            fishBFin[1].x, fishBFin[1].y, 
            fishBFin[2].x, fishBFin[2].y);
    
    for(var j = 0; j < this.bFin.length; j++) {
        var fishFin = this.bFin[j].get();
        fishFin.y *= -0.95;
        fishFin.x *=  0.8;
        fishBFin.push(this.alignFish(fishFin, fishVersor));
    }
    
    triangle(fishBFin[3].x, fishBFin[3].y, 
        fishBFin[4].x, fishBFin[4].y, 
          fishBFin[5].x, fishBFin[5].y);
};

//Function Oscilating Fishes' Tails
Mover.prototype.oscillateTail = function() {
        this.fishWaving = 0.03 * this.velocity.mag() * 
                sin(frameCount * PI* 0.05 * this.velocity.mag()) + 
                    0.8; 
        this.fishBending = 0.05 * this.velocity.mag() * 
                sin(frameCount * PI* 0.0005 * this.velocity.mag()); 
};


//Function Moving Baby Fishes in Impulse, Force, Velocity, & Relative Positioning
Mover.prototype.update = function() {
    this.applyImpulse(waterTank);
    this.applyForce(this.calculateFriction(waterTank));
    this.applyForce(this.calculateGravity(waterTank));
    this.velocity.add(this.acceleration);
    this.velocity.limit(10);
    this.position.add(this.velocity);
    this.isHitting(wall);
    this.checkFences();
    this.acceleration.mult(0);
};

//Function Checking Water Confines to Dictate Fishes' Direction and Invert Velocity Perpendicular Components 
Mover.prototype.checkFences = function() {
    
    if(this.position.x > width && this.velocity.x > 0) {
         this.position.x = width;
         if(this.velocity.x !== 0) {
            this.velocity.x *= -1;
         } else {
            this.velocity.x = -1;
         }
    } else if (this.position.x < 0 && this.velocity.x < 0) {
        this.position.x = 0;
        if(this.velocity.x !== 0) {
            this.velocity.x *= -1;
        } else {
            this.velocity.x = 1;   
        }
    }
    
    if(this.position.y > height && this.velocity.y > 0) {
         this.position.y  = height;
         if(this.velocity.y !== 0) {
            this.velocity.y *= -1;
         } else {
            this.velocity.y = -1;   
         }
    } else if (this.position.y < 0 && this.velocity.y < 0) {
        this.position.y = 0;
        if(this.velocity.y !== 0) {
            this.velocity.y *= -1;
        } else {
            this.velocity.y = 1;   
        }
    }
};
//Function Checking Collision Between Bbay Fish and Seaweed to Dictate Directional Shifts Through Force Manipulation 
Mover.prototype.isHitting = function(mWall) {

  var hit1 = PVector.sub(this.position, mWall.pos1);
  var hit2 = PVector.sub(this.position, mWall.pos2);
  
  var wVers = mWall.vers();
  var wPerp = mWall.perpVers();
  
  var wVector = PVector.sub(this.position,mWall.pos1);
  
    //Force Mechanics Tenet [Psuedocode]: If Baby Fish's Proximity is Close to Seaweed and Vector is Moving Towards it, Shift Direction by Inverting Velocity Component Perpendicular to the Wall 
    
    if(abs(PVector.dot(wVector,wPerp)) < wallThreshold  && 
    PVector.dot(wVector,wPerp) * PVector.dot(this.velocity,wPerp) < 0 &&
    PVector.dot(wVector,wVers) > 0 &&
    PVector.dot(wVector,wVers) < mWall.wLength()) {
        
        var baseReaction = PVector.dot(this.velocity,wPerp);
        
        var reaction = PVector.mult(
                PVector.mult(wPerp,
                baseReaction),-2);
        this.velocity.add(reaction);   
    }
};

//Fish Impulses Repeat Movement in Relation to Food Attraction's Calculation by Fish Pushes
Mover.prototype.applyImpulse = function(mWaterTank) {
    //As Baby Fishes' Speed is Under a Given Threshold, Push Again
    if(this.velocity.mag() < speedThreshold &&
        mWaterTank.fishInside(this)) {
        this.velocity = PVector.mult(
            PVector.normalize(this.velocity),
            impulseVelocity);
            //Calculate Acceleration Forward Relative to Opposite Friction Proportional to the Velocityy | Forces Mechanics 
    if(this.followedFish === null) {
        this.applyForce(this.calculateFoodAttraction(attraction));
    } else {
        this.applyForce(this.calculateFoodAttraction(fishAttraction));
    }
    } 
};

//Method Applying Force Mechanics in Mass and Acceleration
Mover.prototype.applyForce = function(mForce) {
    var mAcc = mForce.get();
    mAcc.div(this.mass);
    this.acceleration.add(mAcc);
};
//Method Calculating Water Friction and Laminar Flow - Fluid Dynamics
Mover.prototype.calculateFriction = function(mWaterTank) {
    var frictionForce = this.velocity.get();
    if(mWaterTank.fishInside(this)) {
    frictionForce.mult(-waterFriction);
    } else {
        frictionForce.mult(0);
    }
    return frictionForce;
};
//Methods Calculating Gravitational Attraction in Relationship Between Fish and Water Tank Confines
Mover.prototype.calculateGravity = function(mWaterTank) {
    var gravity;
    if (mWaterTank.fishInside(this)) {
        gravity = 0;
    } else {
        gravity = this.mass*gravityMag;
    }
    return new PVector(0,gravity);
};

Mover.prototype.calculateFoodAttraction = function(attraction) {
    //Algorithm Calculating Fishes' Acceleration Toward Food 
    var attrForce;
    if(this.followedFish === null) {
        attrForce = PVector.sub(mousePosition,this.position);
    } else {
        attrForce = PVector.sub(this.followedFish.position,this.position);
    }
    attrForce.normalize();
    attrForce.mult(attraction);
    return attrForce;
};

//Array of Baby Fishes' Numerical and Stylistic Attributes 
var creature02 = [];
for(var i = 0; i < creature02Count; i++) {
    var followedFish = null;
    if(i > 0) {
        followedFish = creature02[i-1];
    }

    creature02.push(new Mover(random(0,width),
                random(0,height/2),
                color(random(10,255),
                    random(10,120),
                    random(150,255)),
                fishBaseMass/sqrt(i+1),
                followedFish,
                fishShape,
                bFin));   
}

// Implementation of Border Limiter and Rotation Algorithm 
fill(255, 0, 0);

// Predator Speed in Water and Water Confines Initialization 
var Water = function() {
    this.image = getImage("cute/Blank");
    this.level = 120;
};
var water = new Water();

var Predator = function(config) {
    if (!(config instanceof Object)) {config = {};}
    this.image = config.image || getImage("avatars/orange-juice-squid");
    this.imageSize = config.imageSize || { w:80, h:80 };
    this.eatRadius = this.imageSize.w/4;
    this.pos = config.pos || new PVector(0.5*width, -this.imageSize.h);
    this.vel = config.vel || new PVector(0, 0.1);
    this.acc = config.acc || new PVector();
    this.maxSpeed = {air: 10, water: 2};
    this.sfx = config.sfx || getSound("rpg/hit-splat");
    this.grav = new PVector(0, 2);
    this.visionLimit = 35; // Pursuit of Prey | Confines 
    this.angle = 90;
    this.maxRotate = 30; // Maximum Degrees Per Frame 
    this.noms = 0;
};

Predator.prototype.draw = function() {
    pushMatrix();
    translate(this.pos.x, this.pos.y);
    var dAngle = this.vel.heading() - this.angle;
    if (Math.abs(dAngle) > this.maxRotate) {
        dAngle = this.maxRotate * dAngle > 0 ? 1 : -1;
    }
    this.angle = this.angle + dAngle;
    rotate(this.angle - 90);
    image(this.image, 0, 0, this.imageSize.w, this.imageSize.h);
    popMatrix();
    
    // Updating Position and Predator Position Relative to Border 
    this.pos.add(this.vel);
    this.pos.x = Math.max(this.pos.x, -this.imageSize.w);
    this.pos.x = Math.min(this.pos.x, width + this.imageSize.w);
    this.pos.y = Math.min(this.pos.y, height + this.imageSize.h);
    
    // Updating Velocity and Speed Confines 
    this.vel.add(this.acc);
    this.vel.limit(this.pos.y > water.level ? this.maxSpeed.water : this.maxSpeed.air);
};

Predator.maxDir = new PVector(width, height);
Predator.maxMag = Predator.maxDir.mag();

var Prey = function(config) {
    if (!(config instanceof Object)) {config = {};}
    this.size = config.size || { w:40, h:40 };
    this.acc = config.acc || new PVector(0, 0.05);
    this.maxSpeed = {air: 8, water: 2};
    this.restart();
    this.spawnWait = config.spawnWait || 0;
    this.dir = new PVector();
    this.mag = 0;
};
Prey.images = ["avatars/leaf-blue","avatars/leaf-green","avatars/leaf-red","avatars/leaf-orange","avatars/leaf-grey","avatars/leaf-red","avatars/leaf-yellow"];
Prey.prototype.draw = function() {
    image(this.image, this.pos.x, this.pos.y, this.size.w, this.size.h);
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.vel.limit(this.pos.y > water.level ? this.maxSpeed.water : this.maxSpeed.air);
};
// Restart if Prey Escapes Field 
Prey.prototype.boundCheck = function() {
    if (this.pos.x < -this.size.w/2 || this.pos.x > width + this.size.w/2 || this.pos.y > height + this.size.h/2) {
        this.restart();
    }
};
// Run When Predator Eats Prey or If Prey Escapes 
Prey.prototype.restart = function() {
    this.spawnWait = random(20, 160);
    this.pos = new PVector(random(0, width), -this.size.h);
    this.vel = new PVector(this.pos.x > width/2 ? random(0, -5) : random(5, 0), 0);
    var randIndex = parseInt(random(Prey.images.length),  10);
    this.image = getImage(Prey.images[randIndex]);
};
Prey.count = 3;

var Textbox = function(config) {
    if (!(config instanceof Object)) {config = {};}
    this.pos = config.pos || new PVector(10, 10);
    this.colorBG = config.colorBG || color(255, 255, 255, 127);
    this.color = config.color || color(255, 0, 0);
    this.stroke = config.stroke || color(0, 0, 0);
    this.strokeWeight = config.strokeWeight || 3;
    this.textSize = config.textSize || 20;
};

Textbox.prototype.draw = function(message) {
    rectMode(CORNER);
    fill(this.colorBG);
    stroke(this.stroke);
    strokeWeight(this.strokeWeight);
    textSize(this.textSize);
    rect(this.pos.x, this.pos.y, textWidth(message)+this.textSize, this.textSize+textDescent());
    
    textAlign(LEFT, TOP);
    fill(this.color);
    text(message, this.pos.x + this.textSize/2, this.pos.y);
};

var predator = new Predator();
var preys = [];
for (var i = 0; i < Prey.count; i++) {
    preys[i] = new Prey({spawnWait: 100 * (i+1)});
}
predator.nombox = new Textbox();

Predator.prototype.hunt = function() {
    var p, closest = null;
    for (var i in preys) {
        p = preys[i];
        // Identify Closest Spawned Prey Within Predator's Visibility Threshold 
        if (p.spawnWait <= 0 && p.pos.y > this.visionLimit) {
            p.dir = PVector.sub(p.pos, this.pos);
            p.mag = p.dir.mag();
            if (closest === null || p.mag < closest.mag) {
                closest = p;
            }
            // Predator Consumption in Relation to Poximity 
            if (p.mag < this.eatRadius) {
                this.noms += 1;
                p.restart();
            }
        }
    }
    // Determination of Acceleration Towards Nearest Prey 
    if (closest !== null) {
        var closeness = (Predator.maxMag - closest.mag)/Predator.maxMag;
        closest.dir.normalize();
        closest.dir.mult(closeness);
        
        this.acc = closest.dir;
        // Predator Movement Manipulation Beyond Water Confines 
        if (this.pos.y < water.level) { this.acc.limit(0); }
        this.vel.add(this.acc);
    }
    if (this.pos.y < water.level) {
        this.acc.add(this.grav);
    } 
};

var creatures = []; 

//Array Initialization and Storing Pond Fish 
var WaterPod = function(x, y) { 
    
    //Define Position and Velocity 
    this.pos = new PVector(x, y);
    this.vel = new PVector(random(-0.5, 0.5), random(-0.5, 0.5));
    this.s = random(4, 5);
    
    //Values Determining Hue
    this.colorArr = [
        random(0, 100), random(0, 100), random(0, 100), random(200, 255)
    ];
    this.angle = random(0, 360); 
};

//Sets Pod Color from Variable colorArr 
WaterPod.prototype.draw = function() {
    fill(this.colorArr[0], this.colorArr[1], this.colorArr[2], this.colorArr[3]);
    pushMatrix();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle + this.pos.mag()); //Pod Rotation
    ellipse(0, 0, this.s, this.s*4); //Pod Drawing
    popMatrix();
};

//Acceleration Relative to Border
WaterPod.prototype.update = function() {
    if (this.pos.x > 600) {
        this.vel.x -= 0.1;
    } if (this.pos.x < 0) {
        this.vel.x += 0.1;
    } if (this.pos.y > 600) {
        this.vel.y -= 0.1;
    } if (this.pos.y < 300) {
        this.vel.y += 0.1;
    }
    
    //Random Pod Movement
    var test = round(random(0, 5)); 
    
    //Velocity Shifts in Random Increments [1/5]
    if (test === 0) {
        this.vel.x += random(-0.1, 0.1);
        this.vel.y += random(-0.1, 0.1);
    }
    
    this.vel.limit(0.5); //Velocity Limit
    this.pos.add(this.vel); //Velocity + Position
};

//Definition of Position, Velocity, and Acceleration
var Fish = function(x, y) {
    this.pos = new PVector(x, y);
    this.vel = new PVector(0, 0);
    this.accel = new PVector(random(-0.01, 0.01), random(-0.01, 0.01));
    this.colorArr = [
        random(20, 200), random(20, 200), random(20, 200), random(200, 255)
    ]; 
    
    //Selects Four Values in Fish Classification
    this.type = round(random(0, 4)); 
    
    //Face of Velocity
    if (this.vel.x > 0) {
        this.dir = 'right';
    } else {
        this.dir = 'left';
    }
};

Fish.prototype.draw = function() {

    //Sets Fish Color Based on Variable colorArr 
    fill(this.colorArr[0], this.colorArr[1], this.colorArr[2], this.colorArr[3]);
    ellipse(this.pos.x, this.pos.y, 20, 10);
    
    if (this.type === 0) {
        if (this.dir === 'right') {
            triangle(this.pos.x - 5, this.pos.y - 3, this.pos.x + 8, this.pos.y - 4, this.pos.x - 8, this.pos.y - 10);
        } else {
            triangle(this.pos.x - 8, this.pos.y - 3, this.pos.x + 5, this.pos.y - 4, this.pos.x + 8, this.pos.y - 10);
        }
    }
    
    //Draws Fin and Eye Based on Direction - Color Shifts 
    fill(this.colorArr[0]/1.5, this.colorArr[1]/1.5, this.colorArr[2]/1.5, this.colorArr[3]); 
    if (this.dir === 'right') {
        triangle(this.pos.x - 8, this.pos.y, this.pos.x - 20, this.pos.y - 5, this.pos.x - 20, this.pos.y + 5);
        fill(0);
        ellipse(this.pos.x + 5, this.pos.y - 2, 4, 3);
    } else {
        triangle(this.pos.x + 8, this.pos.y, this.pos.x + 20, this.pos.y - 5, this.pos.x + 20, this.pos.y + 5);
        fill(0);
        ellipse(this.pos.x - 5, this.pos.y - 2, 4, 3);
    }
};

//Fish Position Relative to Border
Fish.prototype.update = function() {
    if (this.pos.x > 600) {
        this.vel.x -= 0.1;
        this.accel.x = 0;
    } if (this.pos.x < 0) {
        this.vel.x += 0.1;
        this.accel.x = 0;
    } if (this.pos.y > 600) {
        this.vel.y -= 0.1;
        this.accel.y = 0;
    } if (this.pos.y < 300) {
        this.vel.y += 0.1;
        this.accel.y = 0;
    }
    
    //Direction of Fish's Face
    if (this.vel.x > 0.2) {
        this.dir = 'right';
    } if (this.vel.x < 0.2) {
        this.dir = 'left';
    }
    
    //Constraining Velocity and Adding Acceleration/Velocity
    this.vel.limit(1); 
    this.vel.add(this.accel); 
    this.pos.add(this.vel); 
};

var drawWater = function() {
    fill(60, 186, 232);
    for (var i = 0; i < 0.01 * 600; i += 0.01) {
        var y = map(noise(i/3 + sin(frameCount)/20, sin(frameCount)/2), 0, 0.3, 0, 30);
        rect(i *100, 180 - y, 1, y + 270);
    }
}; 

//Pond Population - Water Pods and Fish 
for (var i = 0; i < 20; i ++) {
    creatures.push(new WaterPod(random(0, 600), random(300, 600)));
}
for (var i = 0; i < 6; i ++) {
    creatures.push(new Fish(random(0, 600), random(300, 600)));
}

//Storing Array Length 
var creatureArrayLength = creatures.length;
noStroke();

    var drawRange = function(incAmount, hC) {
    for (var t = 0; t < incAmount * width; t += incAmount) {
        var n = noise(t);
        var y = map(n, 0, 1, 0, height/hC);
        var x = t * 1 / incAmount;
        line (x, height-y, x, height);
    }
};

//Background and Central Drawing Loop | Finalization of Graphic Elements & Drawing Functions
draw = function() {
    background(38, 38, 38);
    
    for (var i = 0; i < height; i++) {
        noStroke();
        fill(lerpColor(
        color(0, 8, 117), 
        color(161, 170, 255), 
        i / height));
        rect(0, i, width, -161);
}

    function clouds (x, y, sx, sy){
        
    pushMatrix();
    translate(x, y);
    scale(sx, sy);
            
noStroke();
beginShape();
vertex(150, 145);
bezierVertex(42, 142, 141, 157, 196, 161);
vertex(155, 151);
bezierVertex(162, 150, 139, 168, 226, 159);
vertex(244, 161);
bezierVertex(468, 155, 289, 144, 274, 151);
bezierVertex(372, 176, 276, 90, 276, 143);
bezierVertex(305, 189, 319, 38, 245, 147);
vertex(289, 111);
bezierVertex(265, 128, 263, 38, 209, 104);
bezierVertex(165, 81, 130, 167, 162, 146);
endShape();
            
    popMatrix();
}

    for(var i = 0; i < 187; i++) {
    
    fill(70, 82, 171, 55);
        clouds(random(-377, 600), random(501, 246), 0.5, 0.3);
        
        fill(127, 114, 186, 70);
        clouds(random(-377, 600), random(0, 600), 1.5, 0.3);
        
        fill(255, 255, 255, 20);
        clouds(random(-377, 600), random(580, 265), 1.5, 0.3);

}

//Distant Planet Generation
{
    
noStroke();
fill(184, 212, 240);
ellipse(382, 60, 100, 100);
ellipse(129, 227, 60, 60);

for(var glowVar = 0; glowVar < 140; glowVar+= 1){
        fill(62, 70, 170, 5);
        noStroke();
        ellipse(393, 86, glowVar, glowVar);
        fill(94, 104, 198, 5);
        ellipse(129, 271, glowVar, glowVar);
        }

pushMatrix();
rotate(-20);

stroke(255, 255, 255, 80);
noFill();
    arc(339, 183, 131, 15, -40, 224);
    arc(339, 192, 131, 15, -40, 224);

rotate(40);
    arc(198, 167, 80, 15, -40, 224);
popMatrix();

}

function star (x, y, size){
    
    pushMatrix();
    translate(x, y);
    scale(size);
    
noStroke();
for(var glowVar = 0; glowVar < 29; glowVar+= 1){
        fill(255, 255, 255, 5);
        ellipse(208.5, 92, glowVar, glowVar);
        }
    
fill(205, 202, 190);
textSize(20);
text("✦", 200, 100);

stroke(205, 202, 190);
strokeWeight(1);
line(208, 111, 208, 71);
line(196, 93, 220, 93);

    popMatrix();

}

//Star Generation
{
for(var i = 0; i < 250; i++) {
        
    strokeWeight(random(0.1, 1.5));
    stroke(224, 227, 236, (10, 300));
    
        point(random(0, 500), random(0, 600));
}

star(101, 49, 0.2);//Aries Constellation 
star(67, 14, 0.3);
star(82, 61, 0.3);
star(-20, -11, 0.4);

star(325, 204, 0.4); //Scorpius Constellation 
star(367, 158, 0.4);
star(347, 241, 0.3);
star(366, 153, 0.3);
star(298, 247, 0.3);
star(347, 267, 0.2);
star(329, 240, 0.2);
star(396, 204, 0.2);
star(414, 197, 0.2);
star(414, 215, 0.2);
star(414, 234, 0.2);

star(270, 10, 0.3);
star(380, 29, 0.3);
}

function fog (x, y, sx, sy, r){

pushMatrix();
translate(x, y);
scale(sx, sy);
rotate(r);

beginShape();
vertex(64,522);
vertex(80,515);
vertex(83,509);
vertex(93,503);
vertex(97,505);
vertex(115,507);
vertex(120,506);
vertex(132,499);
vertex(149,501);
vertex(160,508);
vertex(167,507);
vertex(179,502);
vertex(180,502);
vertex(200,505);
vertex(210,509);
vertex(216,511);
vertex(244,512);
vertex(247,512);
vertex(264,516);
vertex(273,535);
vertex(304,541);
vertex(314,544);
vertex(321,551);
vertex(344,557);
vertex(344,557);
vertex(366,577);
vertex(367,580);
vertex(355,581);
vertex(344,575);
vertex(335,577);
vertex(328,583);
vertex(321,591);
vertex(309,595);
vertex(309,595);
vertex(284,592);
vertex(251,581);
vertex(236,582);
vertex(222,588);
vertex(208,574);
vertex(184,565);
vertex(167,567);
vertex(160,570);
vertex(147,575);
vertex(135,572);
vertex(119,573);
vertex(110,579);
vertex(80,584);
vertex(61,585);
vertex(28,577);
vertex(18,561);
vertex(14,551);
vertex(18,545);
vertex(36,541);
vertex(40,536);
vertex(54,518);
endShape(CLOSE);

popMatrix();

}

//Fog Generation
{
noStroke();
fill(204, 159, 212, 50);

fog(152, 10, -1, 1, 11);
fog(698, -105, -1, 1, -4);
fog(569, 55, -2, 1, -4);
fog(36, -70, 0.4, 0.2);
fog(-12, -274, 0.6, 0.5);
fog(0, 387, 0.2);
fog(261, 183, 0.3, 0.2);
fog(291, 173, 0.4, 0.2);
fog(100, 192, 0.4, 0.2);
fog(80, 54, 0.4, 0.2);
fog(300, 447, -0.1, 0.1);
fog(358, 43, 0.4, 0.2);
fog(409, 78, 0.2, 0.1);

for(var glowVar = 0; glowVar < 57; glowVar+= 1){
        fill(203, 144, 235, 5);
        noStroke();
        
        fog(glowVar - 109, glowVar - 10);
        fog(glowVar + 391, glowVar + 112, 0.5, 0.5);
}
}

    stroke(200, 211, 230);
    drawRange(0.0048, 0);

    stroke(155, 170, 199);
    drawRange(0.0097, 0);

    stroke(147, 157, 179);
    drawRange(0.0076, 0);

    stroke(125, 134, 153);
    drawRange(0.0142, 0);

    var noiseVar = 8.4;
    var rangeY = 180;
    var incrementNoise = 0.002;

    noiseVar = -19.0;
    rangeY = 390;
    incrementNoise = 0.012;
    for (var mountx = 0; mountx < 400; mountx++){
        
        var mounty = map(noise(noiseVar), 0, 1.65, -27, rangeY);
        noStroke();
        fill(56, 22, 44, 255);
        rect(mountx, mounty-20, 1, 490-mounty);
        noiseVar += incrementNoise;
    }
    
    drawWater();
    
    imageMode(CORNERS);
    image(water.image, 0, 0, width, height);
    imageMode(CENTER);
    for (var i in preys) {
        var p = preys[i];
        if (p.spawnWait > 0) {
            p.spawnWait -= 1;
        } else {
            p.draw();
            p.boundCheck();
        }
    }
        
    predator.draw();
    predator.hunt();
    
    wall.display();
    wall.update();

    for (var i = 0; i < creatureArrayLength; i ++) {
        creatures[i].draw(); 
        creatures[i].update();
    }
    
    for(var j = 0; j < creature02.length; j++) {
        creature02[j].display();
        creature02[j].oscillateTail();
        creature02[j].update();
    
    tree.run();
    fishesPopulation.run(tree);
}
};
