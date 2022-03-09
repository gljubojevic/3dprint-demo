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

class DrawerMenu extends Component {
	constructor(props) {
		super(props);
		this.toggleDrawer = this.toggleDrawer.bind(this);
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

	save(e) {
		if (null === this.props.save) {
			console.error("No save handler set");
			return;
		}
		// read from "data-value" attribute
		let fileFormat = e.currentTarget.dataset.value;
		if (!fileFormat) {
			fileFormat = "STL" // default to STL format
		}
		this.setState({ isOpen:false });
		this.props.save(fileFormat);
	}

	render() {
		return (
			<Drawer anchor="left" open={this.state.isOpen} onClose={this.toggleDrawer}>
				<Box p={1}>
					<Typography variant="h4" component="h4">Main menu</Typography>
					<Divider />
					<List component="nav" aria-label="main selector">
						<ListItem>
							<ListItemButton onClick={this.save} data-value="STL">
								<ListItemIcon><Save /></ListItemIcon>
								<ListItemText primary="Save STL for print" />
							</ListItemButton>
						</ListItem>
						<ListItem>
							<ListItemButton onClick={this.save} data-value="OBJ">
								<ListItemIcon><Save /></ListItemIcon>
								<ListItemText primary="Save OBJ for print" />
							</ListItemButton>
						</ListItem>
					</List>
				</Box>
			</Drawer>
		);
	}
}

DrawerMenu.defaultProps = {
	save: null
}

DrawerMenu.propTypes = {
	save: PropTypes.func
}

export default DrawerMenu;