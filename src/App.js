import React, { Component } from 'react';
import AppTools from './ui/AppTools';
import DrawerMenu from './ui/DrawerMenu';
import View3D from './editor/View3D';
import { saveAs } from 'file-saver';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			elements: [],
		}
		this.refDrawerMenu = React.createRef();
		this.refView3D = React.createRef();
		this.toggleDrawer = this.toggleDrawer.bind(this);
		this.save = this.save.bind(this);
		this.availableElements = this.availableElements.bind(this);
		this.toggleElement = this.toggleElement.bind(this);
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

	// Get list of elements to hide and show
	availableElements(elements) {
		console.log(elements);
		this.setState({elements:elements});
	}

	toggleElement(el) {
		let newElements = this.state.elements.map((e)=>{
			if (e.name === el.name) {
				e.visible = el.visible;
			}
			return e;
		});
		this.setState({elements:newElements});
		this.refView3D.current.toggleElement(el);
	}

	render() {
		return (
			<React.Fragment>
				<AppTools toggleDrawer={this.toggleDrawer} />
				<DrawerMenu ref={this.refDrawerMenu} save={this.save} availableElements={this.state.elements} toggleElement={this.toggleElement} />
				<View3D ref={this.refView3D} object3D={process.env.PUBLIC_URL + "/objects/solider-demo.glb"} availableElements={this.availableElements} />
			</React.Fragment>
		);
	}
}

export default App;
