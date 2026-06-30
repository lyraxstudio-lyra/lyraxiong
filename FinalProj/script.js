// Basic Three.js Example
// Chelsea Thompto - Spring 2026

// Three.js uses an import map to add features.
// The "import * as THREE from 'three';" will be
// in all sketches. Add-ons will be added after.

// The main library script
import * as THREE from "three/webgpu";

import {
	uniform,
	refract,
	div,
	frameId,
	lightViewPosition,
	float,
	positionView,
	positionViewDirection,
	screenUV,
	pass,
	texture3D,
	time,
	screenCoordinate,
	normalView,
	texture,
	Fn,
	vec2,
	vec3
} from "three/tsl";

// The plug-in for orbit controls
import { OrbitControls } from "./src/OrbitControls.js";
import { GLTFLoader } from "./src/GLTFLoader.js";
import { DRACOLoader } from "./src/DRACOLoader.js";
import { ImprovedNoise } from "./src/ImprovedNoise.js";
import { SkyMesh } from "./src/SkyMesh.js";
import { Inspector } from "./src/Inspector.js";

import { bayer16 } from "./src/Bayer.js";
import { bloom } from "./src/tsl/display/BloomNode.js";

// Declaring global variables.
let camera, canvas, controls, scene, renderer;
let renderPipeline;
let gltf;
let gltf2;
let gltf3;
let sky, sun;

init();

function initSky() {
	// Add Sky
	sky = new SkyMesh();
	sky.scale.setScalar(300000);
	scene.add(sky);

	sun = new THREE.Vector3();

	/// GUI

	const effectController = {
		turbidity: 10,
		rayleigh: 3,
		mieCoefficient: 0.005,
		mieDirectionalG: 0.7,
		elevation: 1,
		azimuth: 40,
		exposure: 0.5,
		cloudCoverage: 0.4,
		cloudDensity: 1,
		cloudElevation: 0.9,
		showSunDisc: true
	};

	//function gui2Changed() {
		sky.turbidity.value = effectController.turbidity;
		sky.rayleigh.value = effectController.rayleigh;
		sky.mieCoefficient.value = effectController.mieCoefficient;
		sky.mieDirectionalG.value = effectController.mieDirectionalG;
		sky.cloudCoverage.value = effectController.cloudCoverage;
		sky.cloudDensity.value = effectController.cloudDensity;
		sky.cloudElevation.value = effectController.cloudElevation;
		sky.showSunDisc.value = effectController.showSunDisc;

		const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
		const theta = THREE.MathUtils.degToRad(effectController.azimuth);

		sun.setFromSphericalCoords(1, phi, theta);

		sky.sunPosition.value.copy(sun);

		renderer.toneMappingExposure = effectController.exposure;
	}

	//const gui2 = renderer.inspector.createParameters("Settings");
//
	//gui2.add(effectController, "turbidity", 0.0, 20.0, 0.1).onChange(gui2Changed);
	//gui2.add(effectController, "rayleigh", 0.0, 4, 0.001).onChange(gui2Changed);
	//gui2.add(effectController, "mieCoefficient", 0.0, 0.1, 0.001).onChange(gui2Changed);
	//gui2.add(effectController, "mieDirectionalG", 0.0, 1, 0.001).onChange(gui2Changed);
	//gui2.add(effectController, "elevation", 0, 90, 0.1).onChange(gui2Changed);
	//gui2.add(effectController, "azimuth", -180, 180, 0.1).onChange(gui2Changed);
	//gui2.add(effectController, "exposure", 0, 1, 0.0001).onChange(gui2Changed);
	//gui2.add(effectController, "showSunDisc").onChange(gui2Changed);
//
	//const folderClouds = gui2.addFolder("Clouds");
	//folderClouds.add(effectController, "cloudCoverage", 0, 1, 0.01).name("coverage").onChange(gui2Changed);
	//folderClouds.add(effectController, "cloudDensity", 0, 1, 0.01).name("density").onChange(gui2Changed);
	//folderClouds.add(effectController, "cloudElevation", 0, 1, 0.01).name("elevation").onChange(gui2Changed);
//
	//gui2Changed();
//}

function init() {
	//camera from example
	const LAYER_VOLUMETRIC_LIGHTING = 10;

	camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.028, 5);
	camera.position.set(-70, 1500, 600);

	scene = new THREE.Scene();

	// Renderer
	renderer = new THREE.WebGPURenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setAnimationLoop(animate);
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 0.6;
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.transmitted = true;
	renderer.inspector = new Inspector();
	document.body.appendChild(renderer.domElement);

	window.addEventListener("resize", onWindowResize);

	initSky();

	//Light
	const spotLight = new THREE.SpotLight(0xffc285, 7);
	spotLight.position.set(0.4, 0.1, 0.6);
	spotLight.castShadow = true;
	spotLight.angle = Math.PI / 6;
	spotLight.penumbra = 2;
	spotLight.decay = 1;
	spotLight.distance = -100;
	spotLight.shadow.mapType = THREE.HalfFloatType; // For HDR Caustics
	spotLight.shadow.mapSize.width = 1024;
	spotLight.shadow.mapSize.height = 1024;
	spotLight.shadow.camera.near = 0.1;
	spotLight.shadow.camera.far = 1.1;
	spotLight.shadow.intensity = 0.9;
	spotLight.layers.enable(LAYER_VOLUMETRIC_LIGHTING);
	scene.add(spotLight);

	//spotlight from the top 
	//const spotlight2 = new THREE.SpotLight(0xfffdfb,10);
	//spotLight2.position.set(0.4, 0.1, 0.3);
	//model
	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath("./src/draco/");
	dracoLoader.setDecoderConfig({ type: "js" });

	const loader = new GLTFLoader();
	loader.setDRACOLoader(dracoLoader);

	const causticMap = new THREE.TextureLoader().load("./src/Caustic_Free.jpg");
	causticMap.wrapS = causticMap.wrapT = THREE.RepeatWrapping;
	causticMap.colorSpace = THREE.SRGBColorSpace;

	const causticOcclusion = uniform(1);

	let duck;
	let rock;

	loader.load("./src/tree.glb", function (loadedGltf) {
		gltf = loadedGltf.scene;
		gltf.scale.setScalar(0.2);
		gltf.translateY(-0.07);
		scene.add(gltf);

		duck = gltf.children[0];

		duck.material = new THREE.MeshPhysicalNodeMaterial();
		duck.material.side = THREE.DoubleSide;
		duck.material.transparent = true;
		duck.material.color = new THREE.Color(0xffffb9);
		duck.material.transmission = 1.5;
		duck.material.thickness = 0.5;
		duck.material.ior = 1.5;
		duck.material.metalness = 0;
		duck.material.roughness = 0;
		duck.castShadow = true;

		const causticEffect = Fn(() => {
			const refractionVector = refract(
				positionViewDirection.negate(),
				normalView,
				div(1.0, duck.material.ior)
			).normalize();

			const viewZ = normalView.z.pow(causticOcclusion);
			const textureUV = refractionVector.xy.mul(0.6);
			const causticColor = uniform(duck.material.color);
			const chromaticAberrationOffset = normalView.z.pow(-0.9).mul(0.004);

			const causticProjection = vec3(
				texture(causticMap, textureUV.add(vec2(chromaticAberrationOffset.negate(), 0))).r,
				texture(causticMap, textureUV.add(vec2(0, chromaticAberrationOffset.negate()))).g,
				texture(causticMap, textureUV.add(vec2(chromaticAberrationOffset, chromaticAberrationOffset))).b
			);

			return causticProjection.mul(viewZ.mul(60)).add(viewZ).mul(causticColor);
		})().toVar();

		duck.material.castShadowNode = causticEffect;

		duck.material.emissiveNode = Fn(() => {
			// Custom emissive for illuminating backside of the mesh based on the caustic effect and light direction

			const thicknessPowerNode = float(3.0);

			const scatteringHalf = lightViewPosition(spotLight).sub(positionView).normalize();
			const scatteringDot = float(
				positionViewDirection.dot(scatteringHalf.negate()).saturate().pow(thicknessPowerNode)
			);

			return causticEffect.mul(scatteringDot.add(0.1)).mul(0.02);
		})();

		const gui = renderer.inspector.createParameters("Volumetric Caustics");
		gui.add(causticOcclusion, "value", 0, 40).name("caustic occlusion");
		gui.addColor(duck.material, "color").name("material color");
	});
//garden
	loader.load("./src/garden.glb", function (loadedGltf2) {
		gltf2 = loadedGltf2.scene;
		gltf2.scale.setScalar(0.05);
		gltf2.translateY(-0.05);
		gltf2.translateZ(0.01);
		scene.add(gltf2);

		rock = gltf2.children[0];

		const stoneTexture = new THREE.TextureLoader().load("./src/ground.jpeg");
		stoneTexture.colorSpace = THREE.SRGBColorSpace;

		rock.material = new THREE.MeshStandardMaterial({
			map: stoneTexture,
			roughness: 8,
			metalness: 0,
			side: THREE.DoubleSide
		});
		rock.castShadow = true;
		rock.receiveShadow = true;
	});
	
//end garden
	
	//flower
	loader.load("./src/flower.glb", function (loadedGltf3) {
		gltf3 = loadedGltf3.scene;
		gltf3.scale.setScalar(0.01);
		gltf3.translateY(0.08);
		gltf3.translateZ(0.01);
		scene.add(gltf3);

		flower = gltf3.children[0];
		
		//flower.receiveShadow = true;

		//const stoneTexture = new THREE.TextureLoader().load("./src/ground.jpeg");
		//stoneTexture.colorSpace = THREE.SRGBColorSpace;
//
		//rock.material = new THREE.MeshStandardMaterial({
		//	map: stoneTexture,
		//	roughness: 8,
		//	metalness: 0,
		//	side: THREE.DoubleSide
		//});
		//rock.castShadow = true;
	});
	
	
	//flower
	//loader.load("./src/garden.glb", function (loadedGltf2) {
	//	gltf2 = loadedGltf2.scene;
	//	gltf2.scale.setScalar(0.02);
	//	scene.add(gltf2);
//
	//	rock = gltf2.children[0];
//
	//	const stoneTexture = new THREE.TextureLoader().load("./src/ground.jpeg");
	//	stoneTexture.colorSpace = THREE.SRGBColorSpace;
//
	//	rock.material = new THREE.MeshStandardMaterial({
	//		map: stoneTexture,
	//		roughness: 8,
	//		metalness: 0,
	//		side: THREE.DoubleSide
	//	});
	//	rock.castShadow = true;
	//});
	
//end flower

	// Ground

	const textureLoader = new THREE.TextureLoader();
	const map = textureLoader.load("./src/hardwood2_diffuse.jpg");
	map.wrapS = map.wrapT = THREE.RepeatWrapping;
	map.repeat.set(10, 10);

	const geometry = new THREE.PlaneGeometry(10, 10);
	const material = new THREE.MeshStandardMaterial({
	map: new THREE.TextureLoader().load("./src/dirt.jpeg")
});

const ground = new THREE.Mesh(geometry, material);
	ground.rotation.x = -Math.PI / 2;
	ground.receiveShadow = true;
	ground.translateZ(-4);
	scene.add(ground);

	// Post-Processing

	renderPipeline = new THREE.RenderPipeline(renderer);

	// Layers

	const volumetricLightingIntensity = uniform(0.7);

	const volumetricLayer = new THREE.Layers();
	volumetricLayer.disableAll();
	volumetricLayer.enable(LAYER_VOLUMETRIC_LIGHTING);

	// Volumetric Fog Area

	function createTexture3D() {
		let i = 0;

		const size = 128;
		const data = new Uint8Array(size * size * size);

		const scale = 10;
		const perlin = new ImprovedNoise();

		const repeatFactor = 5.0;

		for (let z = 0; z < size; z++) {
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const nx = (x / size) * repeatFactor;
					const ny = (y / size) * repeatFactor;
					const nz = (z / size) * repeatFactor;

					const noiseValue = perlin.noise(nx * scale, ny * scale, nz * scale);

					data[i] = 128 + 128 * noiseValue;

					i++;
				}
			}
		}

		const texture = new THREE.Data3DTexture(data, size, size, size);
		texture.format = THREE.RedFormat;
		texture.minFilter = THREE.LinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.unpackAlignment = 1;
		texture.needsUpdate = true;

		return texture;
	}

	const noiseTexture3D = createTexture3D();

	const smokeAmount = uniform(3);

	const volumetricMaterial = new THREE.VolumeNodeMaterial();
	volumetricMaterial.steps = 20;
	volumetricMaterial.offsetNode = bayer16(screenCoordinate.add(frameId)); // Add dithering to reduce banding
	volumetricMaterial.scatteringNode = Fn(({ positionRay }) => {
		// Return the amount of fog based on the noise texture

		const timeScaled = vec3(time.mul(0.01), 0, time.mul(0.03));

		const sampleGrain = (scale, timeScale = 1) =>
			texture3D(noiseTexture3D, positionRay.add(timeScaled.mul(timeScale)).mul(scale).mod(1), 0).r.add(0.5);

		let density = sampleGrain(1);
		density = density.mul(sampleGrain(0.5, 1));
		density = density.mul(sampleGrain(0.2, 2));

		return smokeAmount.mix(1, density);
	});

	const volumetricMesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 1.5), volumetricMaterial);
	volumetricMesh.receiveShadow = true;
	volumetricMesh.position.y = 0.25;
	volumetricMesh.layers.disableAll();
	volumetricMesh.layers.enable(LAYER_VOLUMETRIC_LIGHTING);
	scene.add(volumetricMesh);

	// Scene Pass

	const scenePass = pass(scene, camera).toInspector();
	scenePass.name = "Scene";

	const sceneDepth = scenePass.getTextureNode("depth");
	sceneDepth.name = "Scene Depth";

	// Material - Apply occlusion depth of volumetric lighting based on the scene depth

	volumetricMaterial.depthNode = sceneDepth.sample(screenUV);

	// Volumetric Lighting Pass

	const volumetricPass = pass(scene, camera, { depth: false, samples: 0 }).toInspector("Volumetric Lighting / Raw");
	volumetricPass.name = "Volumetric Lighting";
	volumetricPass.setLayers(volumetricLayer);
	volumetricPass.setResolutionScale(0.5);

	// Compose and Denoise

	const bloomPass = bloom(volumetricPass, 1, 1, 0).toInspector("Volumetric Lighting / Mip-Chain Gaussian Blur");
	bloomPass.name = "Bloom";

	const scenePassColor = scenePass.add(bloomPass.mul(volumetricLightingIntensity));

	renderPipeline.outputNode = scenePassColor;

	// Controls

	controls = new OrbitControls(camera, renderer.domElement);
	controls.target.z = -0.05;
	controls.target.y = 0.02;
	controls.maxDistance = 1;

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	function animate() {
		//if (gltf) {
		//	for (const mesh of gltf.children) {
		//		mesh.rotation.z -= 0.005;
		//	}
		//}

		if (controls) {
			controls.update();
		}

		if (renderPipeline) {
			renderPipeline.render();
		}
	}
}
