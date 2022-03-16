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
		this.onWindowResize = this.onWindowResize.bind(this);
		this.animations = [];

		// Init exporters
		this.exporterSTL = new STLExporter();
		this.exporterOBJ = new OBJExporter();

		// init animation clock
		this.clock = new THREE.Clock();
		this.animMixer = null;

		// Init default scene
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( 0xafafaf );
		//this.scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );

		// ground plane
		if (this.props.showGroundPlane) {
			const gp = new THREE.Mesh(
				new THREE.PlaneGeometry(2, 2),
				new THREE.MeshPhongMaterial( { color: 0x888888, depthWrite: false } ) 
			);
			gp.rotation.x = - Math.PI / 2;
			gp.receiveShadow = true;
			gp.name = "hlp_ground_plane";
			this.scene.add(gp);
		}

		// Ligts from example
		const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
		hemiLight.position.set( 0, 20, 0 );
		this.scene.add( hemiLight );

		//const dirLight = new THREE.DirectionalLight( 0xffffff );
		//dirLight.position.set( - 3, 10, - 10 );
		//dirLight.castShadow = true;
		//dirLight.shadow.camera.top = 2;
		//dirLight.shadow.camera.bottom = - 2;
		//dirLight.shadow.camera.left = - 2;
		//dirLight.shadow.camera.right = 2;
		//dirLight.shadow.camera.near = 0.1;
		//dirLight.shadow.camera.far = 40;
		//this.scene.add( dirLight );
		
		this.dirLight1 = new THREE.DirectionalLight( 0xffffff );
		this.dirLight1.position.set( 2, 2, 2 );
		this.scene.add( this.dirLight1 );

		this.dirLight2 = new THREE.DirectionalLight( 0xffffff );
		this.dirLight2.position.set( -2, -2, -2 );
		this.scene.add( this.dirLight2 );

		//this.ambientLight = new THREE.AmbientLight( 0x222222 );
		//this.scene.add( this.ambientLight );

		// glTF decompressor, with path for decompression lib loading
		const dracoLoader = new DRACOLoader()
		dracoLoader.setDecoderPath(props.loadPath + '/libs/draco/')
		//dracoLoader.setDecoderConfig({type: 'js'});	// (Optional) Override detection of WASM support.
		// init object loader with decompressor
		this.loader = new GLTFLoader();
		this.loader.setDRACOLoader(dracoLoader)
	}

	// just empty div to add renderer
	render() {
		// this is to make container below toolbar
		// theme access is possible through function generating sx
		return (
			<Box
				ref={this.refRenderer} 
				sx={{
					paddingTop: (theme) => theme.mixins.toolbar.minHeight + 'px'
				}} 
			/>
		);
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
		const rsize = this.rendererDimensions();

		// setup camera
		this.camera = new THREE.PerspectiveCamera( 75, rsize.width / rsize.height, 0.1, 100 );
		this.camera.position.y = 0.20;
		this.camera.position.z = 0.10;

		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		//this.renderer.setPixelRatio( window.devicePixelRatio );	// doubles pixels?!?
		this.renderer.setSize(rsize.width, rsize.height);
		//this.renderer.shadowMap.enabled = true;
		// use ref as a mount point of the Three.js scene instead of the document.body
		this.refRenderer.current.appendChild( this.renderer.domElement );
		// Add handler for resizing
		window.addEventListener( 'resize', this.onWindowResize );

		// controls
		this.controls = new OrbitControls( this.camera, this.renderer.domElement );
		this.controls.listenToKeyEvents( window ); // optional
		this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
		this.controls.dampingFactor = 0.05;
		this.controls.screenSpacePanning = false;
		this.controls.minDistance = 0.22;
		this.controls.maxDistance = 2;
		this.controls.maxPolarAngle = Math.PI / 2;
		this.controls.target = new THREE.Vector3(0, 0.15, 0);
		this.controls.update();

		// start animation
		this.animate();

		// can we load
		if (null === this.props.loadPath) {
			return;
		}
		// kickstart loading
		if (this.props.backgroundCube.length > 0) {
			this.scene.background = this.loadBackgroundCube(this.props.backgroundCube);
		}

		//const reflectionCube = this.loadBackgroundCube(this.props.backgroundCube);
		//this.cubeMaterial1 = new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: reflectionCube } );

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
		//console.log(d);
		return d;
	}

	// TODO: fix resizing 
	onWindowResize() {
		const rsize = this.rendererDimensions();
		this.camera.aspect = rsize.width / rsize.height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( rsize.width, rsize.height );
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
			// Get the time elapsed since the last frame, used for mixer update (if not in single step mode)
			let mixerUpdateDelta = this.clock.getDelta();
			// Update the animation mixer, the stats panel, and render this frame
			this.animMixer.update( mixerUpdateDelta / 2 );
		}
		
		this.renderer.render( this.scene, this.camera );
	};

	// called when object is loaded
	loaderOk(glTF) {
		console.log("Object loaded");
		//console.log(glTF);
		this.loadedObject = glTF.scene;

		// find optional elements
		let grpOpt = this.findOptional();
		// preselect optional elements
		this.defaultOptional(grpOpt);

		const omat = new THREE.MeshPhongMaterial( { color: 0x226622, flatShading: true } )
		// enable shadow and set material, must have directional light, calc bounding box
		let bb = new THREE.Box3();
		this.loadedObject.traverse( function(object) {
			if ( !object.isMesh ) { return; }
			//object.castShadow = true;
			object.material = omat;
			// calc bounding box
			bb.expandByObject(object);
		});

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

		// set scene for display
		this.scene.add(this.loadedObject);

		// create mixer for animations
		this.animMixer = new THREE.AnimationMixer(this.loadedObject);
		
		// Call changed list of models
		if (null !== this.props.availableElements) {
			this.props.availableElements(grpOpt);
		}

		// clear all previous animations
		this.animations = [];
		// call animation loading
		for (let i = 0; i < this.props.animPoses.length; i++) {
			//console.log("Loading anim", this.props.animPoses[i]);
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
		// init action
		const anim = glTF.animations[0];
		const act = this.animMixer.clipAction(anim);
		act.enabled = false;
		act.play();
		// add animation to list
		this.animations.push({
			name: anim.name,
			action: act
		});
		// check all loaded to push list
		if (this.props.animPoses.length !== this.animations.length) {
			return;
		}
		// crate anim selection
		let animSelect = [];
		animSelect.push({ name: 'None', enabled: true });
		for (let i = 0; i < this.animations.length; i++) {
			animSelect.push({ name: this.animations[i].name, enabled: false });
		}
		if (null !== this.props.availableAnimations) {
			this.props.availableAnimations(animSelect);
		}
	}

	// finds optional objects, and hide them 
	// only hides objects starting with name prefix "opt_"
	findOptional() {
		let elOpt=[];
		this.loadedObject.traverse( function(obj) {
			// skip non optional objects
			if (!obj.name.startsWith("opt_")) {
				return;
			}
			// hide optional objects
			obj.visible = false;
			// add to list for hide/show
			elOpt.push({
				name: obj.name,
				visible: false
			});
		});

		return this.groupOptional(elOpt);
	}

	// Groups all optional elements for selection UI
	groupOptional(elOpt) {
		let grpOpt = [];
		if (0 === elOpt.length) {
			return grpOpt;
		}
		// sort before grouping
		elOpt.sort((a,b) => {
			if (a.name < b.name) { return -1; }
			if (a.name > b.name) { return 1; }
			return 0;
		});

		let grp = [];
		let elCur = elOpt[0];
		let elPrev = elCur;
		grp.push(elCur);

		for (let i = 1; i < elOpt.length; i++) {
			elCur = elOpt[i];

			// split names to get category info
			// 2nd is category if matches it is same category
			let prevNameParts = elPrev.name.split('_');
			let curNameParts = elCur.name.split('_');

			// check for different category
			if (prevNameParts[1] !== curNameParts[1]) {
				grpOpt.push(grp);
				grp = [];
			}

			grp.push(elCur);
			elPrev = elCur;
		}

		grpOpt.push(grp);
		return grpOpt;
	}

	// makes default selection
	defaultOptional(grpOpt) {
		for (let i = 0; i < grpOpt.length; i++) {
			// skip preselect when only one optional element in group
			if (1 === grpOpt[i].length) {
				continue;
			}
			// preselect first in group
			grpOpt[i][0].visible = true;
			this.toggleElement(grpOpt[i][0]);
		}
	}

	// toggle visible element, check for traversing scene..
	// https://github.com/mrdoob/three.js/blob/dev/examples/jsm/exporters/STLExporter.js
	toggleElement(el) {
		console.log("Toggle visible", el);
		this.loadedObject.traverse( function(obj) {
			if (obj.name === el.name) {
				obj.visible = el.visible;
			}
		});
	}

	toggleAnimation(name) {
		console.log("Toggle animation", name);
		for (let i = 0; i < this.animations.length; i++) {
			this.animations[i].action.enabled = this.animations[i].name === name;
		}
	}

	// point camera and controls to bounding box
	cameraToBBox(box, camera, controls, fitOffset = 1.2) {
		const size = new THREE.Vector3();
		const center = new THREE.Vector3();
		box.getSize(size);
		box.getCenter(center );

		const maxSize = Math.max(size.x, size.y, size.z);
		const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * camera.fov / 360));
		const fitWidthDistance = fitHeightDistance / camera.aspect;
		const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);

		const direction = controls.target.clone()
			.sub(camera.position)
			.normalize()
			.multiplyScalar(distance);

		controls.maxDistance = distance * 10;
		controls.target.copy(center);

		camera.near = distance / 100;
		camera.far = distance * 100;
		camera.updateProjectionMatrix();

		camera.position.copy(controls.target).sub(direction);

		controls.update();
	}
}

View3D.defaultProps = {
	loadPath: null,
	object3D: null,
	animPoses: null,
	showBoundingBox: false,
	showSkeleton: false,
	showGroundPlane: true,
	backgroundCube: null,
	availableElements: null,
	availableAnimations: null
}

View3D.propTypes = {
	loadPath: PropTypes.string,
	object3D: PropTypes.string,
	animPoses: PropTypes.array,
	showBoundingBox: PropTypes.bool,
	showSkeleton: PropTypes.bool,
	showGroundPlane: PropTypes.bool,
	backgroundCube: PropTypes.array,
	availableElements: PropTypes.func,
	availableAnimations: PropTypes.func
}

export default View3D;