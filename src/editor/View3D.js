import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as THREE from "three";
import Box from '@mui/material/Box';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';

class View3D extends Component {
	constructor(props) {
		super(props);

		this.refRenderer = React.createRef();
		// methods
		this.save = this.save.bind(this);
		this.animate = this.animate.bind(this);
		this.loaderOk = this.loaderOk.bind(this);
		this.loaderAnimOk = this.loaderAnimOk.bind(this);
		this.loaderError = this.loaderError.bind(this);
		this.loaderProgress = this.loaderProgress.bind(this);
		this.toggleElement = this.toggleElement.bind(this);
		this.setAnimationTime = this.setAnimationTime.bind(this);
		this.onWindowResize = this.onWindowResize.bind(this);
		this.animations = [];

		// glTF decompressor, with path for decompression lib loading
		const dracoLoader = new DRACOLoader()
		dracoLoader.setDecoderPath(props.loadPath + '/libs/draco/')
		//dracoLoader.setDecoderConfig({type: 'js'});	// (Optional) Override detection of WASM support.
		// init object loader with decompressor
		this.loader = new GLTFLoader();
		this.loader.setDRACOLoader(dracoLoader)

		// Init exporters
		this.exporterSTL = new STLExporter();
		this.exporterOBJ = new OBJExporter();

		// init animation clock
		this.clock = new THREE.Clock();
		this.animMixer = null;
		this.animTime = 0;

		// Init default scene
		this.scene = this.createScene(this.props.showGroundPlane, this.props.showLight);
	}

	// just empty div to add renderer
	render() {
		// this is to make container below toolbar
		// theme access is possible through function generating sx
		return (
			<Box ref={this.refRenderer} sx={{paddingTop: (theme) => theme.mixins.toolbar.minHeight + 'px'}} />
		);
	}

	// create default scene
	createScene(showGroundPlane, showLight) {
		const scene = new THREE.Scene();
		scene.background = new THREE.Color( 0xafafaf );
		//scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );

		// ground plane
		if (showGroundPlane) {
			const gp = new THREE.Mesh(
				new THREE.PlaneGeometry(2, 2),
				new THREE.MeshPhongMaterial( { color: 0x888888, depthWrite: false } ) 
			);
			gp.rotation.x = - Math.PI / 2;
			gp.receiveShadow = true;
			gp.name = "hlp_ground_plane";
			scene.add(gp);
		}

		// Lights from example
		const hL = new THREE.HemisphereLight(0xffffff, 0x444444);
		hL.position.set(0, 5, 0);
		scene.add(hL);
		if (showLight) {
			const h = new THREE.HemisphereLightHelper(hL, 1, 0xff0000);
			h.name = "hlp_hL";
			scene.add(h);
		}

		//const dirLight = new THREE.DirectionalLight( 0xffffff );
		//dirLight.position.set( - 3, 10, - 10 );
		//dirLight.castShadow = true;
		//dirLight.shadow.camera.top = 2;
		//dirLight.shadow.camera.bottom = - 2;
		//dirLight.shadow.camera.left = - 2;
		//dirLight.shadow.camera.right = 2;
		//dirLight.shadow.camera.near = 0.1;
		//dirLight.shadow.camera.far = 40;
		//scene.add( dirLight );
		
		const dL1 = new THREE.DirectionalLight(0xffffff);
		dL1.position.set(2, 2, 2);
		scene.add(dL1);
		if (showLight) {
			const h = new THREE.DirectionalLightHelper(dL1, 1, 0xff0000);
			h.name = "hlp_dL1";
			scene.add(h);
		}

		const dL2 = new THREE.DirectionalLight(0xffffff);
		dL2.position.set(-2, -2, -2 );
		scene.add(dL2);
		if (showLight) {
			const h = new THREE.DirectionalLightHelper(dL2, 1, 0xff0000);
			h.name = "hlp_dL2";
			scene.add(h);
		}

		return scene;
	}

	// extract scene and save object
	save(fileFormat) {
		console.log("Saving object");
		// clone scene to remove hidden
		let forSave = this.scene.clone();
		// find invisible to remove
		let remove = [];
		forSave.traverse(function(o){
			if (!o.visible) {
				console.log("To remove", o.name, o.id, o.uuid);
				remove.push(o.id);
			}
			if (o.name.startsWith('hlp_')) {
				remove.push(o.id);
			}
		});
		// finally remove invisible
		remove.forEach(id => {
			let o = forSave.getObjectById(id);
			o.parent.remove(o);
		});
		// return cleaned
		switch (fileFormat) {
			case "OBJ":
				return this.exporterOBJ.parse(forSave)
			case "STL":
			default:
				return this.exporterSTL.parse(forSave, {binary:true});
		}
	}

	// init three.js renderer
	componentDidMount() {
		// renderer element
		const rSize = this.rendererDimensions();

		// Main renderer
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setPixelRatio( window.devicePixelRatio );	// doubles pixels?!?
		this.renderer.setSize(rSize.width, rSize.height);
		//this.renderer.shadowMap.enabled = true;
		// use ref as a mount point of the Three.js scene instead of the document.body
		this.refRenderer.current.appendChild( this.renderer.domElement );
		// Add handler for resizing
		window.addEventListener( 'resize', this.onWindowResize );

		// Thumbnail renderer
		this.rendererTmb = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		this.rendererTmb.setSize(this.props.thumbnailWidth, this.props.thumbnailHeight);

		// setup camera
		this.camera = new THREE.PerspectiveCamera( 75, rSize.width / rSize.height, 0.1, 100 );
		this.camera.position.set(0, 0.2, 0.1);

		// camera controls
		this.controls = new OrbitControls( this.camera, this.renderer.domElement );
		this.controls.listenToKeyEvents( window ); // optional
		this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
		this.controls.dampingFactor = 0.05;
		this.controls.screenSpacePanning = false;
		this.controls.minDistance = 0.1;
		this.controls.maxDistance = 2;
		this.controls.maxPolarAngle = Math.PI / 2;
		this.controls.target = new THREE.Vector3(0, 0.15, 0);
		this.controls.update();

		// start animation
		this.animate();

		// kickstart loading
		if (this.props.backgroundCube.length > 0) {
			this.scene.background = this.loadBackgroundCube(this.props.backgroundCube);
		}

		this.loadObject(this.props.object3D);
	}

	componentWillUnmount() {
		// remove handler for resizing
		window.removeEventListener( 'resize', this.onWindowResize );
	}

	rendererDimensions(){
		let d = {
			//width: this.refRenderer.current.clientWidth,
			width: window.innerWidth,
			//height: this.refRenderer.current.clientHeight
			height: window.innerHeight
		}
		let rst = getComputedStyle(this.refRenderer.current);
		d.width -= parseFloat(rst.paddingLeft) + parseFloat(rst.paddingRight);
		d.height -= parseFloat(rst.paddingTop) + parseFloat(rst.paddingBottom);
		return d;
	}

	// TODO: fix resizing 
	onWindowResize() {
		const rSize = this.rendererDimensions();
		this.camera.aspect = rSize.width / rSize.height;
		this.camera.updateProjectionMatrix();
		this.controls.update();
		this.renderer.setSize( rSize.width, rSize.height );
	}


	loadObject(filePath){
		if (null === filePath) {
			return;
		}
		this.loader.load(
			this.props.loadPath + filePath,
			this.loaderOk,
			undefined, //this.loaderProgress,
			this.loaderError
		);
	}


	loadAnimation(filePath) {
		if (null === filePath) {
			return;
		}
		this.loader.load(
			this.props.loadPath + filePath,
			this.loaderAnimOk,
			undefined, //this.loaderProgress,
			this.loaderError
		);
	}


	loadBackgroundCube(filesCube) {
		if (null === filesCube) {
			return;
		}
		return new THREE.CubeTextureLoader()
			.setPath(this.props.loadPath)
			.load(filesCube);
	}

	animate() {
		requestAnimationFrame( this.animate );

		// only when object is loaded and we have mixer
		if (null !== this.animMixer) {
			if (this.props.animSingleStep) {
				// for single step use time set
				this.animMixer.setTime(this.animTime);
			} else {
				// Get the time elapsed since the last frame, used for mixer update (if not in single step mode)
				let mixerUpdateDelta = this.clock.getDelta();
				// Update the animation mixer, the stats panel, and render this frame
				this.animMixer.update( mixerUpdateDelta / 2 );
			}
		}
		
		this.renderer.render( this.scene, this.camera );
	};

	// called when object is loaded
	loaderOk(glTF) {
		//console.log(glTF);
		// Pick only first object in scene
		//this.loadedObject = glTF.scene;
		this.loadedObject = glTF.scene.children[0];

		// find optional elements
		let opt = this.findOptional();

		const omat = new THREE.MeshPhongMaterial( { color: 0x226622, flatShading: true } )
		// enable shadow and set material, must have directional light, calc bounding box
		let bb = new THREE.Box3();
		//this.loadedObject.frustumCulled = false;
		this.loadedObject.traverse((o) => {
			// disable hiding object that are not fully in in frustum
			o.frustumCulled = false;
			if ( !o.isMesh ) { return; }
			//o.castShadow = true;
			o.material = omat;
			bb.expandByObject(o);	// calc bounding box
		});
		// object to scene
		this.scene.add(this.loadedObject);

		// display bounding box
		if (this.props.showBoundingBox) {
			const box = new THREE.Box3Helper(bb, 0xff0000)
			box.name = "hlp_bounding_box";
			this.scene.add( box );
		}

		// visible skeleton
		if (this.props.showSkeleton) {
			const skeleton = new THREE.SkeletonHelper(this.loadedObject);
			skeleton.name = 'hlp_skeleton';
			skeleton.visible = true;
			this.scene.add( skeleton );
		}

		// adjust camera to object loaded
		this.cameraToBBox(bb, this.camera, this.controls, 1.0);

		// create thumbnails
		// WARN: Can' do it with cloned scene, all geometry is trashed!!!!
		// Working here with default scene
		this.createElementThumbs(opt, this.props.thumbnailWidth / this.props.thumbnailHeight);

		// preselect default optional elements
		this.showDefaultOptional(opt);

		// create mixer for animations
		this.animMixer = new THREE.AnimationMixer(this.loadedObject);
		
		// Call changed list of models
		if (null !== this.props.availableElements) {
			//console.log(opt)
			this.props.availableElements(opt);
		}

		// clear all previous animations
		this.animations = [];
		// call animation loading
		for (let i = 0; i < this.props.animPoses.length; i++) {
			this.loadAnimation(this.props.animPoses[i]);
		}
	}

	// called while loading is progressing
	loaderProgress (xhr) {
		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	}

	// called when object load fails
	loaderError(error) {
		console.error(error);
	}

	// animation is loaded
	loaderAnimOk(glTF) {
		//console.log(glTF);
		// only first animation
		const anim = glTF.animations[0];

		// find max frame count and frame time
		let frames = 0;
		let frameTime = 0;
		anim.tracks.forEach((t) => {
			if (t.times.length > frames) {
				frames = t.times.length;
				frameTime = t.times[0];
			}
		});

		// remove model positioning
		if (this.props.animDisableMove) {
			anim.tracks = anim.tracks.filter(t => t.name !== "mixamorigHips.position")
		}

		// create disabled action
		const act = this.animMixer.clipAction(anim);
		act.enabled = false;
		act.play();

		// add animation to list
		this.animations.push({
			name: anim.name,
			action: act,
			frames: frames,
			frameTime: frameTime
		});

		// check all loaded to push list
		if (this.props.animPoses.length !== this.animations.length) {
			return;
		}

		// crate anim selection
		let animSelect = [];
		animSelect.push({
			name: 'None', 
			enabled: true,
			frames: 0,
			frameTime: 0
		});
		for (let i = 0; i < this.animations.length; i++) {
			animSelect.push({
				name: this.animations[i].name,
				enabled: false,
				frames: this.animations[i].frames,
				frameTime: this.animations[i].frameTime
			});
		}
		if (null !== this.props.availableAnimations) {
			this.props.availableAnimations(animSelect);
		}
	}

	// finds optional objects name starting with prefix "opt_"
	findOptional() {
		let el = {};
		this.loadedObject.traverse((o) => {
			// skip non optional objects
			if (!o.name.startsWith("opt_")) {
				return;
			}
			// name path is opt_[category]_[item]
			let namePath = o.name.split('_');
			let category = namePath[1];
			if (undefined === el[category]) {
				el[category] = {
					name: category,
					items: []
				}
			}
			//console.log(o.name, o.userData);

			// set title from userData if present
			let oTitle = namePath[1] + ' ' + namePath[2];
			if (o.userData && o.userData.Title && o.userData.Title.length > 0) {
				oTitle = o.userData.Title;
			}

			// set description from userData if present
			let oDescription = '';
			if (o.userData && o.userData.Description && o.userData.Description.length > 0) {
				oDescription = o.userData.Description;
			}

			// add to list for hide/show
			el[category].items.push({
				key: o.name,
				name: oTitle,
				description: oDescription,
				visible: false,
				thumbnail: null
			});
		});
		// sort categories
		let ent = Object.entries(el).sort((a,b) => {
			if (a[0] < b[0]) { return -1; }
			if (a[0] > b[0]) { return 1; }
			return 0;
		});
		// sort items in category
		ent.forEach((e) => {
			e[1].items = e[1].items.sort((a,b) => {
				if (a.name < b.name) { return -1; }
				if (a.name > b.name) { return 1; }
				return 0;
			});
		})
		return ent;
	}

	// makes default selection
	showDefaultOptional(opt) {
		// show all meshes in object except optional
		this.loadedObject.traverse((o) => {
			if (o.isMesh && !o.name.startsWith("opt_")) { o.visible = true; }
		});

		// make default selection
		opt.forEach((o) => {
			// skip preselect when only one optional element in group
			if (1 === o[1].items.length) {
				return;
			}
			// preselect first in group
			o[1].items[0].visible = true;
			this.toggleElement(o[1].items[0]);
		})
	}

	// toggle visible element, check for traversing scene..
	// https://github.com/mrdoob/three.js/blob/dev/examples/jsm/exporters/STLExporter.js
	toggleElement(el) {
		//console.log("Toggle visible", el);
		this.loadedObject.traverse( function(obj) {
			if (obj.name === el.key) {
				obj.visible = el.visible;
			}
		});
	}

	toggleAnimation(name) {
		//console.log("Toggle animation", name);
		for (let i = 0; i < this.animations.length; i++) {
			this.animations[i].action.enabled = this.animations[i].name === name;
		}
		// reset current animation position
		this.animTime = 0;
	}

	setAnimationTime(time) {
		this.animTime = time;
	}

	// point camera and controls to bounding box
	// see: https://discourse.threejs.org/t/camera-zoom-to-fit-object/936/6?page=2
	cameraToBBox(box, camera, controls, fitOffset = 1.2) {
		const size = new THREE.Vector3();
		const center = new THREE.Vector3();
		box.getSize(size);
		box.getCenter(center);

		const maxSize = Math.max(size.x, size.y, size.z);
		const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * camera.fov / 360));
		const fitWidthDistance = fitHeightDistance / camera.aspect;
		const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);

		camera.near = distance / 100;
		camera.far = distance * 100;
		camera.updateProjectionMatrix();

		if (null !== controls) {
			const direction = controls.target.clone()
				.sub(camera.position)
				.normalize()
				.multiplyScalar(distance);
			
			controls.maxDistance = distance * 20;
			controls.target.copy(center);

			camera.position.copy(controls.target).sub(direction);

			controls.update();
		} else {
			//const direction = center.clone()
			//	.sub(camera.position)
			//	.normalize()
			//	.multiplyScalar(distance);
			//camera.position.copy(center).sub(direction);
			//camera.lookAt(center);
			
			const move = new THREE.Vector3(0,0,distance);
			const pos = center.clone()
				.add(move);

			camera.position.set(pos.x, pos.y, pos.z);
			camera.lookAt(center);
		}
	}

	// create thumbnail pictures for each optional element
	createElementThumbs(elGroups, cameraAspect) {
		// setup thumbnail camera
		const cam = new THREE.PerspectiveCamera(75, cameraAspect, 0.1, 100);
		cam.position.set(0, 0.20, 20.0);

		// hide all meshes in object
		this.loadedObject.traverse((o) => {
			if (o.isMesh) { o.visible = false; }
		});

		// hide scene helper objects
		this.scene.traverse((o) => {
			if (o.name.startsWith('hlp_')) { o.visible = false; }
		});

		// save scene background
		const sceneBG = this.scene.background;
		this.scene.background = null;

		//const tmb_render = 'opt_head_01';

		// create thumbnails
		elGroups.forEach((group) => {
			group[1].items.forEach((el) => {
				//if (!el.key.startsWith(tmb_render)) { return; }

				// find object to render
				let objRender = null;
				const bb = new THREE.Box3();
				this.loadedObject.traverse((o) => {
					if (o.name === el.key) { objRender = o; }
				});

				// calc bounding box, NOT WORKING
				//bb.expandByObject(objRender);
				// take copy of mesh bounding box
				bb.copy(objRender.geometry.boundingBox);

				//const box = new THREE.Box3Helper(bb, 0xff0000)
				//box.name = "hlp_bb_" + el.key;
				//this.scene.add( box );
		
				// position camera to thumbnail
				this.cameraToBBox(bb, cam, null, 1.2);

				//const camHelper = new THREE.CameraHelper(cam);
				//this.scene.add( camHelper );

				// render
				objRender.visible = true;		// make it visible
				//this.rendererTmb.clear();
				this.rendererTmb.render(this.scene, cam);
				el.thumbnail = this.rendererTmb.domElement.toDataURL();
				objRender.visible = false;		// hide it again
			});
		});

		// restore scene background
		this.scene.background = sceneBG;
		// restore scene helper objects
		this.scene.traverse((o) => {
			if (o.name.startsWith('hlp_')) { o.visible = true; }
		});
	}
}

View3D.defaultProps = {
	loadPath: null,
	object3D: null,
	animPoses: null,
	showBoundingBox: false,
	showSkeleton: false,
	showGroundPlane: true,
	showLight: false,
	backgroundCube: null,
	availableElements: null,
	availableAnimations: null,
	animSingleStep: true,
	animDisableMove: true,
	thumbnailWidth: 256,
	thumbnailHeight: 256
}

View3D.propTypes = {
	loadPath: PropTypes.string,
	object3D: PropTypes.string,
	animPoses: PropTypes.array,
	showBoundingBox: PropTypes.bool,
	showSkeleton: PropTypes.bool,
	showGroundPlane: PropTypes.bool,
	showLight: PropTypes.bool,
	backgroundCube: PropTypes.array,
	availableElements: PropTypes.func,
	availableAnimations: PropTypes.func,
	animSingleStep: PropTypes.bool,
	animDisableMove: PropTypes.bool,
	thumbnailWidth: PropTypes.number,
	thumbnailHeight: PropTypes.number
}

export default View3D;