// Vector3d
function Vector3d(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
}

Vector3d.prototype.toString = function(digits) {
	var digits = typeof digits == 'undefined' ? 10 : digits;
	return "["+Number.parseFloat(this.x).toFixed(digits)+","+Number.parseFloat(this.y).toFixed(digits)+","+Number.parseFloat(this.z).toFixed(digits)+"]"
}

last = null;

function parseVector(str) {
	var regexp = /^(?:\s*)(?:\/execute in minecraft:overworld run tp @s )?([-]?(?:\d+[.]\d+)|(?:\d+))(?:\s+)([-]?(?:\d+[.]\d+)|(?:\d+))(?:\s+)([-]?(?:\d+[.]\d+)|(?:\d+))(?:(?:\s*)(?:[-]?(?:\d+[.]\d+)|(?:\d+)))*(?:\s*)$/;
	var g = regexp.exec(str);
	last = g;
	if(!g || isNaN(g[1]) || isNaN(g[2]) || isNaN(g[3]))
		return null;
	else
		return new Vector3d(parseFloat(g[1]), parseFloat(g[2]), parseFloat(g[3]));
}
///////////////////////////////////////////////////////////////////



// Entity
var entities = {};

function Entity(entity, name, model, gravity, drag_vertical, drag_horizontal, nbt) {
	this.entity = entity;
	this.name = name;
	this.model = model;
	this.gravity = gravity;
	this.drag_vertical = drag_vertical;
	this.drag_horizontal = drag_horizontal;
	this.nbt = nbt;
	
	entities[entity] = this;
}
///////////////////////////////////////////////////////////////////



//Models
var models = {};

(()=>{
	//ModelGravityMoveDrag
	function ModelGravityMoveDrag(gravity, drag_vertical, drag_horizontal) {
		this.gravity = gravity;
		this.drag_vertical = drag_vertical;
		this.drag_horizontal = drag_horizontal;
	}
	ModelGravityMoveDrag.prototype.formulaY = function(dy, ticks) {
		var g = this.gravity;
		var k = 1 - this.drag_vertical;
		var t = ticks;
		var kt = Math.pow(k,t);
		
		return (dy - g*t/(1-k) + g*k*(1-kt)/((1-k)*(1-k)))*(1-k)/(1-kt);
	}
	ModelGravityMoveDrag.prototype.formulaX = function(dx, ticks) {
		var k = 1 - this.drag_horizontal;
		var kt = Math.pow(k,ticks);
		
		return dx*(1-k)/(1-kt);
	}
	ModelGravityMoveDrag.prototype.calcVectorFromDisplacement = function(displacement, ticks) {
		var y = this.formulaY(displacement.y, ticks);
		var x = this.formulaX(displacement.x, ticks);
		var z = this.formulaX(displacement.z, ticks);
		
		return new Vector3d(x,y,z);
	}
	models['GravityMoveDrag'] = ModelGravityMoveDrag;
	
	
	//ModelMoveDragGravity
	function ModelMoveDragGravity(gravity, drag_vertical, drag_horizontal) {
		this.gravity = gravity;
		this.drag_vertical = drag_vertical;
		this.drag_horizontal = drag_horizontal;
	}
	ModelMoveDragGravity.prototype.formulaY = function(dy, ticks) {
		var g = this.gravity;
		var k = 1 - this.drag_vertical;
		var t = ticks;
		var kt = Math.pow(k,t);
		
		return (dy - g*t/(1-k) + g*(1-kt)/((1-k)*(1-k)) + g)*(1-k)/(1-kt);
	}
	ModelMoveDragGravity.prototype.formulaX = function(dx, ticks) {
		var k = 1 - this.drag_horizontal;
		var kt = Math.pow(k,ticks);
		
		return dx*(1-k)/(1-kt);
	}
	ModelMoveDragGravity.prototype.calcVectorFromDisplacement = function(displacement, ticks) {
		var y = this.formulaY(displacement.y, ticks);
		var x = this.formulaX(displacement.x, ticks);
		var z = this.formulaX(displacement.z, ticks);
		
		return new Vector3d(x,y,z);
	}
	models['MoveDragGravity'] = ModelMoveDragGravity;
	
	
	//ModelMoveGravityDrag
	function ModelMoveGravityDrag(gravity, drag_vertical, drag_horizontal) {
		this.gravity = gravity;
		this.drag_vertical = drag_vertical;
		this.drag_horizontal = drag_horizontal;
	}
	ModelMoveGravityDrag.prototype.formulaY = function(dy, ticks) {
		var g = this.gravity;
		var k = 1 - this.drag_vertical;
		var t = ticks;
		var kt = Math.pow(k,t);
		
		return (dy - g*t/(1-k) + g*k*(1-kt)/((1-k)*(1-k)) + g*t)*(1-k)/(1-kt);
	}
	ModelMoveGravityDrag.prototype.formulaX = function(dx, ticks) {
		var k = 1 - this.drag_horizontal;
		var kt = Math.pow(k,ticks);
		
		return dx*(1-k)/(1-kt);
	}
	ModelMoveGravityDrag.prototype.calcVectorFromDisplacement = function(displacement, ticks) {
		var y = this.formulaY(displacement.y, ticks);
		var x = this.formulaX(displacement.x, ticks);
		var z = this.formulaX(displacement.z, ticks);
		
		return new Vector3d(x,y,z);
	}
	models['MoveGravityDrag'] = ModelMoveGravityDrag;
})();
///////////////////////////////////////////////////////////////////



// Main Code
function init(){
	registerEntities();
	changeEntity();
}

function changeEntity() {
	var step = document.getElementById('step1');
	var entity = entities[document.getElementById('entities').value];
	
	if(!entity) {
		step.classList.remove('good');
		step.classList.add('bad');
		step.lastElementChild.innerText = "올바르지 않은 엔티티입니다.";
	} else {
		step.classList.remove('bad');
		step.classList.add('good');
		step.lastElementChild.innerText = "";
		
		document.getElementById('entity').value = entity.entity;
		document.getElementById('nbt').value = entity.nbt;
		document.getElementById('gravity').value = entity.gravity;
		document.getElementById('drag_vertical').value = entity.drag_vertical;
		document.getElementById('drag_horizontal').value = entity.drag_horizontal;
		
		changeDetails();
	}
}

function changeSummonPoint() {
	var step = document.getElementById('step2');
	var point = parseVector(document.getElementById('summonpoint').value);
	
	if(!point) {
		step.classList.remove('good');
		step.classList.add('bad');
		step.lastElementChild.innerText = "잘못된 좌표입니다.";
	} else {
		step.classList.remove('bad');
		step.classList.add('good');
		step.lastElementChild.innerText = "";
		
		changePoints();
	}
}

function changeDestination() {
	var step = document.getElementById('step3');
	var point = parseVector(document.getElementById('destination').value);
	
	if(!point) {
		step.classList.remove('good');
		step.classList.add('bad');
		step.lastElementChild.innerText = "잘못된 좌표입니다.";
	} else {
		step.classList.remove('bad');
		step.classList.add('good');
		step.lastElementChild.innerText = "";
		
		changePoints();
	}
}

function changePoints() {
	var p1 = parseVector(document.getElementById('summonpoint').value);
	var p2 = parseVector(document.getElementById('destination').value);
	
	if(p1) {
		document.getElementById('x').value = p1.x;
		document.getElementById('y').value = p1.y;
		document.getElementById('z').value = p1.z;
		
		changeDetails();
	}
	
	if(p1 && p2) {
		document.getElementById('dx').value = p2.x - p1.x;
		document.getElementById('dy').value = p2.y - p1.y;
		document.getElementById('dz').value = p2.z - p1.z;
		
		changeDetails();
	}
}

function changeTimeToArrive() {
	var step = document.getElementById('step4');
	var ticks = document.getElementById('time').value;
	
	if(!ticks || isNaN(ticks)) {
		step.classList.remove('good');
		step.classList.add('bad');
		step.lastElementChild.innerText = "숫자만 입력해주세요.";
	} else {
		step.classList.remove('bad');
		step.classList.add('good');
		step.lastElementChild.innerText = "";
	}
}

function changeDetails() {
	var step = document.getElementById('step5');
	var err = "";
	
	
	var reg = /^(?:\s*)[~^]?[-]?[-]?((\d+[.]\d+)|(\d+))(?:\s*)$/;
	var x = document.getElementById('x').value;
	var y = document.getElementById('y').value;
	var z = document.getElementById('z').value;
	
	if(!reg.test(x) || !reg.test(y) || !reg.test(z)) {
		err += "엔티티가 소환될 좌표를 설정해주세요. (2번)\n";
	}
	
	
	var dx = document.getElementById('dx').value;
	var dy = document.getElementById('dy').value;
	var dz = document.getElementById('dz').value;
	
	if(!dx || isNaN(dx) || !dy || isNaN(dy) || !dz ||isNaN(dz)) {
		err += "엔티티가 움직일 거리를 설정해주세요. (2번, 3번)\n";
	}
	
	var g = document.getElementById('gravity').value;
	var d_v = document.getElementById('drag_vertical').value;
	var d_h = document.getElementById('drag_horizontal').value;
	var e = document.getElementById('entity').value;
	
	if(!g || isNaN(g) || !d_v || isNaN(d_v) || !d_h || isNaN(d_h) || !entities[e]) {
		err += "엔티티의 속성을 설정해주세요. (1번)\n";
	}
	
	
	if (!err) {
		step.classList.remove('bad');
		step.classList.add('good');
		step.lastElementChild.innerText = "";
	} else {
		step.classList.remove('good');
		step.classList.add('bad');
		step.lastElementChild.innerText = err.trim();
	}
}

function calculate() {
	if(document.getElementById('step4').classList.contains('good') && document.getElementById('step5').classList.contains('good')) {
		var entity = document.getElementById('entity').value;
		
		var g = document.getElementById('gravity').value;
		var d_v = document.getElementById('drag_vertical').value;
		var d_h = document.getElementById('drag_horizontal').value;
		
		var model = new models[entities[entity].model](g, d_v, d_h);
		
		var dx = document.getElementById('dx').value;
		var dy = document.getElementById('dy').value;
		var dz = document.getElementById('dz').value;
		
		var ticks = document.getElementById('time').value;
		
		var vec = model.calcVectorFromDisplacement(new Vector3d(dx, dy, dz), ticks);
		
		var x = document.getElementById('x').value;
		var y = document.getElementById('y').value;
		var z = document.getElementById('z').value;
		
		var nbt = document.getElementById('nbt').value;
		var nbt2 = document.getElementById('nbt2').value;
		
		document.getElementById('command').value = `/summon minecraft:${entity} ${x} ${y} ${z} {Motion:${vec.toString()}${!nbt?"":","+nbt}${!nbt2?"":","+nbt2}}`;
	}
}
///////////////////////////////////////////////////////////////////



// entity list
function registerEntities() {
	var list = document.querySelector('#entities');

	function addEntity(entity, name, model, gravity, drag_vertical, drag_horizontal, nbt) {
		new Entity(entity, name, model, gravity, drag_vertical, drag_horizontal, nbt);
		
		var opt = new Option();
		opt.value = entity;
		opt.text = name;
		list.add(opt);
	}

	addEntity('armor_stand','armor_stand','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('arrow','arrow','MoveDragGravity',-0.05,0.01,0.01,'')
	addEntity('cat','cat','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('cave_spider','cave_spider','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('chest_minecart','chest_minecart','GravityMoveDrag',-0.04,0.05,0.05,'')
	addEntity('cod','cod','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('command_block_minecart','command_block_minecart','GravityMoveDrag',-0.04,0.05,0.05,'')
	addEntity('cow','cow','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('creeper','creeper','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('dolphin','dolphin','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('donkey','donkey','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('drowned','drowned','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('egg','egg','MoveDragGravity',-0.03,0.01,0.01,'')
	addEntity('elder_guardian','elder_guardian','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('ender_pearl','ender_pearl','MoveDragGravity',-0.03,0.01,0.01,'')
	addEntity('enderman','enderman','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('endermite','endermite','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('evoker','evoker','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('experience_bottle','experience_bottle','MoveDragGravity',-0.03,0.01,0.01,'')
	addEntity('experience_orb','experience_orb','GravityMoveDrag',-0.03,0.01,0.01,'')
	addEntity('falling_block','falling_block','GravityMoveDrag',-0.04,0.02,0.02,'Time:1')
	addEntity('fox','fox','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('furnace_minecart','furnace_minecart','GravityMoveDrag',-0.04,0.05,0.05,'')
	addEntity('giant','giant','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('guardian','guardian','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('hoglin','hoglin','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('hopper_minecart','hopper_minecart','GravityMoveDrag',-0.04,0.05,0.05,'')
	addEntity('horse','horse','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('husk','husk','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('illusioner','illusioner','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('iron_golem','iron_golem','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('item','item','GravityMoveDrag',-0.04,0.02,0.02,'아이템설정')
	addEntity('llama','llama','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('llama_spit','llama_spit','MoveDragGravity',-0.06,0.01,0.01,'')
	addEntity('magma_cube','magma_cube','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('minecart','minecart','GravityMoveDrag',-0.04,0.05,0.05,'')
	addEntity('mooshroom','mooshroom','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('mule','mule','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('ocelot','ocelot','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('panda','panda','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('pig','pig','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('piglin','piglin','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('piglin_brute','piglin_brute','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('pillager','pillager','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('polar_bear','polar_bear','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('potion','potion','MoveDragGravity',-0.03,0.01,0.01,'')
	addEntity('pufferfish','pufferfish','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('rabbit','rabbit','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('ravager','ravager','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('salmon','salmon','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('sheep','sheep','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('silverfish','silverfish','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('skeleton','skeleton','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('skeleton_horse','skeleton_horse','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('slime','slime','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('snow_golem','snow_golem','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('snowball','snowball','MoveDragGravity',-0.03,0.01,0.01,'')
	addEntity('spawner_minecart','spawner_minecart','GravityMoveDrag',-0.04,0.05,0.05,'')
	addEntity('spectral_arrow','spectral_arrow','MoveDragGravity',-0.05,0.01,0.01,'')
	addEntity('spider','spider','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('squid','squid','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('stray','stray','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('strider','strider','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('tnt','tnt','GravityMoveDrag',-0.04,0.02,0.02,'')
	addEntity('tnt_minecart','tnt_minecart','GravityMoveDrag',-0.04,0.05,0.05,'')
	addEntity('trader_llama','trader_llama','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('trident','trident','MoveDragGravity',-0.05,0.01,0.01,'')
	addEntity('tropical_fish','tropical_fish','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('turtle','turtle','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('villager','villager','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('vindicator','vindicator','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('wandering_trader','wandering_trader','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('witch','witch','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('wither_skeleton','wither_skeleton','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('wolf','wolf','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('zoglin','zoglin','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('zombie','zombie','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('zombie_horse','zombie_horse','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('zombie_villager','zombie_villager','MoveGravityDrag',-0.08,0.02,0.09,'')
	addEntity('zombified_piglin','zombified_piglin','MoveGravityDrag',-0.08,0.02,0.09,'')

	list.value = 'falling_block';
}
///////////////////////////////////////////////////////////////////