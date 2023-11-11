import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

// guide: https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene

const scene = new THREE.Scene();
var camera;
var light;
var ambientLight;
var objLoader;
var mtlLoader;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xacc1e3);     // set background colour
document.body.appendChild( renderer.domElement );

// setup camera
function initCamera() {
    console.log("initCamera called");
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z = 5;

    var controls = new OrbitControls(camera, renderer.domElement);
    controls.damping = 0.2;
    controls.autoRotate = false;
}

// setup lights
function initLights() {
    light = new THREE.PointLight(0xffffff);
    light.position.set(0,25,0);
    scene.add(light);
    ambientLight = new THREE.AmbientLight(0x606060, 5);
    scene.add(ambientLight);

    var lightObjGeometry = new THREE.SphereGeometry(1, 32, 32);    // radius, segments, segments
    var lightObjMaterial = new THREE.MeshBasicMaterial( {color: 0xffecad} );
    var lightObj = new THREE.Mesh(lightObjGeometry, lightObjMaterial);
    lightObj.position.set(light.position.x, light.position.y, light.position.z);
    scene.add(lightObj);
}

// setup objects
function initObjects() {
    // cube
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    // textured floor
    // from: https://www.istockphoto.com/vector/vector-white-modern-abstract-background-gm946593026-258493578
    var floorTexture = new THREE.TextureLoader().load('images/floor_tiling.jpg');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(1, 1);
    var floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
    var floorGeometry = new THREE.PlaneGeometry(50, 50);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -1.1;
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);

    // toilet
    // from: https://www.cgtrader.com/free-3d-models/architectural/fixture/bathroom-toilet-62ec8361-4aae-4c13-acbd-16462b6b20d8
    objLoader = new OBJLoader();
    mtlLoader = new MTLLoader();

    mtlLoader.load('obj/toilet_mtl.mtl', 
        function(materials) {
            materials.preload();
            objLoader.setMaterials(materials);
            objLoader.load('obj/toilet.obj', 

            function ( object ) {
                object.scale.set(0.01, 0.01, 0.01);
                scene.add( object );
            },

            function ( xhr ) {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },

            // called when loading has errors
            function ( error ) {
                console.log( 'An error happened' );
            });
        }
    );
    
}




// init: setup entire scene
function init() {
    initCamera();
    initLights();
    initObjects();

    window.addEventListener('resize',resize);
    resize();
}

// ADAPT TO WINDOW RESIZE
function resize() {
    renderer.setSize(window.innerWidth,window.innerHeight);
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
}

// run everything
function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
init();
animate();