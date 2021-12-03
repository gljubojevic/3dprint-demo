(this["webpackJsonp3dprint-demo"]=this["webpackJsonp3dprint-demo"]||[]).push([[0],{108:function(e,t,n){},118:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),i=n(38),s=n.n(i),o=(n(108),n(168)),l=n(165),c=n(94),d=Object(c.a)({}),h=n(1),b=n(2),u=n(20),j=n(4),g=n(5),v=n(169),m=n(170),p=n(172),O=n(171),f=n(88),w=n.n(f),x=n(6),k=function(e){Object(j.a)(n,e);var t=Object(g.a)(n);function n(){return Object(h.a)(this,n),t.apply(this,arguments)}return Object(b.a)(n,[{key:"render",value:function(){return Object(x.jsx)(v.a,{position:"fixed",children:Object(x.jsxs)(m.a,{variant:"regular",children:[Object(x.jsx)(O.a,{edge:"start",color:"inherit","aria-label":"menu",onClick:this.props.toggleDrawer,children:Object(x.jsx)(w.a,{})}),Object(x.jsx)(p.a,{variant:"h6",color:"inherit",children:"3D Print demo"})]})})}}]),n}(a.Component);k.defaultProps={toggleDrawer:null};var y=k,E=n(175),D=n(161),S=n(174),L=n(176),P=n(164),T=n(159),C=n(177),B=n(178),J=n(77),M=n.n(J),F=n(167),R=n(166),W=n(179),z=n(173),A=n(163),H=function(e){Object(j.a)(n,e);var t=Object(g.a)(n);function n(e){var a;return Object(h.a)(this,n),(a=t.call(this,e)).toggleDrawer=a.toggleDrawer.bind(Object(u.a)(a)),a.toggleElement=a.toggleElement.bind(Object(u.a)(a)),a.save=a.save.bind(Object(u.a)(a)),a.state={isOpen:!1},a}return Object(b.a)(n,[{key:"toggleDrawer",value:function(e){("keydown"!==e.type||"Tab"!==e.key&&"Shift"!==e.key)&&this.setState({isOpen:!this.state.isOpen})}},{key:"save",value:function(e){if(null!==this.props.save){var t=e.currentTarget.dataset.value;t||(t="STL"),this.setState({isOpen:!1}),this.props.save(t)}else console.error("No save handler set")}},{key:"toggleElement",value:function(e){this.props.toggleElement({name:e.target.name,visible:e.target.checked})}},{key:"renderSwitches",value:function(){var e=this;return this.props.availableElements.map((function(t,n){return Object(x.jsx)(z.a,{label:t.name,control:Object(x.jsx)(A.a,{checked:t.visible,onChange:e.toggleElement,name:t.name})},n)}))}},{key:"render",value:function(){return Object(x.jsx)(D.a,{anchor:"left",open:this.state.isOpen,onClose:this.toggleDrawer,children:Object(x.jsxs)(S.a,{p:1,children:[Object(x.jsx)(p.a,{variant:"h4",component:"h4",children:"Main menu"}),Object(x.jsx)(E.a,{}),Object(x.jsxs)(L.a,{component:"nav","aria-label":"main selector",children:[Object(x.jsx)(P.a,{children:Object(x.jsxs)(T.a,{onClick:this.save,"data-value":"STL",children:[Object(x.jsx)(C.a,{children:Object(x.jsx)(M.a,{})}),Object(x.jsx)(B.a,{primary:"Save STL for print"})]})}),Object(x.jsx)(P.a,{children:Object(x.jsxs)(T.a,{onClick:this.save,"data-value":"OBJ",children:[Object(x.jsx)(C.a,{children:Object(x.jsx)(M.a,{})}),Object(x.jsx)(B.a,{primary:"Save OBJ for print"})]})})]}),Object(x.jsx)(E.a,{}),Object(x.jsxs)(R.a,{component:"fieldset",variant:"standard",children:[Object(x.jsx)(F.a,{component:"legend",children:"Elements on/off"}),Object(x.jsx)(W.a,{children:this.renderSwitches()})]})]})})}}]),n}(a.Component);H.defaultProps={save:null,availableElements:[],toggleElement:null};var I=H,V=n(3),q=n(90),K=n(91),N=n(92),U=n(93),G=function(e){Object(j.a)(n,e);var t=Object(g.a)(n);function n(e){var a;return Object(h.a)(this,n),(a=t.call(this,e)).refRenderer=r.a.createRef(),a.save=a.save.bind(Object(u.a)(a)),a.animate=a.animate.bind(Object(u.a)(a)),a.loaderOk=a.loaderOk.bind(Object(u.a)(a)),a.loaderError=a.loaderError.bind(Object(u.a)(a)),a.loaderProgress=a.loaderProgress.bind(Object(u.a)(a)),a.toggleElement=a.toggleElement.bind(Object(u.a)(a)),a.exporterSTL=new N.a,a.exporterOBJ=new U.a,a.scene=new V.cb,a.dirLight1=new V.i(16777215),a.dirLight1.position.set(1,1,1),a.scene.add(a.dirLight1),a.dirLight2=new V.i(16777215),a.dirLight2.position.set(-1,-1,-1),a.scene.add(a.dirLight2),a.ambientLight=new V.a(2236962),a.scene.add(a.ambientLight),a.loader=new q.a,a}return Object(b.a)(n,[{key:"render",value:function(){return Object(x.jsx)("div",{ref:this.refRenderer})}},{key:"save",value:function(e){console.log("Saving object");var t=this.scene.clone(),n=[];switch(t.traverse((function(e){e.visible||(console.log("To remove",e.name,e.id,e.uuid),n.push(e.id))})),n.forEach((function(e){var n=t.getObjectById(e);n.parent.remove(n)})),e){case"STL":return this.exporterSTL.parse(t,{binary:!0});case"OBJ":return this.exporterOBJ.parse(t)}return this.exporterSTL.parse(t,{binary:!0})}},{key:"componentDidMount",value:function(){this.camera=new V.T(75,window.innerWidth/window.innerHeight,.1,100),this.camera.position.y=.2,this.camera.position.z=.1,this.renderer=new V.rb,this.renderer.setSize(window.innerWidth,window.innerHeight),this.refRenderer.current.appendChild(this.renderer.domElement),this.controls=new K.a(this.camera,this.renderer.domElement),this.controls.listenToKeyEvents(window),this.controls.enableDamping=!0,this.controls.dampingFactor=.05,this.controls.screenSpacePanning=!1,this.controls.minDistance=.22,this.controls.maxDistance=2,this.controls.maxPolarAngle=Math.PI/2,this.controls.target=new V.pb(0,.15,0),this.controls.update(),this.animate(),this.loadObject(this.props.object3D)}},{key:"loadObject",value:function(e){null!==e&&null!==this.props.loadPath&&this.loader.load(this.props.loadPath+e,this.loaderOk,void 0,this.loaderError)}},{key:"animate",value:function(){requestAnimationFrame(this.animate),this.renderer.render(this.scene,this.camera)}},{key:"onWindowResize",value:function(){this.camera.aspect=window.innerWidth/window.innerHeight,this.camera.updateProjectionMatrix(),this.renderer.setSize(window.innerWidth,window.innerHeight)}},{key:"loaderOk",value:function(e){console.log("Object loaded");for(var t=[],n=0;n<e.scene.children.length;n++){var a=e.scene.children[n];a.name.includes("-main")||(a.visible=!1,t.push({name:a.name,visible:!1}))}this.loadedObject=e.scene,this.scene.add(this.loadedObject),null!==this.props.availableElements&&this.props.availableElements(t)}},{key:"loaderProgress",value:function(e){console.log(e.loaded/e.total*100+"% loaded")}},{key:"loaderError",value:function(e){console.error(e)}},{key:"toggleElement",value:function(e){console.log("Toggle visible",e);for(var t=this.loadedObject,n=0;n<t.children.length;n++)t.children[n].name===e.name&&(t.children[n].visible=e.visible)}}]),n}(a.Component);G.defaultProps={loadPath:null,object3D:null,backgroundCube:null,availableElements:null};var Q=G,X=n(78),Y=function(e){Object(j.a)(n,e);var t=Object(g.a)(n);function n(e){var a;return Object(h.a)(this,n),(a=t.call(this,e)).state={elements:[]},a.refDrawerMenu=r.a.createRef(),a.refView3D=r.a.createRef(),a.toggleDrawer=a.toggleDrawer.bind(Object(u.a)(a)),a.save=a.save.bind(Object(u.a)(a)),a.availableElements=a.availableElements.bind(Object(u.a)(a)),a.toggleElement=a.toggleElement.bind(Object(u.a)(a)),a}return Object(b.a)(n,[{key:"toggleDrawer",value:function(e){this.refDrawerMenu.current.toggleDrawer(e)}},{key:"save",value:function(e){var t=this.refView3D.current.save(e);switch(e){case"STL":var n=new Blob([t],{type:"application/octet-stream"});Object(X.saveAs)(n,"for-print.stl");break;case"OBJ":var a=new Blob([t],{type:"text/plain"});Object(X.saveAs)(a,"for-print.obj");break;default:console.log("Unsupported file format ->",e)}}},{key:"availableElements",value:function(e){console.log(e),this.setState({elements:e})}},{key:"toggleElement",value:function(e){var t=this.state.elements.map((function(t){return t.name===e.name&&(t.visible=e.visible),t}));this.setState({elements:t}),this.refView3D.current.toggleElement(e)}},{key:"render",value:function(){return Object(x.jsxs)(r.a.Fragment,{children:[Object(x.jsx)(y,{toggleDrawer:this.toggleDrawer}),Object(x.jsx)(I,{ref:this.refDrawerMenu,save:this.save,availableElements:this.state.elements,toggleElement:this.toggleElement}),Object(x.jsx)(Q,{ref:this.refView3D,loadPath:"/3dprint-demo",object3D:"/objects/solider-demo.glb",availableElements:this.availableElements})]})}}]),n}(a.Component),Z=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,181)).then((function(t){var n=t.getCLS,a=t.getFID,r=t.getFCP,i=t.getLCP,s=t.getTTFB;n(e),a(e),r(e),i(e),s(e)}))};s.a.render(Object(x.jsx)(r.a.StrictMode,{children:Object(x.jsxs)(l.a,{theme:d,children:[Object(x.jsx)(o.a,{enableColorScheme:!0}),Object(x.jsx)(Y,{})]})}),document.getElementById("root")),Z()}},[[118,1,2]]]);
//# sourceMappingURL=main.74d2964f.chunk.js.map