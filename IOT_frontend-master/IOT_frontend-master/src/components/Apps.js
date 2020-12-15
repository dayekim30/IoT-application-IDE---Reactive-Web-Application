import React, { useState, useEffect } from 'react';

const Apps = ({ addApp, removePermApp, updateImgUrl }) => {
	const [apps, setApps] = useState([]);

	const getApps = () => {
		let temp = JSON.parse(localStorage.getItem('permrecipes'));
		setApps(temp);
		console.log(temp);
	};

	useEffect(() => {
		getApps();
	}, []);

	const generateServicesUI = (app) => {
		let services = [];
		let rflag = true;
		let sflag = true;
		app.forEach((service) => {
			if (service.type !== 'service' && rflag) {
				services.push(<h4 className="ui header">Relationship</h4>);
				rflag = false;
			} else if (sflag) {
				services.push(<h4 className="ui header">Services</h4>);
				sflag = false;
			}
			services.push(
				<div className="event">
					<div className="content">
						<div className="summary">{service.name}</div>
					</div>
				</div>
			);
		});

		return services;
	};

	const renderedApps =
		apps && apps.length > 0 ? (
			apps.map((app, index) => {
				return (
					<div key={index} className="four wide column">
						<div key={index} className="ui card">
							<div className="content">
								<div className="header">{app.name}</div>
								{app.imageUrl !== '' ? (
									<img
										src={app.imageUrl}
										width="75%"
										height="150"
										alt="service"
									/>
								) : (
									<img
										src="https://semantic-ui.com/images/wireframe/image.png"
										width="75%"
										height="150"
										alt="placeholder"
									/>
								)}
							</div>
							<div className="content">
								{/* <h4 className="ui header">Services</h4> */}
								<div className="ui small feed">
									{generateServicesUI(app.appElements)}
								</div>
								<div>
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
														if (
															!error &&
															result &&
															result.event === 'success'
														) {
															app.imageUrl = result.info.url;
															console.log(
																'Done! Here is the image info: ',
																result.info
															);
															updateImgUrl(app);
															getApps();
														}
													}
												)
												.open();
										}}
										className="ui button"
									>
										{app.imageUrl !== '' ? 'Update Image' : 'Upload Image'}
									</button>
									<button
										onClick={() => {
											addApp(app);
										}}
										className="circular ui icon button"
										data-tooltip="Load"
									>
										<i className="upload icon"></i>
									</button>
									<button
										className="circular ui icon button"
										onClick={() => {
											removePermApp(app);
											getApps();
										}}
										data-tooltip="Delete"
									>
										<i className="delete icon"></i>
									</button>
								</div>
							</div>
							<div style={{ fontSize: '16px' }}>
								Date created:
								{new Date(app.dateCreated).toLocaleDateString('en-US', {
									hour: 'numeric',
									minute: 'numeric',
								})}
							</div>
						</div>
					</div>
				);
			})
		) : (
			<></>
		);

	return (
		<div>
			<div className="ui grid" style={{ paddingLeft: '2%' }}>
				{renderedApps}
			</div>
		</div>
	);
};

export default Apps;
