import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Paper from '@mui/material/Paper';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';

class OptSelector extends Component {
	constructor(props) {
		super(props);
		this.checkChange = this.checkChange.bind(this);
		this.radioChange = this.radioChange.bind(this);
	}

	renderCheckboxes(opts) {
		return opts.map((o, idx) => {
			let path = o.name.split('_');
			let name = path[1] + ' ' + path[2];
			return (
				<FormControlLabel key={idx} label={name} value={o.name} control={<Checkbox checked={o.visible} onChange={this.checkChange}  />} />
			);
		});
	}

	checkChange(e) {
		const n = e.currentTarget.value;
		const v = e.currentTarget.checked;
		//console.log(n, "check change ->", v);
		if (null !==  this.props.toggleElement) {
			this.props.toggleElement({name:n, visible:v});
		}
	}

	radioChange(e) {
		//console.log("radio change ->", e.target.value);
		if (null !==  this.props.toggleElement) {
			this.props.toggleElement({name:e.target.value, visible:true});
		}
	}

	renderRadioSelect(opts) {
		let val = '';
		for (let i = 0; i < opts.length; i++) {
			if (opts[i].visible) {
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
			let path = o.name.split('_');
			let name = path[1] + ' ' + path[2];
			return (
				<FormControlLabel key={idx} label={name} value={o.name} control={<Radio />} />
			);
		});
	}

	render() {
		return this.props.optElements.map((opts, idx) => {
			const key = "opt_" + idx;
			const label = opts[0].name.split('_')[1];
			return (
				<Paper sx={{p: 1, m: 1, opacity: 0.8 }} key={key}>
					<FormControl>
						<FormLabel component="legend">{label}</FormLabel>
						{(1 === opts.length) ? this.renderCheckboxes(opts) : this.renderRadioSelect(opts)}
					</FormControl>
				</Paper>
			);
		});
	}
}

OptSelector.defaultProps = {
	optElements: [],
	toggleElement: null
}

OptSelector.propTypes = {
	optElements: PropTypes.array,
	toggleElement: PropTypes.func
}

export default OptSelector;