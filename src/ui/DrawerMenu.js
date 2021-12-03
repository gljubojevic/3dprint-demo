import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Save from '@mui/icons-material/Save';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';


class DrawerMenu extends Component {
	constructor(props) {
		super(props);
		this.toggleDrawer = this.toggleDrawer.bind(this);
		this.toggleElement = this.toggleElement.bind(this);
		this.save = this.save.bind(this);
		this.state = {
			isOpen: false
		}
	}

	toggleDrawer(e) {
		if (e.type === 'keydown' && (e.key === 'Tab' || e.key === 'Shift')) {
			return;
		}
		this.setState({ isOpen: !this.state.isOpen });
	}

	save() {
		if (null === this.props.save) {
			console.error("No save handler set");
			return;
		}
		this.setState({ isOpen:false });
		this.props.save();
	}

	toggleElement(e) {
		this.props.toggleElement({
			name: e.target.name,
			visible: e.target.checked 
		});
	}

	renderSwitches() {
		return this.props.availableElements.map((el, index) => {
			return (
				<FormControlLabel key={index} label={el.name}
					control={<Switch checked={el.visible} onChange={this.toggleElement} name={el.name} />}
				/>
			);
		});
	}

	render() {
		return (
			<Drawer anchor="left" open={this.state.isOpen} onClose={this.toggleDrawer}>
				<Box p={1}>
					<Typography variant="h4" component="h4">Main menu</Typography>
					<Divider />
					<List component="nav" aria-label="main selector">
						<ListItem>
							<ListItemButton onClick={this.save}>
								<ListItemIcon><Save /></ListItemIcon>
								<ListItemText primary="Save for print" />
							</ListItemButton>
						</ListItem>
					</List>
					<Divider />
					<FormControl component="fieldset" variant="standard">
					<FormLabel component="legend">Elements on/off</FormLabel>
						<FormGroup>
							{this.renderSwitches()}
						</FormGroup>
					</FormControl>
				</Box>
			</Drawer>
		);
	}
}

DrawerMenu.defaultProps = {
	save: null,
	availableElements: [],
	toggleElement: null
}

DrawerMenu.propTypes = {
	save: PropTypes.func,
	availableElements: PropTypes.array,
	toggleElement: PropTypes.func
}

export default DrawerMenu;