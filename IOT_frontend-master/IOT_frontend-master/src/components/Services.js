import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Helper from '../services/Helper';

const Services = () => {
	const [services, setServices] = useState([]);
	const [selectedFilter, setSelectedFilter] = useState('');

	const getServices = () => {
		axios
			.get(Helper.getURL() + '/getservices')
			.then((res) => {
				console.log(res.data);
				setServices([...res.data]);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const setImage = async (imageUrl, name, thingID) => {
		console.log(imageUrl);
		console.log(name);
		await axios
			.post(Helper.getURL() + '/setimageurl', {
				imageUrl: imageUrl,
				type: 'Services',
				name: name,
				thingID: thingID,
			})
			.then((res) => {
				console.log(res);
				getServices();
			})
			.catch((err) => {
				console.log(err);
			});
	};

	useEffect(() => {
		getServices();
	}, []);

	const renderedServices = () => {
		let output = [];
		services.forEach((c) => {
			if (selectedFilter === '') {
				output.push(
					<div key={c.name} className="card">
						<div className="content">
							{c.imageUrl !== '' ? (
								<img src={c.imageUrl} width="75%" height="150" alt="service" />
							) : (
								<img
									src="https://semantic-ui.com/images/wireframe/image.png"
									width="75%"
									height="150"
									alt="placeholder"
								/>
							)}
							<br />
							<br />
							<div className="header">{c.name}</div>
							<div className="meta">{c.thingID}</div>
							<div className="description">
								{c.description === ''
									? 'No description provided.'
									: c.description}
							</div>
							<button
								id="upload_widget"
								onClick={() => {
									window.cloudinary
										.createUploadWidget(
											{
												cloudName: 'dsgvwdu7t',
												uploadPreset: 'x0udwssk',
											},
											(error, result) => {
												if (!error && result && result.event === 'success') {
													c.imageUrl = result.info.url;
													console.log(
														'Done! Here is the image info: ',
														result.info
													);
													setImage(result.info.url, c.name, c.thingID);
												}
											}
										)
										.open();
								}}
								className="ui button"
							>
								{c.imageUrl !== '' ? 'Update Image' : 'Upload Image'}
							</button>
						</div>
					</div>
				);
			} else if (c.thingID === selectedFilter) {
				output.push(
					<div key={c.name} className="card">
						<div className="content">
							{c.imageUrl !== '' ? (
								<img src={c.imageUrl} width="75%" height="150" alt="service" />
							) : (
								<img
									src="https://semantic-ui.com/images/wireframe/image.png"
									width="75%"
									height="150"
									alt="placeholder"
								/>
							)}
							<br />
							<br />
							<div className="header">{c.name}</div>
							<div className="meta">{c.thingID}</div>
							<div className="description">
								{c.description === ''
									? 'No description provided.'
									: c.description}
							</div>
							<button
								id="upload_widget"
								onClick={() => {
									window.cloudinary
										.createUploadWidget(
											{
												cloudName: 'dsgvwdu7t',
												uploadPreset: 'x0udwssk',
											},
											(error, result) => {
												if (!error && result && result.event === 'success') {
													c.imageUrl = result.info.url;
													console.log(
														'Done! Here is the image info: ',
														result.info
													);
													setImage(result.info.url, c.name);
												}
											}
										)
										.open();
								}}
								className="ui button"
							>
								{c.imageUrl !== '' ? 'Update Image' : 'Upload Image'}
							</button>
						</div>
					</div>
				);
			}
		});
		return output;
	};

	const RenderOptions = () => {
		let set = new Set();
		services.forEach((elem) => {
			set.add(elem.thingID);
		});
		let arr = Array.from(set);
		console.log(arr);
		let output = [];
		output.push(<option value="">All Things</option>);
		for (let i = 0; i < arr.length; i++) {
			if (selectedFilter === arr[i]) {
				output.push(
					<option value={arr[i]} key={arr[i]} selected>
						{arr[i]}
					</option>
				);
			} else {
				output.push(
					<option value={arr[i]} key={arr[i]}>
						{arr[i]}
					</option>
				);
			}
		}
		console.log(output);
		return output;
	};

	return (
		<div>
			<div style={{ display: 'flex' }}>
				<label style={{ marginLeft: '5%' }}>Filter:</label>
				<select
					style={{ float: 'left', marginLeft: '10px' }}
					className="ui dropdown"
					onChange={(e) => {
						console.log(e.target.value);
						setSelectedFilter(e.target.value);
					}}
				>
					<RenderOptions />{' '}
				</select>
				<button
					style={{ marginLeft: '25%' }}
					className="ui button"
					onClick={getServices}
				>
					Get New Services
				</button>
			</div>
			<br />
			<br />
			<div className="ui cards" style={{ paddingLeft: '5%' }}>
				{renderedServices()}
			</div>
		</div>
	);
};

export default Services;
