import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import Stats from 'https://cdnjs.cloudflare.com/ajax/libs/stats.js/17/Stats.js';
// guide: https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene

const scene = new THREE.Scene();
var camera;
var light1;
var light2;
var light3;
var ambientLight;
var gltfLoader;

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
    camera.position.x = 0;
    camera.position.y = 7;
    camera.position.z = -2;

    var controls = new OrbitControls(camera, renderer.domElement);
    controls.damping = 0.5;
    controls.autoRotate = false;


}

// setup lights
function initLights() {
    light1 = new THREE.PointLight(0xffffff, 750.0);
    light1.position.set(0,25,2);
    scene.add(light1);
    light1.shadow.autoUpdate = false;
    ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
}

// setup objects
function initObjects() {
    var textureLoader = new THREE.TextureLoader();
    // textured floor
    // from: https://www.istockphoto.com/vector/vector-white-modern-abstract-background-gm946593026-258493578
    var floorTexture = textureLoader.load('./images/floor_tiling.jpg');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(1, 1);
    var floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
    var floorGeometry = new THREE.PlaneGeometry(50, 50);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -1.1;
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);
    floor.matrixAutoUpdate = false;
    floor.updateMatrix();

    // back wall
    // bumpmap texture from: https://blog.spoongraphics.co.uk/freebies/10-free-seamless-subtle-grunge-concrete-textures
    var bgWallBumpMap = textureLoader.load('./images/concrete_bumpmap.jpg');
    bgWallBumpMap.repeat.set(1, 1);
    bgWallBumpMap.wrapS = bgWallBumpMap.wrapT = THREE.RepeatWrapping;

    var bgWallGeometry = new THREE.BoxGeometry(17, 15, 2);
    var bgWallMaterial = new THREE.MeshLambertMaterial( { color: 0xc9ba99, bumpMap: bgWallBumpMap} );
    var bgWall = new THREE.Mesh(bgWallGeometry, bgWallMaterial);
    bgWall.position.set(0, 6.4, -3.70);
    scene.add(bgWall);
    bgWall.matrixAutoUpdate = false;
    bgWall.updateMatrix();

    // stall
    // bumpmap texture from: https://en.wikipedia.org/wiki/File:Popcorn_ceiling_texture_close_up.jpg
    var stallWallGeometry = new THREE.BoxGeometry(13, 12, 0.3);

    var stallBumpMap = textureLoader.load('./images/stall_normal_map_2.jpg');
    stallBumpMap.repeat.set(1, 1);
    stallBumpMap.wrapS = stallBumpMap.wrapT = THREE.RepeatWrapping;

    var stallWallMaterial = new THREE.MeshLambertMaterial( { color: 0x6f6b80, bumpMap: stallBumpMap} );
    stallWallMaterial.needsUpdate = true;
    var stallWalls = new THREE.InstancedMesh(stallWallGeometry, stallWallMaterial, 2);

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
    stallWalls.matrixAutoUpdate = false;
    stallWalls.updateMatrix();

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

    stallPillars.matrixAutoUpdate = false;
    stallPillars.updateMatrix();

    var stallDoorGeometry = new THREE.BoxGeometry(5.3, 11, 0.3);
    var stallDoor = new THREE.Mesh(stallDoorGeometry, stallWallMaterial);
    stallDoor.position.set(0, 6.5, 9.1);    // closed
    scene.add(stallDoor);

    stallDoor.matrixAutoUpdate = false;
    stallDoor.updateMatrix();

    var stallTopBarGeometry = new THREE.BoxGeometry(9.75, 0.35, 0.3);
    var metalMaterial = new THREE.MeshPhongMaterial({ color: 0x909596, emissive: 0x1c1d1f, metalness: 1.0 });
    var stallTopBar = new THREE.Mesh(stallTopBarGeometry, metalMaterial);
    stallTopBar.position.set(0, 13.67, 9.1);
    scene.add(stallTopBar);
    stallTopBar.matrixAutoUpdate = false;
    stallTopBar.updateMatrix();

    var stallPillarCapGeometry = new THREE.BoxGeometry(2.05, 0.55, 0.35);
    var stallPillarCaps = new THREE.InstancedMesh(stallPillarCapGeometry, metalMaterial, 2);

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
    stallPillarCaps.matrixAutoUpdate = false;
    stallPillarCaps.updateMatrix();

    var hingeGeometry = new THREE.CylinderGeometry(0.07, 0.07, 0.5, 16);
    var hinges = new THREE.InstancedMesh(hingeGeometry, metalMaterial, 4);

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

    hinges.matrixAutoUpdate = false;
    hinges.updateMatrix();

    var hingeAttachGeometry = new THREE.BoxGeometry(0.2, 0.5, 0.03);
    var hingeAttachments = new THREE.InstancedMesh(hingeAttachGeometry, metalMaterial, 4);

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

    hingeAttachments.matrixAutoUpdate = false;
    hingeAttachments.updateMatrix();

    var doorLockGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 16);
    var doorLock = new THREE.InstancedMesh(doorLockGeometry, metalMaterial, 2);
    doorLock.position.set(0, 5, 5);
    transform.set(1.0, 0.0,  0.0, -2.25,
                  0.0, 0.0,  -1.0, 1.75,
                  0.0, 1.0,  0.0, 3.95,
                  0.0, 0.0,  0.0, 1.0);
    doorLock.setMatrixAt(0, transform);
    transform.set(1.0, 0.0,  0.0, -2.25,
                  0.0, 0.0,  -1.0, 1.75,
                  0.0, 1.0,  0.0, 4.25,
                  0.0, 0.0,  0.0, 1.0);
    doorLock.setMatrixAt(1, transform);
    scene.add(doorLock);

    doorLock.matrixAutoUpdate = false;
    doorLock.updateMatrix();

    resetUVs(bgWall);
    resetUVs(stallWalls);
    resetUVs(stallPillars);
    resetUVs(stallDoor);

    // toilet
    // from: https://www.cgtrader.com/free-3d-models/architectural/fixture/bathroom-toilet-62ec8361-4aae-4c13-acbd-16462b6b20d8
    // used "decimate" modifier from blender to reduce obj file size
    // converted to gltf/glb using blender

    gltfLoader = new GLTFLoader();
    gltfLoader.load(
        // resource URL
        './obj/toilet.glb',
        // called when the resource is loaded
        function ( gltf ) {
    
            scene.add( gltf.scene );
            gltf.scene.scale.set(10, 10, 10);
            gltf.scene.position.set(1.35, -1, 0);
            console.log("object loaded");
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

}

// setup images (text)
function initImages() {
    var imageLoader = new THREE.ImageBitmapLoader();
    imageLoader.setOptions( { imageOrientation: 'flipY' } );

    var imageGeometry = new THREE.PlaneGeometry(5, 5);

    var text1;
    imageLoader.load(
        // resource URL
        './images/bath_text_full_1.png',
    
        // onLoad callback
        function ( imageBitmap ) {
            var texture = new THREE.CanvasTexture( imageBitmap );
            var material = new THREE.MeshBasicMaterial( { map: texture } );
            material.transparent = true;
            text1 = createImage(material, 11, imageGeometry);
            scene.add(text1);
            text1.position.set(-4.13, 8.5, 2.5);
            text1.rotation.set(0, Math.PI / 2, 0);
        },
    
        // onProgress callback currently not supported
        undefined,
    
        // onError callback
        function ( err ) {
            console.log( 'An error happened' ); 
        }
    );

    var text2;
    imageLoader.load(
        // resource URL
        './images/bath_text_full_2.png',
    
        // onLoad callback
        function ( imageBitmap ) {
            var texture = new THREE.CanvasTexture( imageBitmap );
            var material = new THREE.MeshBasicMaterial( { map: texture } );
            material.transparent = true;
            text2 = createImage(material, 8, imageGeometry);
            scene.add(text2);
            text2.position.set(0, 7, 8.9);
            text2.rotation.set(0, Math.PI, 0);
        },
    
        // onProgress callback currently not supported
        undefined,
    
        // onError callback
        function ( err ) {
            console.log( 'An error happened' ); 
        }
    );

    var text3;
    imageLoader.load(
        // resource URL
        './images/bath_text_full_3.png',
    
        // onLoad callback
        function ( imageBitmap ) {
            var texture = new THREE.CanvasTexture( imageBitmap );
            var material = new THREE.MeshBasicMaterial( { map: texture } );
            material.transparent = true;
            text3 = createImage(material, 11, imageGeometry);
            scene.add(text3);
            text3.position.set(4.13, 8, 3);
            text3.rotation.set(0, -Math.PI / 2, 0);
        },
    
        // onProgress callback currently not supported
        undefined,
    
        // onError callback
        function ( err ) {
            console.log( 'An error happened' ); 
        }
    );

}

function createImage(image, size, geo) {
    var imageMesh = new THREE.Mesh(geo, image);
    imageMesh.scale.set(size / 5, size / 5, size / 5);
    return imageMesh;
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
    initImages();

    window.addEventListener('resize',resize);
    resize();
}

// ADAPT TO WINDOW RESIZE
function resize() {
    renderer.setSize(window.innerWidth,window.innerHeight);
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
}

// check keyboard presses
var keyboard = new THREEx.KeyboardState();
function checkKeyboard() {
  if (keyboard.pressed("1")) {
    console.log('1 pressed');
    renderer.setPixelRatio( window.devicePixelRatio * 0.5 );     // decrease resolution - runs faster, looks worse
  } else if (keyboard.pressed("2")) {
    console.log('2 pressed');
    renderer.setPixelRatio( window.devicePixelRatio * 0.75 );
  } else if (keyboard.pressed("3")) {
    console.log('3 pressed');
    renderer.setPixelRatio( window.devicePixelRatio * 0.9 );
  } else if (keyboard.pressed("4")) {
    console.log('4 pressed');
    renderer.setPixelRatio( window.devicePixelRatio);
  }
}

// run everything
function animate() {
    requestAnimationFrame( animate );
    stats.begin();
    renderer.render( scene, camera );
    checkKeyboard();
    console.log(renderer.info.render.calls);
    stats.end();
}
init();
animate();