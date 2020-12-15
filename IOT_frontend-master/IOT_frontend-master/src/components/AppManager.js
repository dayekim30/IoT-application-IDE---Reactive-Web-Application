import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModalPopUp from './ModalPopUp';
import Helper from '../services/Helper';

const AppManager = ({ addApp, removeApp }) => {
	const [apps, setApps] = useState([]);
	const [runningServices, setRunningServices] = useState([]);
	const [show, setShow] = useState(false);
	const [logOutput, setLogOutput] = useState([]);
	const [serviceOutput, setServiceOutput] = useState([]);

	const handleClose = () => setShow(false);

	const checkIfExpired = () => {
		apps.forEach((elem) => {
			if (elem.startTime === '') {
				if (Number(elem.dateCreated) < Date.now() - 300000) {
					removeApp(elem);
					getApps();
				}
			} else {
				if (Number(elem.startTime) < Date.now() - 300000) {
					removeApp(elem);
					getApps();
				}
			}
		});
	};

	const getApps = () => {
		let temp = JSON.parse(localStorage.getItem('recipes'));
		setApps(temp);
		console.log(temp);
	};

	useEffect(() => {
		const handle = setInterval(() => checkIfExpired(), 10000);
		return () => clearInterval(handle);
	});

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

	const executeServices = async (app, newStr, i) => {
		console.log(app);
		return await axios
			.post(Helper.getURL() + '/runservice', {
				tweet: app,
			})
			.then((res) => {
				let output = JSON.parse(res.data);
				console.log(output);

				newStr.push(
					'Successfully executed Service ' +
						i +
						' (' +
						output['Service Name'] +
						')'
				);

				if (output['Service Result'] !== 'No Output') {
					newStr.push('Output is ' + output['Service Result']);
					let temp = serviceOutput;
					temp.push(Number(output['Service Result']));
					setServiceOutput(temp);
				} else {
					newStr.push('Service has no output');
				}
				setLogOutput(newStr);
				return 'completed';
			})
			.catch((err) => {
				console.log(err);
				newStr.push('Error occured while executing Service ' + i);
				setLogOutput(newStr);
				return 'Error occured';
			});
	};

	const startServices = async (id) => {
		//console.log(apps[id]);
		let newStr = [];
		let rType = '';

		if (apps[id].appElements.length > 0) {
			let temp = runningServices;
			temp = temp.concat(id);
			setRunningServices(temp);

			apps[id].status = 'Active';
			apps[id].startTime = Date.now();
			newStr.push('Executing Services...');
			setLogOutput(newStr);

			if (apps[id].appElements.length > 1) {
				if (apps[id]['appElements'][0].type !== 'service') {
					rType = apps[id]['appElements'][0].type;
				}
			}

			if (rType === '') {
				for (let i = 0; i < apps[id].appElements.length; i++) {
					//console.log('here');
					//console.log(apps[id][i]);
					newStr.push('Executing Service ' + i);
					setLogOutput(newStr);

					const res = await executeServices(
						apps[id]['appElements'][i],
						newStr,
						i
					);

					if (res === 'Error occured') {
						apps[id].status = 'Error occured';
						newStr.push('Stopping execution...');
						setLogOutput(newStr);

						setTimeout(function () {
							setLogOutput([]);
							handleClose();
						}, 3000);

						temp = runningServices.filter((item) => item !== id);
						setRunningServices(temp);

						return;
					}
				}
				apps[id].status = 'Completed';
				newStr.push('Finished executing');
				setLogOutput(newStr);

				setTimeout(function () {
					setLogOutput([]);
					handleClose();
				}, 7000);

				temp = runningServices.filter((item) => item !== id);
				setRunningServices(temp);
			} else if (
				rType === 'contest' ||
				rType === 'support' ||
				rType === 'extend' ||
				rType === 'interfere'
			) {
				for (let i = 1; i < apps[id].appElements.length; i++) {
					//console.log('here');
					//console.log(apps[id][i]);
					newStr.push('Executing Service ' + i);
					setLogOutput(newStr);

					const res = await executeServices(
						apps[id]['appElements'][i],
						newStr,
						i
					);

					if (res === 'Error occured') {
						apps[id].status = 'Error occured';
						newStr.push('Stopping execution...');
						setLogOutput(newStr);

						setTimeout(function () {
							setLogOutput([]);
							handleClose();
						}, 3000);

						temp = runningServices.filter((item) => item !== id);
						setRunningServices(temp);

						return;
					}
				}
				apps[id].status = 'Completed';
				newStr.push('Finished executing');
				setLogOutput(newStr);

				setTimeout(function () {
					setLogOutput([]);
					handleClose();
				}, 7000);

				temp = runningServices.filter((item) => item !== id);
				setRunningServices(temp);
			} else if (rType === 'drive') {
				setServiceOutput([]);
				for (let i = 1; i < apps[id].appElements.length; i++) {
					//console.log('here');
					//console.log(apps[id][i]);
					newStr.push('Executing Service ' + i);
					setLogOutput(newStr);

					if (serviceOutput.length > 0) {
						let count = apps[id]['appElements'][i].inputCount;
						let input = [];
						if (serviceOutput.length >= count) {
							for (
								let i = serviceOutput.length - count;
								i < serviceOutput.length;
								i++
							) {
								input.push(serviceOutput[i]);
							}
							apps[id]['appElements'][i].inputs = input;
						}
					}

					const res = await executeServices(
						apps[id]['appElements'][i],
						newStr,
						i
					);

					if (res === 'Error occured') {
						apps[id].status = 'Error occured';
						newStr.push('Stopping execution...');
						setLogOutput(newStr);

						setTimeout(function () {
							setLogOutput([]);
							handleClose();
						}, 3000);

						temp = runningServices.filter((item) => item !== id);
						setRunningServices(temp);

						return;
					}
				}
				apps[id].status = 'Completed';
				newStr.push('Finished executing');
				setLogOutput(newStr);

				setTimeout(function () {
					setLogOutput([]);
					handleClose();
				}, 7000);

				temp = runningServices.filter((item) => item !== id);
				setRunningServices(temp);
			} else if (rType === 'control') {
				setServiceOutput([]);
				let condition = apps[id]['appElements'][0].conditional;
				let controlParam = apps[id]['appElements'][0].controlParam;
				for (let i = 1; i < apps[id].appElements.length; i++) {
					//console.log('here');
					//console.log(apps[id][i]);
					newStr.push('Executing Service ' + i);
					setLogOutput(newStr);

					if (serviceOutput.length > 0 && i > 1) {
						if (condition === '>') {
							if (
								serviceOutput[serviceOutput.length - 1] < parseInt(controlParam)
							) {
								apps[id].status = 'Error occured';
								newStr.push('Input criteria not satisfied...');
								setLogOutput(newStr);

								setTimeout(function () {
									setLogOutput([]);
									handleClose();
								}, 3000);

								temp = runningServices.filter((item) => item !== id);
								setRunningServices(temp);

								return;
							}
						} else if (condition === '<') {
							if (
								serviceOutput[serviceOutput.length - 1] > parseInt(controlParam)
							) {
								apps[id].status = 'Error occured';
								newStr.push('Input criteria not satisfied...');
								setLogOutput(newStr);

								setTimeout(function () {
									setLogOutput([]);
									handleClose();
								}, 3000);

								temp = runningServices.filter((item) => item !== id);
								setRunningServices(temp);

								return;
							}
						} else if (condition === '=') {
							if (
								serviceOutput[serviceOutput.length - 1] !==
								parseInt(controlParam)
							) {
								apps[id].status = 'Error occured';
								newStr.push('Input criteria not satisfied...');
								setLogOutput(newStr);

								setTimeout(function () {
									setLogOutput([]);
									handleClose();
								}, 3000);

								temp = runningServices.filter((item) => item !== id);
								setRunningServices(temp);

								return;
							}
						}
					}

					const res = await executeServices(
						apps[id]['appElements'][i],
						newStr,
						i
					);

					if (res === 'Error occured') {
						apps[id].status = 'Error occured';
						newStr.push('Stopping execution...');
						setLogOutput(newStr);

						setTimeout(function () {
							setLogOutput([]);
							handleClose();
						}, 3000);

						temp = runningServices.filter((item) => item !== id);
						setRunningServices(temp);

						return;
					}
				}
				apps[id].status = 'Completed';
				newStr.push('Finished executing');
				setLogOutput(newStr);

				setTimeout(function () {
					setLogOutput([]);
					handleClose();
				}, 7000);

				temp = runningServices.filter((item) => item !== id);
				setRunningServices(temp);
			}
		}
	};

	const handleFileUpload = (e) => {
		const fileReader = new FileReader();
		fileReader.readAsText(e.target.files[0], 'UTF-8');
		fileReader.onload = (e) => {
			//console.log(e.target.result);
			addApp(JSON.parse(e.target.result));
		};
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
									{app.status === 'Inactive' ||
									app.status === 'Completed' ||
									app.status === 'Error occured' ? (
										<button
											onClick={() => {
												startServices(index);
												setShow(true);
											}}
											className="circular ui icon button"
											data-tooltip="Play"
										>
											<i className="play icon"></i>
										</button>
									) : (
										<button
											className="circular ui icon button"
											onClick={() => startServices(index)}
											data-tooltip="Stop"
										>
											<i className="stop icon"></i>
										</button>
									)}
									<a
										className="circular ui icon button"
										download="data.json"
										href={
											`data: text/json;charset=utf-8,` +
											encodeURIComponent(JSON.stringify(apps[index]))
										}
										data-tooltip="Save"
									>
										<i className="save icon"></i>
									</a>
									<button
										className="circular ui icon button"
										onClick={() => {
											removeApp(app);
											getApps();
										}}
										data-tooltip="Delete"
									>
										<i className="delete icon"></i>
									</button>
								</div>
							</div>
							<div style={{ fontSize: '16px' }}>
								Date Loaded:
								{new Date(app.dateCreated).toLocaleDateString('en-US', {
									hour: 'numeric',
									minute: 'numeric',
								})}
							</div>
							{app.startTime !== '' && app.status === 'Active' ? (
								<div style={{ fontSize: '16px' }}>
									Start Time: {console.log(typeof app.startTime)}
									{new Date(app.startTime).toLocaleDateString('en-US', {
										hour: 'numeric',
										minute: 'numeric',
									})}
								</div>
							) : (
								''
							)}
							<div style={{ fontSize: '16px' }}>Status: {app.status}</div>
						</div>
					</div>
				);
			})
		) : (
			<></>
		);

	return (
		<div style={{ display: 'grid' }}>
			<div>
				<label
					for="file-upload"
					style={{
						border: '1px solid #ccc',
						padding: '6px 12px',
						cursor: 'pointer',
						float: 'right',
						marginRight: '10px',
					}}
				>
					<i className="cloud upload icon"></i>
					Upload
				</label>
				<input
					id="file-upload"
					className="ui button"
					style={{ display: 'none' }}
					type="file"
					accept="json"
					onChange={handleFileUpload}
				/>
			</div>
			<ModalPopUp s={show} handleClose={handleClose} logOutput={logOutput} />
			<div className="ui grid" style={{ paddingLeft: '2%' }}>
				{renderedApps}
			</div>
		</div>
	);
};

export default AppManager;
