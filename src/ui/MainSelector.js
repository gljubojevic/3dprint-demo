import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import EditIcon from '@mui/icons-material/Edit';
import AnimSelector from './AnimSelector';
import Paper from '@mui/material/Paper';

class MainSelector extends Component {
	constructor(props) {
		super(props);
		this.menuSelected = this.menuSelected.bind(this);
		this.elementCategorySelected = this.elementCategorySelected.bind(this);
		this.state = {
			selectedOption: ""
		}
	}

	menuSelected(e) {
		// read from "data-value" attribute
		const menu = e.currentTarget.dataset.value;
		this.setState({ selectedOption:menu });
		// reset category selection
		this.props.selectElementCategory('');
	}

	elementCategorySelected(e) {
		// read from "data-value" attribute
		const c = e.currentTarget.dataset.value;
		this.props.selectElementCategory(c);
	}

	renderCategoryOptions() {
		const selected = this.props.elementCategory;
		return this.props.elementGroups.map((g, idx) => {
			const category = g[0];
			return (
				<ListItem disablePadding selected={category === selected} key={idx}>
					<ListItemButton onClick={this.elementCategorySelected} data-value={category}>
						<ListItemText primary={category.toUpperCase()} />
						<ChevronRightIcon />
					</ListItemButton>
				</ListItem>
			);
		});
	}

	renderCategorySelector() {
		if (this.state.selectedOption !== "configure") {
			return null;
		}
		return (
			<Paper sx={{p: 0, m: 1, opacity: 0.8 }}>
				<List sx={{ width: '100%' }}>
					<ListSubheader component="div">MODEL OPTIONS</ListSubheader>
					{this.renderCategoryOptions()}
				</List>
			</Paper>
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
				{this.props.optAnimations.length > 0 &&
					<ListItem disablePadding>
						<ListItemButton onClick={this.menuSelected} data-value="pose">
							<ListItemIcon>
								<AccessibilityNewIcon />
							</ListItemIcon>
							<ListItemText primary="SELECT POSE" />
						</ListItemButton>
					</ListItem>
				}
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
				{this.renderCategorySelector()}
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
	setAnimationTime: null,
	elementCategory: '',
	selectElementCategory: null
}

MainSelector.propTypes = {
	elementGroups: PropTypes.array,
	toggleElement: PropTypes.func,
	optAnimations: PropTypes.array,
	toggleAnimation: PropTypes.func,
	setAnimationTime: PropTypes.func,
	elementCategory: PropTypes.string,
	selectElementCategory: PropTypes.func
}

export default MainSelector;