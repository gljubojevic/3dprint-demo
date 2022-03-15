import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Paper from '@mui/material/Paper';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';

class AnimSelector extends Component {
	constructor(props) {
		super(props);
		this.radioChange = this.radioChange.bind(this);
	}

	radioChange(e) {
		//console.log("radio change ->", e.target.value);
		if (null !==  this.props.toggleAnim) {
			this.props.toggleAnim(e.target.value);
		}
	}

	renderRadioSelect(opts) {
		// find enabled
		let val = '';
		for (let i = 0; i < opts.length; i++) {
			if (opts[i].enabled) {
				val = opts[i].name;
			}
		}

		return (
			<RadioGroup
				aria-labelledby="demo-controlled-radio-buttons-group"
				name="controlled-radio-buttons-group"
				value={val}
				onChange={this.radioChange}>
				{this.renderRadios(opts)}
			</RadioGroup>
		);
	}

	renderRadios(opts) {
		return opts.map((o, idx) => {
			return (
				<FormControlLabel key={idx} label={o.name} value={o.name} control={<Radio />} />
			);
		});
	}

	render() {
		return (
			<Paper sx={{p: 1, m: 1, opacity: 0.8 }}>
				<FormControl>
					<FormLabel component="legend">SELECT POSE</FormLabel>
					{this.renderRadioSelect(this.props.animPoses)}
				</FormControl>
			</Paper>
		);
	}
}

AnimSelector.defaultProps = {
	animPoses: [],
	toggleAnim: null
}

AnimSelector.propTypes = {
	animPoses: PropTypes.array,
	toggleAnim: PropTypes.func
}

export default AnimSelector;