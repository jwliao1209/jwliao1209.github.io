Kangaroo = {
    "id": 0,
    "name": "Kangaroo.json",
    "translate": vec3.create([-20., 5., -37.]),
    "rotate": vec3.create([-90., 0., 60.]),
    "scale": vec3.create([10., 10., 10.]),
    "shear": vec3.create([90., 90., 90.]),
    "clip": vec3.create([-100., -100., -100.])
}

Teapot = {
    "id": 1,
    "name": "Teapot.json",
    "translate": vec3.create([0., 0., -15.]),
    "rotate": vec3.create([0., 0., -0.]),
    "scale": vec3.create([0.2, 0.2, 0.2]),
    "shear": vec3.create([90., 90., 90.]),
    "clip": vec3.create([-100., -100., -100.])
}

CSIE = {
    "id": 2,
    "name": "Csie.json",
    "translate": vec3.create([5., -1., -12.]),
    "rotate": vec3.create([-90., 0., -45.]),
    "scale": vec3.create([5., 5., 5.]),
    "shear": vec3.create([90., 90., 90.]),
    "clip": vec3.create([-100., -100., -100.])
}

const renderingMethod = [0., 1., 2.];

const ambientlightColor = vec3.create([1., 1., 1.,]);
const ambientlightKa = 0.1;
var ambientlight;

var lightPosition = new Float32Array([0., 5., -10., 17., 5., -17., -17., 5., -17.]);
var lightColors = new Float32Array([1., 1., 1., 1., 1., 1., 1., 1., 1.])
var lightKdKsCD = new Float32Array([0.6, 0.3, 20.0, 0.6, 0.3, 20.0, 0.6, 0.3, 20.0]);
var light;

var obj_vec = [];
var slideOption = [new EntityOpt(), new EntityOpt(), new EntityOpt()];

var rotate_flag = false;
var lastTime = 0;
var random_light_flag = false;
var transparent = 1.0;
