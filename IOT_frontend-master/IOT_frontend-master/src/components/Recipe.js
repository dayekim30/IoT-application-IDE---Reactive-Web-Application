import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Draggable from 'react-draggable';
import { Col, Row } from 'react-bootstrap';
import Helper from '../services/Helper';

const Recipe = (props) => {
	const [services, setServices] = useState([]);
	const [relationships, setRelationships] = useState([]);
	const [servicePositions, setServicePositions] = useState([]);
	const [relationshipPositions, setRelationshipPositions] = useState([]);
	const [renderedDragSpots, setRenderedDragSpots] = useState([]);

	const [isDragSpotOccupied, setIsDragSpotOccupied] = useState([]);
	//const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
	const [draggedServiceIndex, setDraggedServiceIndex] = useState(0); //THIS CONTAINS THE SERVICE ELEMENT INDEX THAT WAS DRAGGED
	const [draggedRelationshipIndex, setDraggedRelationshipIndex] = useState(0); //THIS CONTAINS THE SERVICE ELEMENT INDEX THAT WAS DRAGGED

	const nodeRef = React.useRef(null);
	const getServices = () => {
		axios
			.get(Helper.getURL() + '/getservices')
			.then((res) => {
				//console.table(res.data);
				setServices([...res.data]);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const getRelationships = () => {
		axios
			.get(Helper.getURL() + '/getrelationships')
			.then((res) => {
				//console.log(res.data);
				setRelationships([...res.data]);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	useEffect(() => {
		getServices();
		getRelationships();
	}, []);

	//UseEffect for initializing the Service positions array
	useEffect(() => {
		//clear all positions when services change and
		setServicePositions([]);
		setIsDragSpotOccupied([]);
		//then set them all back to zero
		for (let k = 0; k < services.length; k++) {
			setServicePositions((servicePositions) => [
				...servicePositions,
				{ x: 0, y: 0 },
			]);
		}

		//reassign all drag spots
	}, [services]);

	//UseEffect for initializing the relationships positions array
	useEffect(() => {
		//clear all positions when services change and
		setRelationshipPositions([]);
		//then set them all back to zero
		//console.log('relationship length is ' + relationships.length);
		for (let k = 0; k < relationships.length; k++) {
			setRelationshipPositions((relationshipPositions) => [
				...relationshipPositions,
				{ x: 0, y: 0 },
			]);
		}
		//reassign all drag spots
	}, [relationships]);

	useEffect(() => {
		//clear the editor when this is called
		clearEditor();
	}, [services, relationships]);

	useEffect(() => {
		//clear all positions when services change and
		//console.log("Spots effect changed!");
		//console.table(isDragSpotOccupied);
		realignFilledSpots();

		if (renderedDragSpots.length === 0) {
			addSpot();
		}
	}, [renderedDragSpots]);

	const realignFilledSpots = () => {
		let tempServicePositions = [...servicePositions];
		let tempRelationshipPositions = [...relationshipPositions];

		isDragSpotOccupied.forEach((value, index) => {
			if (value) {
				//checks if there is something other than false in array
				services.forEach((service, serviceIndex) => {
					if (service.name === value) {
						let dragSpotPosition = getAbsolutePosition(
							document.getElementById('dragSpot' + index)
						);
						let servicePosition = getAbsolutePosition(
							document.getElementById(serviceIndex)
						);

						tempServicePositions[serviceIndex] = {
							x: Math.trunc(dragSpotPosition.x - servicePosition.x),
							y: Math.trunc(dragSpotPosition.y - servicePosition.y),
						};
					}
				});

				//Add service realign

				relationships.forEach((relationship, relationshipIndex) => {
					if (relationship.name === value) {
						let dragSpotPosition = getAbsolutePosition(
							document.getElementById('dragSpot' + index)
						);
						let relationshipPosition = getAbsolutePosition(
							document.getElementById('relationship' + relationshipIndex)
						);
						tempRelationshipPositions[relationshipIndex] = {
							x: Math.trunc(dragSpotPosition.x - relationshipPosition.x),
							y: Math.trunc(dragSpotPosition.y - relationshipPosition.y),
						};
					}
				});
			}
		});

		setServicePositions(tempServicePositions);
		setRelationshipPositions(tempRelationshipPositions);
	};

	const addSpot = () => {
		let newIndex = renderedDragSpots.length;
		let newID = 'dragSpot' + newIndex;

		//only allow adding a many spots as there are services and relationships
		if (isDragSpotOccupied.length > renderedDragSpots.length) {
			setRenderedDragSpots((renderedDragSpots) => [
				...renderedDragSpots,
				<div className="dragSpot" id={newID}>
					Drag Spot {newIndex}
					<br />
				</div>,
			]);
		}
	};

	const clearEditor = () => {
		//clear all positions
		setIsDragSpotOccupied([]);
		setServicePositions([]);
		setRelationshipPositions([]);
		setRenderedDragSpots([]);
		//set defaults for services and occupied spots
		for (let k = 0; k < services.length; k++) {
			setServicePositions((servicePositions) => [
				...servicePositions,
				{ x: 0, y: 0 },
			]);
		}

		//set defaults for relationships
		for (let i = 0; i < relationships.length; i++) {
			setRelationshipPositions((relationshipPositions) => [
				...relationshipPositions,
				{ x: 0, y: 0 },
			]);
		}

		//clear dragSpots
		for (let i = 0; i < services.length + relationships.length; i++) {
			setIsDragSpotOccupied((isDragSpotOccupied) => [
				...isDragSpotOccupied,
				false,
			]);
		}
		//clear status label and inputs
		let label = document.getElementById('statusLabel');
		label.innerText = '';
		let appNameInput = document.getElementById('appName');
		appNameInput.value = '';
	};

	const createApp = (e) => {
		e.preventDefault();
		let label = document.getElementById('statusLabel');
		let tempApp = [];
		let ignoreIndexes = []; //use this array to hold an integer array of all of the indexes of the dragSpot occupied that should be skipped
		let appDesignError = false;
		let errorText = '';
		//console.table(isDragSpotOccupied);
		isDragSpotOccupied.forEach((value, index) => {
			if (value && !ignoreIndexes.includes(index) && !appDesignError) {
				//checks if there is something other than false in array
				console.log(value);

				services.forEach((service, serviceIndex) => {
					if (service.name === value) {
						//get service element Inputs
						let innerInputElements = document
							.getElementById(serviceIndex)
							.getElementsByClassName('inputClass');

						service.inputCount = innerInputElements.length; //set number of Inputs
						service.inputs = []; //initialize empty array of inputs
						service.type = 'service'; //set type for use in parsing of apps
						for (let kk = 0; kk < innerInputElements.length; kk++) {
							let tempValue = innerInputElements[kk].value;
							tempValue =
								tempValue === undefined ||
								tempValue === null ||
								isNaN(tempValue) ||
								tempValue === ''
									? 0
									: tempValue;
							service.inputs.push(tempValue);
						}

						tempApp.push({ ...service });
						//console.log("temp app length is: ", tempApp.length);
						//tempApp[tempApp.length] = {...service};
						//console.log("Added element ", service);
						//	console.table(tempApp);
					}
				});

				relationships.forEach((relationship, relationshipIndex) => {
					if (relationship.name === value) {
						//check conditionals for each relationship type
						switch (relationship.type) {
							case 'contest': //prefer service 1 over service 2
								//check to see if service 2 is already in the temp app
								let removeIndex = -1;
								tempApp.forEach((appElement, appIndex) => {
									if (
										appElement.type === 'service' &&
										appElement.name === relationship.secondService
									) {
										removeIndex = appIndex;
									}
								});
								//if the service is in the app already, remove it
								if (removeIndex > -1) tempApp.splice(removeIndex, 1);

								//check if it is in the isDragSpotOccupied array and add the index to the ignore array so it does not get added
								let indexOfSecondService = isDragSpotOccupied.indexOf(
									relationship.secondService
								);
								ignoreIndexes.push(indexOfSecondService);
								break;

							case 'drive':
								//Check if services exist in the current app for drive relationship
								if (
									!isDragSpotOccupied.includes(relationship.firstService) ||
									!isDragSpotOccupied.includes(relationship.secondService)
								) {
									appDesignError = true;
									errorText =
										'You must include all services required for a relationship: ' +
										relationship.name;
									return;
								}

								//Just need to check if the number of inputs and outputs on the services match up
								let numServiceOneOutputs = 0;
								let numServiceTwoInputs = 0;

								services.forEach((service, index) => {
									if (relationship.firstService === service.name) {
										numServiceOneOutputs = getNumOutputs(service);
									}

									if (relationship.secondService === service.name) {
										let innerInputElements = document
											.getElementById(index)
											.getElementsByClassName('inputClass');
										numServiceTwoInputs = innerInputElements.length; //set number of Inputs
									}
								});

								//console.log("Service 1 has: ", numServiceOneOutputs," outputs and service 2 has: ", numServiceTwoInputs, " inputs");

								if (numServiceOneOutputs === 0) {
									//TODO UNCOMMENT THIS
									appDesignError = true;
									errorText =
										'Service ' +
										relationship.firstService +
										' has no outputs and cannot drive another service';
									return;
								}

								if (numServiceOneOutputs !== numServiceTwoInputs) {
									//TODO UNCOMMENT THIS
									appDesignError = true;
									errorText =
										'Service ' +
										relationship.firstService +
										' and ' +
										relationship.secondService +
										' have mismatched inputs and outputs' +
										numServiceOneOutputs +
										' vs ' +
										numServiceTwoInputs;
									label.style.color = 'red';
									return;
								}
								break;
							case 'control':
								//Check if services exist in the current app for control relationship
								if (
									!isDragSpotOccupied.includes(relationship.firstService) ||
									!isDragSpotOccupied.includes(relationship.secondService)
								) {
									appDesignError = true;
									errorText =
										'You must include all services required for a relationship: ' +
										relationship.name;
									return;
								}
								//get relationship element and the input fields related to it
								let relationshipElement = document.getElementById(
									'relationship' + relationshipIndex
								);
								let conditional = document
									.getElementById(
										'relationship' + relationshipIndex + 'condition'
									)
									.value.trim();
								let value = document.getElementById(
									'relationship' + relationshipIndex + 'value'
								).value;

								console.log('condition element is', conditional);
								console.log('value element is', value);

								//check if the conditional is correct
								if (
									conditional !== '>' &&
									conditional !== '<' &&
									conditional !== '='
								) {
									appDesignError = true;
									errorText =
										'Conditional for  ' + relationship.name + ' is incorrect';
									return;
								}
								//fix value if it does not conform properly
								if (value === null || value === undefined || isNaN(value)) {
									value = 0;
								}

								//TODO DO CHECK TO SEE NUMBER OF OUTPUTS OF SERVICE1 BEFORE ALLOWING SAVING
								let numOutputs = 0;
								services.forEach((service, index) => {
									if (relationship.firstService === service.name) {
										numOutputs = getNumOutputs(service);
									}
								});

								if (numOutputs === 0) {
									appDesignError = true;
									errorText =
										'Error  ' +
										relationship.firstService +
										' from control relationship ' +
										relationship.name +
										' has no outputs';
									return;
								}

								relationship.conditional = conditional;
								relationship.controlParam = value;

								break;
							case 'support':
								//do not do anything here for support. Support will simply reorder elements if service 2 is available
								break;
							default:
								break;
						}

						tempApp.push({ ...relationship });
						//tempApp[tempApp.length] = {... relationship};
						console.log('Added element ', relationship);
						//console.table(tempApp);
					}
				});
			}
		});
		console.log('temp app after parsing is: ');
		console.table(tempApp);

		let appName = document.getElementById('appName').value;
		if (appDesignError) {
			label.innerText = errorText;
			label.style.color = 'red';
			return;
			//TODO UNCOMMENT THIS WHEN DOING FULL TESTING
		} else if (appName === null || appName === undefined || appName === '') {
			label.innerText = 'App Name cannot be empty';
			label.style.color = 'red';
			return;
		}

		let relationshipConflictError = false;
		//CHECK TO SEE IF MULTIPLE RELATIONSHIPS WITH THE SAME SERVICES EXIST AND GIVE AN ERROR MESSAGE
		tempApp.forEach((element, index) => {
			if (element.type !== 'service') {
				//if the element is a relationship ...

				//check every index further down the array if it holds the same services
				for (let k = index + 1; k < tempApp.length; k++) {
					if (
						tempApp[k].firstService !== undefined &&
						element.firstService === tempApp[k].firstService &&
						element.secondService === tempApp[k].secondService
					) {
						relationshipConflictError = true;
					}

					if (
						tempApp[k].firstService !== undefined &&
						element.firstService === tempApp[k].secondService &&
						element.secondService === tempApp[k].firstService
					) {
						relationshipConflictError = true;
					}
				}
			}
		});
		//check for relationship conflicts
		if (relationshipConflictError) {
			label.innerText =
				'Two relationships with the same services cannot be present in the app';
			label.style.color = 'red';
			return;
		}

		//APP REORDERING BASED ON SERVICES
		for (let i = 0; i < tempApp.length; i++) {
			//if the element is a relationship ...
			if (tempApp[i].type !== 'service' && tempApp[i].type !== undefined) {
				switch (tempApp[i].type) {
					case 'contest': // do no reordering for contest
						continue;
						break;
					case 'drive': //
						//First: swap relationship to position of first service that appears
						tempApp = swapAppOrder(i, tempApp);
						break;
					case 'support':
						let firstServiceIndex = -1;
						let secondServiceIndex = -1;

						//get index of elements for swapping
						for (let kk = 0; kk < tempApp.length; kk++) {
							if (tempApp[kk].name === tempApp[i].firstService) {
								firstServiceIndex = kk;
								continue;
							}
							if (tempApp[kk].name === tempApp[i].secondService) {
								secondServiceIndex = kk;
								continue;
							}
						}
						//if both services are in the tempApp
						if (firstServiceIndex !== -1 && secondServiceIndex !== -1) {
							//if service 1 is supposed to run first, swap its position with service 2
							if (firstServiceIndex < secondServiceIndex) {
								let tempService = tempApp[firstServiceIndex];
								tempApp[firstServiceIndex] = tempApp[secondServiceIndex];
								tempApp[secondServiceIndex] = tempService;
							}
						}

						break;
					case 'control':
						tempApp = swapAppOrder(i, tempApp);
						break;
					case 'interfere':
						tempApp = swapAppOrder(i, tempApp);
						break;
					case 'extend':
						tempApp = swapAppOrder(i, tempApp);
						break;
					default:
						break;
				}
			}
		}

		console.table(tempApp);
		//console.table(isDragSpotOccupied);

		let finalApp = {
			appElements: tempApp,
			name: appName,
			status: 'Inactive',
			dateCreated: Date.now(),
			startTime: '',
			imageUrl: '',
		};

		//console.log(finalApp);
		props.addApp(finalApp);
		label.innerText = 'App saved successfully';
		label.style.color = 'black';

		clearEditor();
	};

	const swapAppOrder = (i, tempApp) => {
		//Find the first element in the array, either the relationship, service 1, or service 2
		let firstItemIndex = 0;
		for (let kk = 0; kk < tempApp.length; kk++) {
			//get index of first element held in this relationship
			if (
				tempApp[kk].name === tempApp[i].name ||
				tempApp[kk].name === tempApp[i].firstService ||
				tempApp[kk].name === tempApp[i].secondService
			) {
				console.log('first element index is ', kk);
				firstItemIndex = kk;
				break;
			}
		}

		//relationship will now be at the firstElementIndex
		let temp1 = tempApp[firstItemIndex];
		tempApp[firstItemIndex] = tempApp[i];
		tempApp[i] = temp1;

		//find the index of the first service, swap it to be next to the relationship
		for (let kk = 0; kk < tempApp.length; kk++) {
			if (tempApp[kk].name === tempApp[firstItemIndex].firstService) {
				let temp2 = tempApp[firstItemIndex + 1];
				tempApp[firstItemIndex + 1] = tempApp[kk];
				tempApp[kk] = temp2;
				break;
			}
		}

		//find the index of the second service, swap it to be next first service
		for (let kk = 0; kk < tempApp.length; kk++) {
			if (tempApp[kk].name === tempApp[firstItemIndex].secondService) {
				let temp3 = tempApp[firstItemIndex + 2];
				tempApp[firstItemIndex + 2] = tempApp[kk];
				tempApp[kk] = temp3;
				break;
			}
		}

		return tempApp;
	};

	/*
	 *
	 *
	 *
	 *
	 *
	 *
	 * REGION FOR RELATIONSHIPS
	 *
	 *
	 */
	const handleStartRelationships = (dragEvent, dragData) => {
		//When dragging starts, use this to get the index of the dragged relationship element so it can be used to set the elements position
		let tempID = dragEvent.target.id.replace('relationship', '');

		if (isNaN(tempID)) {
			setDraggedRelationshipIndex(-1);
		} else {
			setDraggedRelationshipIndex(tempID); //get the relationship index and set it here
		}
	};

	const handleStopRelationships = (dragEvent, dragData) => {
		//console.log(dragEvent.target.id); //THIS CONTAINS THE ELEMENT INDEX THAT WAS DRAGGED
		let tempRelationshipPosition = [...relationshipPositions];

		let tempID = dragEvent.target.id.replace('relationship', '');
		//console.log("tempID is ", tempID);
		//if the hovered element ID is a number (meaning one of the set spots was not hovered) return (NOTE null is a number)
		if (!isNaN(tempID) || draggedRelationshipIndex === -1) {
			return;
		}
		//console.log(dragEvent.target.id);

		//get hovered element and its positioning
		let hoveredElement = document.getElementById(dragEvent.target.id);
		let domRect = hoveredElement.getBoundingClientRect();
		let hoveredPositions = getAbsolutePosition(hoveredElement);
		hoveredElement = document.getElementById(dragEvent.target.id);

		//check again that dragging was inside of bounds of a DragSpot
		if (
			dragEvent.x > domRect.left &&
			dragEvent.x < domRect.right &&
			dragEvent.y > domRect.top &&
			dragEvent.y < domRect.bottom
		) {
			//gets element that was dragged
			let selectedRelationshipElement = document.getElementById(
				'relationship' + draggedRelationshipIndex
			);
			let selectedPositions = getAbsolutePosition(selectedRelationshipElement);

			//set the position of the draggable to be equal to the difference between the absolute positions of the spot and the service
			let calculatedPosition = {
				x: Math.trunc(hoveredPositions.x - selectedPositions.x),
				y: Math.trunc(hoveredPositions.y - selectedPositions.y),
			};

			//Gets the index from the hoveredElements ID
			let hoveredElementIndex = dragEvent.target.id.replace('dragSpot', '');

			if (isDragSpotOccupied[hoveredElementIndex]) {
				return;
			} //If the spot is not already occupied, fill in the relationship name as the element

			hoveredElement.style.opacity = '0'; //hides desired spot
			tempRelationshipPosition[draggedRelationshipIndex] = calculatedPosition; //set new position of relationship

			//update occupied array to show spot as occupied
			let tempOccupiedArray = [...isDragSpotOccupied];
			//console.log("dragged index is", draggedServiceIndex);
			tempOccupiedArray[hoveredElementIndex] =
				relationships[draggedRelationshipIndex].name; //set occupied array slot equal to name of service for use in creation of App
			setIsDragSpotOccupied(tempOccupiedArray);
		}
		//set the position state
		setRelationshipPositions(tempRelationshipPosition);
	};

	/*
	 *
	 *
	 * REGION FOR SERVICES
	 *
	 *
	 */

	const handleStartServices = (dragEvent, dragData) => {
		//When dragging starts, use this to get the index of the dragged element so it can be used to set the elements position
		if (isNaN(dragEvent.target.id)) {
			setDraggedServiceIndex(-1);
		} else {
			setDraggedServiceIndex(dragEvent.target.id);
		}
	};

	const handleStopServices = (dragEvent, dragData) => {
		//console.log("target id is", dragEvent.target.id);
		//console.log("Target is ", dragEvent.target);

		//if the hovered element ID is a number (meaning one of the set spots was not hovered) return (NOTE null is a number)
		if (
			!isNaN(dragEvent.target.id) ||
			draggedServiceIndex === -1 ||
			dragEvent.target.id.includes('relationship')
		) {
			return;
		}

		let hoveredElement = document.getElementById(dragEvent.target.id);
		let domRect = hoveredElement.getBoundingClientRect();
		let hoveredPositions = getAbsolutePosition(hoveredElement);
		hoveredElement = document.getElementById(dragEvent.target.id);

		let tempPosition = [...servicePositions];
		//NOTE: this has weird behavior with grid columns and does not work fully with them
		//NOTE dragEvent holds data about x and y positions off the whole screen while dragData holds x and y info relative to individual element
		//check if service was dragged into spot
		if (
			dragEvent.x > domRect.left &&
			dragEvent.x < domRect.right &&
			dragEvent.y > domRect.top &&
			dragEvent.y < domRect.bottom
		) {
			//gets element that was dragged
			let selectedElement = document.getElementById(draggedServiceIndex);
			let selectedPositions = getAbsolutePosition(selectedElement);

			//set the position of the draggable to be equal to the difference between the absolute positions of the spot and the service
			let calculatedPosition = {
				x: Math.trunc(hoveredPositions.x - selectedPositions.x),
				y: Math.trunc(hoveredPositions.y - selectedPositions.y),
			};

			//Gets the index from the hoveredElements ID
			let elementIndex = dragEvent.target.id.replace('dragSpot', '');
			//console.log(elementIndex);

			//check if service or relationship occupies this spot already
			if (isDragSpotOccupied[elementIndex]) {
				return;
			}

			hoveredElement.style.opacity = '0'; //hides desired spot
			tempPosition[draggedServiceIndex] = calculatedPosition; //set new position of service

			//update occupied array to show spot as occupied
			let tempOccupiedArray = [...isDragSpotOccupied];
			//console.log("dragged index is", draggedServiceIndex);
			tempOccupiedArray[elementIndex] = services[draggedServiceIndex].name; //set occupied array slot equal to name of service for use in creation of App
			setIsDragSpotOccupied(tempOccupiedArray);

			//console.table(isDragSpotOccupied);
		}

		//console.table(tempPosition);
		setServicePositions(tempPosition);
	};

	/*
	 *
	 *
	 * REGION FOR HELPER FUNCTIONS
	 *
	 *
	 */

	const getAbsolutePosition = (element) => {
		if (element === null || element === undefined) {
			return { x: 0, y: 0 };
		}

		let top = 0,
			left = 0;
		do {
			top += element.offsetTop || 0;
			left += element.offsetLeft || 0;
			element = element.offsetParent;
		} while (element);

		return { x: left, y: top };
	};

	const parseInputName = (inputString) => {
		let firstQuoteIndex = inputString.indexOf('"');
		let lastQuoteIndex = inputString.indexOf('"', firstQuoteIndex + 1);
		let inputName = inputString.substring(firstQuoteIndex + 1, lastQuoteIndex);
		inputName = inputName.replace(/\s/g, ''); //remove any spaces
		return inputName;
	};

	const parseAPIstring = (APIString, index) => {
		let firstBracketIndex = APIString.indexOf('[');
		let lastBracketIndex = APIString.indexOf(']');

		//console.log("first bracket index", firstBracketIndex, lastBracketIndex, index);
		let innerString = APIString.substring(
			firstBracketIndex + 1,
			lastBracketIndex
		);
		//console.log(innerString);

		let inputUI = <div />;
		if (innerString.includes('|')) {
			//two inputs
			let firstInputName = parseInputName(innerString);
			let logicalOrIndex = innerString.indexOf('|');
			let secondInputName = parseInputName(
				innerString.substring(logicalOrIndex)
			);
			inputUI = (
				<Row>
					<input
						className="inputClass"
						id={firstInputName}
						placeholder={firstInputName}
					/>
					<input
						className="inputClass"
						id={secondInputName}
						placeholder={secondInputName}
					/>{' '}
				</Row>
			);
		} else if (innerString.includes('"')) {
			//one input
			let inputName = parseInputName(innerString);
			//console.log(inputName);
			inputUI = (
				<input className="inputClass" id={inputName} placeholder={inputName} />
			);
		} else {
			//no inputs
		}

		return inputUI;
	};

	const parseRelationship = (relationship, index) => {
		//CHECK IF RELATIONSHIP IS A CONTROL RELATIONSHIP AND ADD THE NEEDED UI ELEMENTS
		let conditionID = 'relationship' + index + 'condition';
		let valueID = 'relationship' + index + 'value';

		let UIelement = <div />;
		if (relationship.type === 'control') {
			UIelement = (
				<div>
					<input
						className="controlInput"
						id={conditionID}
						placeholder=" IF (>,<,=)"
					/>
					<input className="controlInput" id={valueID} placeholder="value" />
				</div>
			);
		}

		return UIelement;
	};

	const getNumOutputs = (service) => {
		let firstParenthesisIndex = service.APIstring.indexOf('(');
		let lastParenthesisIndex = service.APIstring.indexOf(')');
		//console.log(service);
		//console.log("first bracket index", firstParenthesisIndex, lastParenthesisIndex);
		let innerString = service.APIstring.substring(
			firstParenthesisIndex + 1,
			lastParenthesisIndex
		);
		//console.log(innerString);

		let commaCount = 0; //count the number of commas in a service API string to determine the number of inputs
		for (let position = 0; position < innerString.length; position++) {
			if (innerString.charAt(position) === ',') commaCount++;
		}

		if (commaCount < 1) return 0;
		else if (commaCount === 2) return 1;
		else if (commaCount > 2) return 2;
	};

	/*
	 *
	 *
	 * REGION FOR RENDERED ELEMENTS
	 *
	 *
	 */

	const renderedRelationships =
		relationships.length > 0 ? (
			relationships.map((r, index) => {
				let newID = 'relationship' + index;
				return (
					<Draggable
						position={relationshipPositions[index]}
						nodeRef={nodeRef}
						onStop={handleStopRelationships}
						onStart={handleStartRelationships}
					>
						<div id={newID} className="drag-wrapperR" ref={nodeRef}>
							<div id={newID}>{r.name}</div>
							<Row className="relationshipRow" id={newID}>
								<div id={newID} className="relationshipChild">
									{r.type}:{' '}
								</div>
								<div id={newID} className="relationshipChild">
									{' '}
									{r.firstService}
								</div>
								<div className="relationshipChild"> - </div>
								<div id={newID} className="relationshipChild">
									{r.secondService}
								</div>
							</Row>
							<Row className="controlRow" id={newID}>
								{parseRelationship(r, index)}
							</Row>
						</div>
					</Draggable>
				); //MUST SET ID AS INDEX ON ALL INNER ELEMENTS SO THAT NO MATTER WHERE IT IS DRAGGED FROM, IT WILL SHOW THE SAME ID
			})
		) : (
			<></>
		);

	const renderedServices =
		services.length > 0 ? (
			services.map((c, index) => {
				return (
					<Draggable
						position={servicePositions[index]}
						nodeRef={nodeRef}
						onStart={handleStartServices}
						onStop={handleStopServices}
					>
						<div id={index} className="drag-wrapper" ref={nodeRef}>
							<p id={index}>{c.name}</p>
							<div id={index} className="inputDiv">
								{parseAPIstring(c.APIstring, index)}
							</div>
						</div>
					</Draggable>
				); //MUST SET ID AS INDEX ON ALL INNER ELEMENTS SO THAT NO MATTER WHERE IT IS DRAGGED FROM, IT WILL SHOW THE SAME ID
			})
		) : (
			<></>
		);

	return (
		<div>
			<Row className="show-Grid">
				<Col md={3} lg={3} xl={3} className="serviceColClass">
					<h1 style={{ color: '#61dafb' }}>Services</h1>
					<button onClick={getServices}>Get New Services</button>
					<div className="dragSpotDiv">{renderedServices}</div>
				</Col>
				<Col md={6} lg={6} xl={6} style={{ background: 'none' }}>
					<h1 style={{ color: '#61dafb' }}>App Editor</h1>
					<button onClick={addSpot}>Add New Spot</button>
					<button onClick={clearEditor}>Clear Editor</button>
					<button onClick={(e) => createApp(e)}>Finalize App</button>

					<div className="dragSpotDiv">{renderedDragSpots}</div>
					<h1 className="errorLabel" id="statusLabel"></h1>
					<Row className="inputDiv">
						<h1>App Name: </h1>
						<input
							className="appNameInput"
							id="appName"
							placeholder="Enter your app name"
						/>
					</Row>
				</Col>
				<Col md={3} lg={3} xl={3} className="relationshipColClass">
					<h1 style={{ color: '#61dafb' }}>Relationships</h1>
					<button onClick={getRelationships}>Get New Relationships</button>
					<div className="dragSpotDiv">{renderedRelationships}</div>
				</Col>
			</Row>
		</div>
	);
};

export default Recipe;
