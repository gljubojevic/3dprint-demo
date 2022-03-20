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
			return (
				<FormControlLabel key={idx} label={o.name} value={o.key} control={<Checkbox checked={o.visible} onChange={this.checkChange}  />} />
			);
		});
	}

	checkChange(e) {
		const n = e.currentTarget.value;
		const v = e.currentTarget.checked;
		//console.log(n, "check change ->", v);
		if (null !==  this.props.toggleElement) {
			this.props.toggleElement({key:n, visible:v});
		}
	}

	radioChange(e) {
		//console.log("radio change ->", e.target.value);
		if (null !==  this.props.toggleElement) {
			this.props.toggleElement({key:e.target.value, visible:true});
		}
	}

	renderRadioSelect(opts) {
		let val = '';
		for (let i = 0; i < opts.length; i++) {
			if (opts[i].visible) {
				val = opts[i].key;
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
				<FormControlLabel key={idx} label={o.name} value={o.key} control={<Radio />} />
			);
		});
	}

	render() {
		return this.props.elementGroups.map((opts, idx) => {
			const key = "opt_" + idx;
			const label = opts[0];
			return (
				<Paper sx={{p: 1, m: 1, opacity: 0.8 }} key={key}>
					<FormControl>
						<FormLabel component="legend">{label}</FormLabel>
						{(1 === opts[1].items.length) ? this.renderCheckboxes(opts[1].items) : this.renderRadioSelect(opts[1].items)}
					</FormControl>
				</Paper>
			);
		});
	}
}

OptSelector.defaultProps = {
	elementGroups: [],
	toggleElement: null
}

OptSelector.propTypes = {
	elementGroups: PropTypes.array,
	toggleElement: PropTypes.func
}

export default OptSelector;