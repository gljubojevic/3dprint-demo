import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

class AppTools extends Component {

	render() {
		return (
			<AppBar position="fixed">
				<Toolbar variant="regular">
					<IconButton edge="start" color="inherit" aria-label="menu" onClick={this.props.toggleDrawer}>
						<MenuIcon />
					</IconButton>
					<Typography variant="h6" color="inherit">3D Print demo</Typography>
				</Toolbar>
			</AppBar>
		);
	}
}

AppTools.defaultProps = {
	toggleDrawer: null
}

AppTools.propTypes = {
	toggleDrawer: PropTypes.func
}

export default AppTools;