import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import Stats from 'https://cdnjs.cloudflare.com/ajax/libs/stats.js/17/Stats.js'
import obj2gltf from "obj2gltf";
import fs from "fs";

// guide: https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene

const scene = new THREE.Scene();
var camera;
var light1;
var light2;
var light3;
var ambientLight;
var gltfLoader;
var objLoader;
var mtlLoader;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xacc1e3);     // set background colour
document.body.appendChild( renderer.domElement );

// setup stats (for debugging)
var stats = new Stats();
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

// setup camera
function initCamera() {
    // TODO: figure out how to make camera initialize looking in a diff direction
    console.log("initCamera called");
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.y = 7;
    camera.position.z = -2;
    // camera.lookAt(0, 3, 10);

    var controls = new OrbitControls(camera, renderer.domElement);
    controls.damping = 0.2;
    controls.autoRotate = false;
    // controls.target = new THREE.Vector3(0, 3, 10);
}

// setup lights
function initLights() {
    light1 = new THREE.PointLight(0xffffff, 750.0);
    light1.position.set(0,25,2);
    scene.add(light1);
    light2 = new THREE.PointLight(0xffffff, 750.0);
    light2.position.set(35,25,2);
    scene.add(light2);
    light3 = new THREE.PointLight(0xffffff, 750.0);
    light3.position.set(-35,25,2);
    scene.add(light3);
    ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
}

// setup objects
function initObjects() {
    var textureLoader = new THREE.TextureLoader();
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

    // back wall
    // bumpmap texture from: https://blog.spoongraphics.co.uk/freebies/10-free-seamless-subtle-grunge-concrete-textures
    var bgWallBumpMap = textureLoader.load('./images/concrete_bumpmap.jpg');
    bgWallBumpMap.repeat.set(1, 1);
    bgWallBumpMap.wrapS = THREE.RepeatWrapping;
    bgWallBumpMap.wrapT = THREE.RepeatWrapping;

    var bgWallGeometry = new THREE.BoxGeometry(17, 15, 2);
    var bgWallMaterial = new THREE.MeshStandardMaterial( { color: 0xc9ba99, bumpMap: bgWallBumpMap} );
    var bgWall = new THREE.Mesh(bgWallGeometry, bgWallMaterial);
    bgWall.position.set(0, 6.4, -3.70);
    scene.add(bgWall);

    // stall
    // bumpmap texture from: https://en.wikipedia.org/wiki/File:Popcorn_ceiling_texture_close_up.jpg
    var stallWallGeometry = new THREE.BoxGeometry(13, 12, 0.3);

    var stallBumpMap = textureLoader.load('./images/stall_normal_map.jpg');
    stallBumpMap.repeat.set(1, 1);
    stallBumpMap.wrapS = THREE.RepeatWrapping;
    stallBumpMap.wrapT = THREE.RepeatWrapping;

    var stallWallMaterial = new THREE.MeshStandardMaterial( { color: 0x6f6b80, bumpMap: stallBumpMap} );
    stallWallMaterial.needsUpdate = true;
    var stallWalls = new THREE.InstancedMesh(stallWallGeometry, stallWallMaterial, 2);

    // stallWall1.position.set(-4.3, 7.5, 2.5);
    // stallWall1.rotation.set(0, Math.PI / 2, 0);

    var transform = new THREE.Matrix4();
    transform.set(0.0, 0.0, -1.0, -4.3,
                  0.0, 1.0,  0.0, 7.5,
                  1.0, 0.0,  0.0, 2.5,
                  0.0, 0.0,  0.0, 1.0);
    stallWalls.setMatrixAt(0, transform);
    transform.set(0.0, 0.0, -1.0, 4.3,
                  0.0, 1.0,  0.0, 7.5,
                  1.0, 0.0,  0.0, 2.5,
                  0.0, 0.0,  0.0, 1.0);
    stallWalls.setMatrixAt(1, transform);
    scene.add(stallWalls);

    // var stallWall2 = stallWall1.clone();
    // stallWall2.position.set(4.3, 7.5, 2.5);
    // stallWall2.rotation.set(0, Math.PI / 2, 0);
    // scene.add(stallWall2);

    var stallPillarGeometry = new THREE.BoxGeometry(2.0, 14.7, 0.3);
    var stallPillars = new THREE.InstancedMesh(stallPillarGeometry, stallWallMaterial, 2);

    // stallPillar1.position.set(-3.7, 6.15, 9.1);

    transform.set(1.0, 0.0,  0.0, -3.7,
                  0.0, 1.0,  0.0, 6.15,
                  0.0, 0.0,  1.0, 9.1,
                  0.0, 0.0,  0.0, 1.0);
    stallPillars.setMatrixAt(0, transform);
    transform.set(1.0, 0.0,  0.0, 3.7,
                  0.0, 1.0,  0.0, 6.15,
                  0.0, 0.0,  1.0, 9.1,
                  0.0, 0.0,  0.0, 1.0);
    stallPillars.setMatrixAt(1, transform);
    scene.add(stallPillars);

    // var stallPillar2 = stallPillar1.clone();
    // stallPillar2.position.set(3.7, 6.15, 9.1);
    // scene.add(stallPillar2);

    var stallDoorGeometry = new THREE.BoxGeometry(5.3, 11, 0.3);
    var stallDoor = new THREE.Mesh(stallDoorGeometry, stallWallMaterial);
    stallDoor.position.set(0, 6.5, 9.1);    // closed
    // stallDoor.position.set(-2.5, 6.5, 12);      // open
    // stallDoor.rotation.set(0, Math.PI / 2, 0);
    scene.add(stallDoor);

    // TODO: look into envmap for metalMaterial
    var stallTopBarGeometry = new THREE.BoxGeometry(9.75, 0.35, 0.3);
    var metalMaterial = new THREE.MeshStandardMaterial({ color: 0x909596, emissive: 0x1c1d1f, metalness: 1.0 });
    var stallTopBar = new THREE.Mesh(stallTopBarGeometry, metalMaterial);
    stallTopBar.position.set(0, 13.67, 9.1);
    scene.add(stallTopBar);

    var stallPillarCapGeometry = new THREE.BoxGeometry(2.05, 0.55, 0.35);
    var stallPillarCaps = new THREE.InstancedMesh(stallPillarCapGeometry, metalMaterial, 2);

    // stallPillarCap1.position.set(-3.7, -0.85, 9.1);

    transform.set(1.0, 0.0,  0.0, -3.7,
                  0.0, 1.0,  0.0, -0.85,
                  0.0, 0.0,  1.0, 9.1,
                  0.0, 0.0,  0.0, 1.0);
    stallPillarCaps.setMatrixAt(0, transform);
    transform.set(1.0, 0.0,  0.0, 3.7,
                  0.0, 1.0,  0.0, -0.85,
                  0.0, 0.0,  1.0, 9.1,
                  0.0, 0.0,  0.0, 1.0);
    stallPillarCaps.setMatrixAt(1, transform);   

    scene.add(stallPillarCaps);

    // var stallPillarCap2 = stallPillarCap1.clone();
    // stallPillarCap2.position.set(3.7, -0.85, 9.1);
    // scene.add(stallPillarCap2);

    // var lockBackTopGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.02, 16);
    // var lockBackTop = new THREE.Mesh(lockBackTopGeometry, metalMaterial);
    // lockBackTop.rotation.set(Math.PI / 2, 0, 0);
    // lockBackTop.position.set(2.43, 6.75, 9.25);
    // scene.add(lockBackTop);

    var hingeGeometry = new THREE.CylinderGeometry(0.07, 0.07, 0.5, 16);
    var hinges = new THREE.InstancedMesh(hingeGeometry, metalMaterial, 4);

    // hingeTop1.position.set(2.65, 10.5, 8.9);

    transform.set(1.0, 0.0,  0.0, 2.65,
                  0.0, 1.0,  0.0, 10.5,
                  0.0, 0.0,  1.0, 8.9,
                  0.0, 0.0,  0.0, 1.0);
    hinges.setMatrixAt(0, transform);

    transform.set(1.0, 0.0,  0.0, 2.65,
                  0.0, 1.0,  0.0, 9.95,
                  0.0, 0.0,  1.0, 8.9,
                  0.0, 0.0,  0.0, 1.0);
    hinges.setMatrixAt(1, transform);

    transform.set(1.0, 0.0,  0.0, 2.65,
                  0.0, 1.0,  0.0, 3.5,
                  0.0, 0.0,  1.0, 8.9,
                  0.0, 0.0,  0.0, 1.0);
    hinges.setMatrixAt(2, transform);

    transform.set(1.0, 0.0,  0.0, 2.65,
                  0.0, 1.0,  0.0, 2.95,
                  0.0, 0.0,  1.0, 8.9,
                  0.0, 0.0,  0.0, 1.0);
    hinges.setMatrixAt(3, transform);

    scene.add(hinges);

    // var hingeTop2 = hingeTop1.clone();
    // hingeTop2.position.set(2.65, 9.95, 8.9);
    // scene.add(hingeTop2);

    // var hingeBot1 = hingeTop1.clone();
    // hingeBot1.position.set(2.65, 3.5, 8.9);
    // scene.add(hingeBot1);

    // var hingeBot2 = hingeTop1.clone();
    // hingeBot2.position.set(2.65, 2.95, 8.9);
    // scene.add(hingeBot2);

    var hingeAttachGeometry = new THREE.BoxGeometry(0.2, 0.5, 0.03);
    var hingeAttachments = new THREE.InstancedMesh(hingeAttachGeometry, metalMaterial, 4);

    // hingeAttachTop1.position.set(2.75, 10.5, 8.9);

    transform.set(1.0, 0.0,  0.0, 2.75,
                  0.0, 1.0,  0.0, 10.5,
                  0.0, 0.0,  1.0, 8.93,
                  0.0, 0.0,  0.0, 1.0);
    hingeAttachments.setMatrixAt(0, transform);

    transform.set(1.0, 0.0,  0.0, 2.55,
                  0.0, 1.0,  0.0, 9.95,
                  0.0, 0.0,  1.0, 8.93,
                  0.0, 0.0,  0.0, 1.0);
    hingeAttachments.setMatrixAt(1, transform);

    transform.set(1.0, 0.0,  0.0, 2.75,
                  0.0, 1.0,  0.0, 3.5,
                  0.0, 0.0,  1.0, 8.93,
                  0.0, 0.0,  0.0, 1.0);
    hingeAttachments.setMatrixAt(2, transform);

    transform.set(1.0, 0.0,  0.0, 2.55,
                  0.0, 1.0,  0.0, 2.95,
                  0.0, 0.0,  1.0, 8.93,
                  0.0, 0.0,  0.0, 1.0);
    hingeAttachments.setMatrixAt(3, transform);

    scene.add(hingeAttachments);

    // var hingeAttachTop2 = hingeAttachTop1.clone();
    // hingeAttachTop2.position.set(2.55, 9.95, 8.9);
    // scene.add(hingeAttachTop2);

    // var hingeAttachBot1 = hingeAttachTop1.clone();
    // hingeAttachBot1.position.set(2.75, 3.5, 8.9);
    // scene.add(hingeAttachBot1);

    // var hingeAttachBot2 = hingeAttachTop1.clone();
    // hingeAttachBot2.position.set(2.55, 2.95, 8.9);
    // scene.add(hingeAttachBot2);

    resetUVs(bgWall);
    resetUVs(stallWalls);
    // resetUVs(stallWall2);
    resetUVs(stallPillars);
    // resetUVs(stallPillar2);
    resetUVs(stallDoor);

    // toilet
    // from: https://www.cgtrader.com/free-3d-models/architectural/fixture/bathroom-toilet-62ec8361-4aae-4c13-acbd-16462b6b20d8
    // used "decimate" modifier from blender to reduce obj file size
    // converted to gltf using: https://github.com/CesiumGS/obj2gltf

    gltfLoader = new GLTFLoader();
    objLoader = new OBJLoader();
    mtlLoader = new MTLLoader();

    obj2gltf("obj/toilet_dec_planar.obj").then(function (gltf) {
        const data = Buffer.from(JSON.stringify(gltf));
        fs.writeFileSync("obj/toilet_dec_planar.gltf", data);
    });

    gltfLoader.load(
        // resource URL
        'obj/toilet_dec_planar.gltf',
        // called when the resource is loaded
        function ( gltf ) {
    
            scene.add( gltf.scene );
    
            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object
    
        },
        // called while loading is progressing
        function ( xhr ) {
    
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
    
            console.log( 'An error happened' );
    
        }
    );

    // mtlLoader.load('obj/toilet_mtl.mtl', 
    //     function(materials) {
    //         materials.preload();
    //         objLoader.setMaterials(materials);
    //         objLoader.load('obj/toilet_dec_planar.obj', 

    //         function ( object ) {
    //             object.scale.set(0.01, 0.01, 0.01);
    //             object.position.set(1.35, -1, 0);
    //             scene.add( object );
    //         },

    //         function ( xhr ) {
    //             console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    //         },

    //         // called when loading has errors
    //         function ( error ) {
    //             console.log( 'An error happened' );
    //         });
    //     }
    // );


    
}

// a function that resets the UVs 
// trying to recreate a 3D texture
// from: https://codepen.io/boytchev/pen/rNZxLLK
// TODO: research to understand this better

function resetUVs( object )
{
		var pos = object.geometry.getAttribute( 'position' ),
			nor = object.geometry.getAttribute( 'normal' ),
			uvs = object.geometry.getAttribute( 'uv' );
	
            // for every vertex position in object
		for( var i=0; i<pos.count; i++ )
		{
				var x = 0,
				    y = 0;
			
				var nx = Math.abs(nor.getX(i)),
					ny = Math.abs(nor.getY(i)),
					nz = Math.abs(nor.getZ(i));

				// if facing X
				if( nx>=ny && nx>=nz )
				{
					x = pos.getZ( i );
					y = pos.getY( i );
				}

				// if facing Y
				if( ny>=nx && ny>=nz )
				{
					x = pos.getX( i );
					y = pos.getZ( i );
				}

				// if facing Z
				if( nz>=nx && nz>=ny )
				{
					x = pos.getX( i );
					y = pos.getY( i );
				}

				uvs.setXY( i, x, y );
		}
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
    stats.begin();
	renderer.render( scene, camera );
    stats.end();
}
init();
animate();