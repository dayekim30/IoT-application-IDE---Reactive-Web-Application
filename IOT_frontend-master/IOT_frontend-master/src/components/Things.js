import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Helper from '../services/Helper';

const Things = () => {
	const [things, setThings] = useState([]);

	const getThings = () => {
		axios
			.get(Helper.getURL() + '/getthings')
			.then((res) => {
				console.log(res.data);
				setThings([...res.data]);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const setImage = async (imageUrl, name, thingID) => {
		await axios
			.post(Helper.getURL() + '/setimageurl', {
				imageUrl: imageUrl,
				type: 'Things',
				name: name,
				thingID: thingID,
			})
			.then((res) => {
				console.log(res);
				getThings();
			})
			.catch((err) => {
				console.log(err);
			});
	};

	useEffect(() => {
		getThings();
	}, []);

	const renderedThings =
		things.length > 0 ? (
			things.map((c) => {
				return (
					<div key={c.thingID} className="card">
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
							<div className="meta">{c.owner}</div>
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
			})
		) : (
			<></>
		);

	return (
		<div>
			<button className="ui button" onClick={getThings}>
				Get New Things
			</button>
			<br />
			<br />
			<div className="ui cards" style={{ paddingLeft: '5%' }}>
				{renderedThings}
			</div>
		</div>
	);
};

export default Things;
