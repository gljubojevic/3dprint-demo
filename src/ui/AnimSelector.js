import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Paper from '@mui/material/Paper';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';

class AnimSelector extends Component {
	constructor(props) {
		super(props);
		this.animFrameLabel = this.animFrameLabel.bind(this);
		this.radioChange = this.radioChange.bind(this);
		this.sliderChange = this.sliderChange.bind(this);
	}

	sliderChange(e) {
		const v = e.target.value;
		const o = this.findSelected(this.props.animPoses);
		if (null !== this.props.setAnimTime) {
			this.props.setAnimTime(v * o.frameTime);
		}
	}

	findSelected(opts) {
		for (let i = 0; i < opts.length; i++) {
			if (opts[i].enabled) {
				return opts[i];
			}			
		}
		return null;
	}

	animFrameLabel(value) {
		return `${value} frame`;
	}

	renderAnimFrames(opts) {
		// find selected anim
		const o = this.findSelected(opts);
		if (0 === o.frames) {
			return null;
		}

		const lbl = `SELECT FRAME (${o.frames} frm / ${Math.round(1 / o.frameTime, 2)}fps)`

		return (
			<Paper sx={{p: 1, m: 1, opacity: 0.8 }}>
					<FormControl sx={{width: "100%"}}>
						<FormLabel component="legend">{lbl}</FormLabel>
						<Box sx={{p: 1}}>
							<Slider
								aria-label="Fames"
								defaultValue={0}
								getAriaValueText={this.animFrameLabel}
								valueLabelDisplay="auto"
								marks
								min={0}
								max={o.frames-1}
								step={1}
								onChange={this.sliderChange}
							/>
						</Box>
					</FormControl>
			</Paper>
		);
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
		const opts = this.props.animPoses;
		return (
			<React.Fragment>
				{this.renderAnimFrames(opts)}
				<Paper sx={{p: 1, m: 1, opacity: 0.8 }}>
					<FormControl>
						<FormLabel component="legend">SELECT POSE</FormLabel>
						{this.renderRadioSelect(opts)}
					</FormControl>
				</Paper>
			</React.Fragment>
		);
	}
}

AnimSelector.defaultProps = {
	animPoses: [],
	toggleAnim: null,
	setAnimTime: null
}

AnimSelector.propTypes = {
	animPoses: PropTypes.array,
	toggleAnim: PropTypes.func,
	setAnimTime: PropTypes.func
}

export default AnimSelector;