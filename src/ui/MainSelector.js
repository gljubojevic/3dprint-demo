import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import EditIcon from '@mui/icons-material/Edit';
import OptSelector from './OptSelector';
import AnimSelector from './AnimSelector';

class MainSelector extends Component {
	constructor(props) {
		super(props);
		this.menuSelected = this.menuSelected.bind(this);
		this.state = {
			selectedOption: ""
		}
	}

	menuSelected(e) {
		// read from "data-value" attribute
		const menu = e.currentTarget.dataset.value;
		this.setState({ selectedOption:menu });
	}

	renderOptionsSelector() {
		if (this.state.selectedOption !== "configure") {
			return null;
		}
		return (
			<OptSelector elementGroups={this.props.elementGroups} toggleElement={this.props.toggleElement} />
		);
	}

	renderAnimSelector() {
		if (this.state.selectedOption !== "pose") {
			return null;
		}
		return (
			<AnimSelector animPoses={this.props.optAnimations} toggleAnim={this.props.toggleAnimation} setAnimTime={this.props.setAnimationTime} />
		);
	}

	renderDone(showDone) {
		if (!showDone) {
			return null;
		}
		return (
			<ListItem disablePadding>
				<ListItemButton onClick={this.menuSelected} data-value="">
					<ListItemIcon>
						<ArrowBackIcon />
					</ListItemIcon>
					<ListItemText primary="DONE" />
				</ListItemButton>
			</ListItem>
		);
	}

	renderOptions(showOptions) {
		if (!showOptions) {
			return null;
		}
		return (
			<React.Fragment>
				<ListItem disablePadding>
					<ListItemButton onClick={this.menuSelected} data-value="configure">
						<ListItemIcon>
							<EditIcon />
						</ListItemIcon>
						<ListItemText primary="CONFIGURE MODEL" />
					</ListItemButton>
				</ListItem>
				<ListItem disablePadding>
					<ListItemButton onClick={this.menuSelected} data-value="pose">
						<ListItemIcon>
							<AccessibilityNewIcon />
						</ListItemIcon>
						<ListItemText primary="SELECT POSE" />
					</ListItemButton>
				</ListItem>
			</React.Fragment>
		);
	}

	render() {
		const showDone = this.state.selectedOption !== "";
		return (
			<Box sx={{ 
				width: 1/5,
				m: 2,
				zIndex: 'appBar', 
				position: 'absolute', 
				top: (theme) => theme.mixins.toolbar.minHeight + 'px'
			}}>
				<List sx={{ bgcolor: 'background.paper', opacity: 0.8, borderRadius: 1 }}>
					{this.renderDone(showDone)}
					{this.renderOptions(!showDone)}
				</List>
				{this.renderOptionsSelector()}
				{this.renderAnimSelector()}
			</Box>
		);
	}
}

MainSelector.defaultProps = {
	elementGroups: [],
	toggleElement: null,
	optAnimations: [],
	toggleAnimation: null,
	setAnimationTime: null
}

MainSelector.propTypes = {
	elementGroups: PropTypes.array,
	toggleElement: PropTypes.func,
	optAnimations: PropTypes.array,
	toggleAnimation: PropTypes.func,
	setAnimationTime: PropTypes.func
}

export default MainSelector;