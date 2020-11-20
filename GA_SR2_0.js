var population;
var lifespan = 300;
var maxforce = 0.4
//var lifeP;
var count = 0;
var target;
var generations = 0;
var rx = 150, ry = 210, rw = 200, rh = 30;

function setup() {
  createCanvas(400,300);
  population = new Population();
  //lifeP = createP();
  target = createVector(width/2, 50);
}

function draw() {
  background(0);
  population.run();
  //lifeP.html(count);
  
  count++;
  if(count == lifespan){
    population.evaluate();
    population.selection();
    generations += 1;
    console.log(generations);
    count = 0;  
  }
  
  fill(255);
  rect(150, 210, 200, 30);
  //target.x = mouseX;
  //target.y = mouseY;
  ellipse(target.x, target.y, 15,15);
  
}

function Population(){
  this.rockets = [];
  this.popsize = 100;
  this.matingpool = [];
  
  for(var i = 0; i < this.popsize; i++){
    this.rockets[i] = new Rocket();
  }
  
  this.evaluate = function(){
    var maxfit = 0;
    for(var i = 0; i < this.popsize; i++){
      this.rockets[i].calcFitness();
      if(this.rockets[i].fitness > maxfit){
        maxfit = this.rockets[i].fitness;
      }
    }
    for(var i = 0; i < this.popsize; i++){
      this.rockets[i].fitness /= maxfit;
    }
  }
  
  this.acceptReject = function(){
    var besafe = 0;
    var maxfit = 0;
    for(var i = 0; i < this.popsize; i++){
      this.rockets[i].calcFitness();
      if(this.rockets[i].fitness > maxfit){
        maxfit = this.rockets[i].fitness;
      }
    }
    while(true){
      var index = floor(random(this.rockets.length))
      var partner = this.rockets[index];
      var r = random(maxfit);
      if(r < partner.fitness){
        return partner;
      }
      besafe++;
      if(besafe > 1000){
        console.log("FAILURE");
        return null;
      }
    }
  }
  
  this.selection = function(){
    var newRockets = [];
    for(var i = 0; i < this.rockets.length; i++){
      var parentA = this.acceptReject().dna;
      var parentB = this.acceptReject().dna;
      var child = parentA.crossover(parentB);
      child.mutation();
      newRockets[i] = new Rocket(child);
    }
    this.rockets = newRockets;
  }
  
  this.run = function(){
    var lessD = dist(this.rockets[0].pos.x, this.rockets[0].pos.y, target.x, target.y);
    for(var i = 0; i < this.popsize; i++){
      var value = 255
      var nd = dist(this.rockets[i].pos.x, this.rockets[i].pos.y, target.x, target.y);
      if(nd <= lessD){
        value = 0;
        lessD = nd
      }
      this.rockets[i].update();
      this.rockets[i].show(value);
    }  
  }
  
}

function DNA(genes){
  if(genes){
    this.genes = genes;
  }else{
    this.genes = [];
    for(var i = 0; i < lifespan; i++){
      this.genes[i] = p5.Vector.random2D();
      this.genes[i].setMag(maxforce);
    }
  }
  
  this.crossover = function(partner){
    var newgenes = [];
    var mid = floor(random(this.genes.length));
    for(var i = 0; i < this.genes.length; i++){
      if(i > mid){
        newgenes[i] = this.genes[i];
      }else{
        newgenes[i] = partner.genes[i];
      }
    }
    return new DNA(newgenes);
  }
  
  this.mutation = function(){
    for(var i = 0; i < this.genes.length; i++){
      if(random(1) < 0.01){
        this.genes[i] = p5.Vector.random2D();
        this.genes[i].setMag(maxforce);
      }
    }
  }
  
}

function Rocket(dna){
  this.pos = createVector(width/2, height);
  this.vel = createVector();
  this.acc = createVector();
  this.completed = false;
  this.crashed = false
  if (dna){
    this.dna = dna;
  }else{
    this.dna = new DNA();
  }
  this.fitness = 0.0;
  
  this.applyForce = function(force){
    this.acc.add(force);
  }
  
  this.calcFitness = function(){
    var d = dist(this.pos.x, this.pos.y, target.x, target.y);
    this.fitness = 1/(d*count);
    if(this.completed){
      this.fitness *= 100;
    }
    if(this.crashed){
      this.fitness /= this.pos.y;
      this.fitness /= 10;
    }
  }
  
  this.update = function(){
    
    var d = dist(this.pos.x, this.pos.y, target.x, target.y);
    if(d < 5){
      this.completed = true;
      //this.pos = target.copy(); Não é possivel setar a posição do foguete igual a do target pois se o fizer, a divisão fica sendo 1/d -> 1/0, pois eles possuim a mesma posição, logo d = 0;
    }
  
    if(this.pos.x > rx && this.pos.x < rx + rw && this.pos.y > ry && this.pos.y < ry+rh){
      this.crashed = true;
    }
    
    if(this.pos.x > width || this.pos.x < 0){
      this.crashed = true;
    }
    if(this.pos.y > height || this.pos.y < 10){
      this.crashed = true;
    }
    
    this.applyForce(this.dna.genes[count]);
    if(!this.completed && !this.crashed){
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.mult(0);
      this.vel.limit(4);
    }
  }
  
  this.show = function(value){
    push();
    noStroke();
    fill(255, value, value);
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    rectMode(CENTER);
    rect(0, 0, 25, 5);
    pop();
  }
}
