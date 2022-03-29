import React, { Component } from 'react';
import AppTools from './ui/AppTools';
import DrawerMenu from './ui/DrawerMenu';
import MainSelector from './ui/MainSelector';
import CategorySelector from './ui/CategorySelector';
import Paper from '@mui/material/Paper';
import View3D from './editor/View3D';
import Typography from '@mui/material/Typography';
import { saveAs } from 'file-saver';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			elementCategory: '',
			elementGroups: [],
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
		this.setAnimationTime = this.setAnimationTime.bind(this);
		this.selectElementCategory = this.selectElementCategory.bind(this);
		this.loadDragNDrop = this.loadDragNDrop.bind(this);
		this.loadDragOver = this.loadDragOver.bind(this);
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

	// Prevent default behavior (Prevent file from being opened)
	loadDragOver(e) {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';
		//console.log('File(s) in drop zone');
	}

	loadDragNDrop(e) {
		e.preventDefault();
		console.log("Drag & Drop files");
		if (e.dataTransfer.types[0] === 'text/plain') return; // Outliner drop
		if ( e.dataTransfer.items ) {
			// Use DataTransferItemList interface to access the file(s)
			for (let i = 0; i < e.dataTransfer.items.length; i++) {
				// If dropped items aren't files, reject them
				if (e.dataTransfer.items[i].kind === 'file') {
					let file = e.dataTransfer.items[i].getAsFile();
					//console.log('DataTransferItemList file[' + i + '].name = ' + file.name, file);
					this.refView3D.current.loadObjectDirect(file);
					// loading only one file
					break;
				}
			}
		} else {
			// TODO: Use DataTransfer interface to access the file(s)
			for (let i = 0; i < e.dataTransfer.files.length; i++) {
				console.log('DataTransfer file[' + i + '].name = ' + e.dataTransfer.files[i].name);
				//editor.loader.loadFiles( e.dataTransfer.files );
				//this.refView3D.current.loadObject(e.dataTransfer.files[i]);
			}
		}
	}

	// Set list of grouped elements to hide and show
	availableElements(groups) {
		this.setState({elementGroups:groups});
	}

	selectElementCategory(category) {
		this.setState({elementCategory:category});
	}

	toggleElement(el) {
		const namePath = el.key.split('_');
		let newGroups = this.state.elementGroups.map((groupDef)=> {
			// Not same group skip check
			if (namePath[1] !== groupDef[0]) {
				return groupDef
			}
			const group = groupDef[1];
			const isRadio = group.items.length > 1;
			group.items = group.items.map((e) => {
				// change state of element
				if (e.key === el.key) {
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
			return groupDef;
		});
		this.setState({elementGroups:newGroups});
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

	setAnimationTime(time) {
		this.refView3D.current.setAnimationTime(time);
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
					object3D="/objects/rhodesia-solider-01.glb"
					backgroundCube={bgCube}
					animPoses={animPoses}
					availableElements={this.availableElements}
					availableAnimations={this.availableAnimations}
					thumbnailWidth={128}
					thumbnailHeight={128} />
				<MainSelector 
					elementGroups={this.state.elementGroups}
					toggleElement={this.toggleElement}
					optAnimations={this.state.animations}
					toggleAnimation={this.toggleAnimation}
					setAnimationTime={this.setAnimationTime}
					elementCategory={this.state.elementCategory}
					selectElementCategory={this.selectElementCategory} />
				<CategorySelector
					elementCategory={this.state.elementCategory}
					elementGroups={this.state.elementGroups}
					toggleElement={this.toggleElement} />
				<Paper onDrop={this.loadDragNDrop} onDragOver={this.loadDragOver} sx={{
					m: 1, p: 1,
					bottom: 0, right: 0,
					width: 1/5,
					textAlign: 'center',
					zIndex: 'appBar', 
					position: 'absolute' }}>
						<Typography variant="h6" component="p">
						Drag & Drop<br/>test object here
						</Typography>
				</Paper>
			</React.Fragment>
		);
	}
}

export default App;
