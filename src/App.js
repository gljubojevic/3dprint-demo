import React, { Component } from 'react';
import AppTools from './ui/AppTools';
import DrawerMenu from './ui/DrawerMenu';
import MainSelector from './ui/MainSelector';
import View3D from './editor/View3D';
import { saveAs } from 'file-saver';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			elements: [],
			animations: []
		}
		this.refDrawerMenu = React.createRef();
		this.refView3D = React.createRef();
		this.toggleDrawer = this.toggleDrawer.bind(this);
		this.save = this.save.bind(this);
		this.availableElements = this.availableElements.bind(this);
		this.toggleElement = this.toggleElement.bind(this);
		this.availableAnimations = this.availableAnimations.bind(this);
		this.toggleAnimation = this.toggleAnimation.bind(this);
	}

	toggleDrawer(e) {
		this.refDrawerMenu.current.toggleDrawer(e);
	}

	save(fileFormat) {
		// get data from scene
		let data = this.refView3D.current.save(fileFormat);
		//console.log("Data for save ->", data);
		switch (fileFormat) {
			case "STL":
				let blobSTL = new Blob( [data], { type : 'application/octet-stream' } ); 
				saveAs(blobSTL, "for-print.stl");
				break;
			case "OBJ":
				let blobOBJ = new Blob( [ data ], { type: 'text/plain' } );
				saveAs(blobOBJ, "for-print.obj");
				break;
			default:
				console.log("Unsupported file format ->",fileFormat);
				break;
		}
	}

	// Set list of elements to hide and show
	availableElements(elements) {
		this.setState({elements:elements});
	}

	toggleElement(el) {
		const elNamePath = el.name.split('_');
		let newGroups = this.state.elements.map((group)=> {
			// check if same group on first element
			const groupElNamePath = group[0].name.split('_');
			// Not same group skip check
			if (elNamePath[1] !== groupElNamePath[1]) {
				return group
			}

			const isRadio = group.length > 1;
			return group.map((e) => {
				// change state of element
				if (e.name === el.name) {
					e.visible = el.visible;
					this.refView3D.current.toggleElement(e);
				} else {
					// when is radio selection toggle invert previous selection
					if (isRadio) {
						e.visible = !el.visible;
						this.refView3D.current.toggleElement(e);
					}
				}
				return e;
			});
		});
		this.setState({elements:newGroups});
	}

	// Set list of animations for selection
	availableAnimations(animations) {
		this.setState({animations:animations});
	}
	
	toggleAnimation(name) {
		let anims = this.state.animations.map((a) => {
			a.enabled = a.name === name;
			return a;
		})
		this.refView3D.current.toggleAnimation(name);
		this.setState({animations:anims});
	}

	render() {
		// Cubemaps
		const bgCube=[];
		//const bgCube=[
		//	'/textures/Brudslojan/posx.jpg',
		//	'/textures/Brudslojan/negx.jpg',
		//	'/textures/Brudslojan/posy.jpg',
		//	'/textures/Brudslojan/negy.jpg',
		//	'/textures/Brudslojan/posz.jpg',
		//	'/textures/Brudslojan/negz.jpg'
		//];

		const animPoses=[
			'/anims/fire_rifle.gltf',
			'/anims/hit_reaction.gltf',
			'/anims/reloading.gltf',
			'/anims/rifle_aiming.gltf',
			'/anims/rifle_jump.gltf',
			'/anims/rifle_run.gltf',
			'/anims/run_backwards.gltf',
			'/anims/starfe_left.gltf',
			'/anims/starfe_right.gltf',
			'/anims/toss_grenade.gltf',
			'/anims/turn_left.gltf',
			'/anims/turn_right.gltf',
			'/anims/walking_backwards.gltf',
			'/anims/walking.gltf'
		];

		return (
			<React.Fragment>
				<AppTools toggleDrawer={this.toggleDrawer} />
				<DrawerMenu ref={this.refDrawerMenu} save={this.save} />
				<View3D ref={this.refView3D} loadPath={process.env.PUBLIC_URL} 
					object3D="/objects/rhodesia-solider.glb"
					backgroundCube={bgCube}
					animPoses={animPoses}
					availableElements={this.availableElements}
					availableAnimations={this.availableAnimations} />
				<MainSelector optElements={this.state.elements} toggleElement={this.toggleElement} optAnimations={this.state.animations} toggleAnimation={this.toggleAnimation} />
			</React.Fragment>
		);
	}
}

export default App;
