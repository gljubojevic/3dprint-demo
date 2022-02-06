import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as THREE from "three";
import Box from '@mui/material/Box';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
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
		this.loaderError = this.loaderError.bind(this);
		this.loaderProgress = this.loaderProgress.bind(this);
		this.toggleElement = this.toggleElement.bind(this);
		this.onWindowResize = this.onWindowResize.bind(this);

		// Init exporters
		this.exporterSTL = new STLExporter();
		this.exporterOBJ = new OBJExporter();

		// Init default scene
		this.scene = new THREE.Scene();

		// Add light
		this.dirLight1 = new THREE.DirectionalLight( 0xffffff );
		this.dirLight1.position.set( 1, 1, 1 );
		this.scene.add( this.dirLight1 );

		this.dirLight2 = new THREE.DirectionalLight( 0xffffff );
		this.dirLight2.position.set( -1, -1, -1 );
		this.scene.add( this.dirLight2 );

		this.ambientLight = new THREE.AmbientLight( 0x222222 );
		this.scene.add( this.ambientLight );

		// init object loader
		this.loader = new GLTFLoader();
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
		});
		// finally remove invisible
		remove.forEach(id => {
			let o = forSave.getObjectById(id);
			o.parent.remove(o);
		});
		// return cleaned
		switch (fileFormat) {
			case "STL":
				return this.exporterSTL.parse(forSave, {binary:true});
			case "OBJ":
				return this.exporterOBJ.parse(forSave)
			default:
				break;
		}
		return this.exporterSTL.parse(forSave, {binary:true});
	}

	// init three.js renderer
	componentDidMount() {
		// renderer element
		const rsize = this.rendererDimensions();

		// setup camera
		this.camera = new THREE.PerspectiveCamera( 75, rsize.width / rsize.height, 0.1, 100 );
		this.camera.position.y = 0.20;
		this.camera.position.z = 0.10;

		this.renderer = new THREE.WebGLRenderer();
		//this.renderer.setPixelRatio( window.devicePixelRatio );	// doubles pixels?!?
		this.renderer.setSize(rsize.width, rsize.height);
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
		this.scene.background = this.loadBackgroundCube(this.props.backgroundCube);
		const reflectionCube = this.loadBackgroundCube(this.props.backgroundCube);

		this.cubeMaterial1 = new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: reflectionCube } );
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
		this.renderer.render( this.scene, this.camera );
	};

	// called when object is loaded
	loaderOk(gltf) {
		console.log("Object loaded");
		// find optional elements
		let el = [];
		for (let i = 0; i < gltf.scene.children.length; i++) {
			let obj = gltf.scene.children[i];
			//console.log(obj);
			//console.log(obj.name);

			// main object marked with "-main" in name is not added to optional list
			if (obj.name.includes("-main")) {
				// cube reflection material for main model
				//obj.material = this.cubeMaterial1;
				continue;
			}
			// make non main element invisible
			obj.visible = false;
			// add to list for hide/show
			el.push({
				name: obj.name,
				visible: false
			});
		}
		this.loadedObject = gltf.scene;
		this.scene.add(this.loadedObject);

		// Call changed list of models
		if (null !== this.props.availableElements) {
			this.props.availableElements(el);
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

	// toggle visible element
	// check for traversing scene..
	// https://github.com/mrdoob/three.js/blob/dev/examples/jsm/exporters/STLExporter.js
	toggleElement(el) {
		console.log("Toggle visible", el);
		let sc = this.loadedObject;
		for (let i = 0; i < sc.children.length; i++) {
			if (sc.children[i].name === el.name) {
				sc.children[i].visible = el.visible;
			}
		}
	}
}

View3D.defaultProps = {
	loadPath: null,
	object3D: null,
	backgroundCube: null,
	availableElements: null
}

View3D.propTypes = {
	loadPath: PropTypes.string,
	object3D: PropTypes.string,
	backgroundCube: PropTypes.array,
	availableElements: PropTypes.func
}

export default View3D;