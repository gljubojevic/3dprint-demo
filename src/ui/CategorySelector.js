import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';

class CategorySelector extends Component {
	constructor(props) {
		super(props);
		this.checkChange = this.checkChange.bind(this);
		this.radioChange = this.radioChange.bind(this);
	}
	
	findCategory(groups, category) {
		if (null === groups || null === category) {
			return null;
		}
		for (let i = 0; i < groups.length; i++) {
			if (category === groups[i][0]) {
				return groups[i];
			}
		}
		return null;
	}

	checkChange(e) {
		const n = e.currentTarget.value;
		const v = e.currentTarget.checked;
		//console.log(n, "check change ->", v);
		if (null !== this.props.toggleElement) {
			this.props.toggleElement({key:n, visible:v});
		}
	}

	radioChange(e) {
		//console.log("radio change ->", e.target.value);
		if (null !==  this.props.toggleElement) {
			this.props.toggleElement({key:e.target.value, visible:true});
		}
	}

	renderCheckboxes(items) {
		return items.map((i, idx) => {
			return (
				<div key={idx}>
					<FormControlLabel label={i.name} value={i.key} control={<Checkbox checked={i.visible} onChange={this.checkChange} />} />
					<p style={{margin:0, padding:0}}>{i.description}</p>
					<img src={i.thumbnail} alt={i.name} />
				</div>
			);
		});
	}

	renderRadios(items) {
		return items.map((i, idx) => {
			return (
				<div key={idx}>
					<FormControlLabel label={i.name} value={i.key} control={<Radio />} />
					<p style={{margin:0, padding:0}}>{i.description}</p>
					<img src={i.thumbnail} alt={i.name} />
				</div>
			);
		});
	}

	renderRadioSelect(name, items) {
		let val = '';
		for (let i = 0; i < items.length; i++) {
			if (items[i].visible) {
				val = items[i].key;
			}
		}

		return (
			<RadioGroup
				name={name}
				value={val}
				onChange={this.radioChange}>
				{this.renderRadios(items)}
			</RadioGroup>
		);
	}

	renderCategory(category) {
		let dispName = category.name.toUpperCase();
		if (!dispName.endsWith('S')) {
			dispName += 'S';
		}
		return (
			<Paper sx={{p: 1, m: 1, opacity: 0.8 }}>
				<FormLabel component="legend">{dispName}</FormLabel>
				<FormControl>
					{(1 === category.items.length) ? this.renderCheckboxes(category.items) : this.renderRadioSelect(category.name,category.items)}
				</FormControl>
			</Paper>
		);
	}

	render() {
		const category = this.findCategory(this.props.elementGroups, this.props.elementCategory);
		if (null === category) {
			return null;
		}
		return (
			<Box sx={{ 
				width: 1/5, m: 2,
				zIndex: 'appBar', position: 'absolute',
				right: 0, top: (theme) => theme.mixins.toolbar.minHeight + 'px'
			}}>
				{this.renderCategory(category[1])}
			</Box>
		);
	}
}

CategorySelector.defaultProps = {
	elementCategory: null,
	elementGroups: [],
	toggleElement: null
}

CategorySelector.propTypes = {
	elementCategory: PropTypes.string,
	elementGroups: PropTypes.array,
	toggleElement: PropTypes.func
}

export default CategorySelector;