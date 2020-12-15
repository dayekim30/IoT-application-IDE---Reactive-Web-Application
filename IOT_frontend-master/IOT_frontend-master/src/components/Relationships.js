import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Helper from '../services/Helper';

import './relationships.css';
import Drive from '../img/Drive.png';
import Contest from '../img/Contest.png';
import Control from '../img/Control.png';
import Extend from '../img/Extend.png';
import Interfere from '../img/Interfere.png';
import Support from '../img/Support.png';

const Relationships = () => {
	const [relationships, setRelationships] = useState([]);
	const [imgSrc, setImgSrc] = useState('');

	const getRelationships = () => {
		axios
			.get(Helper.getURL() + '/getrelationships')
			.then((res) => {
				console.log(res.data);
				let temp = relationships;
				temp = [...res.data];
				setRelationships(temp);
				dropBox(temp);
				selectedThing(temp);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	useEffect(() => {
		getRelationships();
	}, []);

	//relationship interfere lists-------------------------------------------------------------------------------------------------------

	//dropbox - select option generator from relationships

	const dropBox = (r) => {
		//clear all options in dropbox
		document.getElementById('mySelect').options.length = 0;

		//set defalut option - All things
		var x = document.getElementById('mySelect');
		var def = document.createElement('option');
		def.text = 'All Things';
		x.add(def);

		//remove all dupilicates
		var arr = r.map((a) => {
			return a.thingID;
		});
		var unique = arr.filter(function (item, pos) {
			return arr.indexOf(item) === pos;
		});
		//generate options for dropbox
		for (var i = 0; i < unique.length; i++) {
			var option = document.createElement('option');
			option.text = unique[i];
			x.add(option);
		}
	};

	//Upload pictures
	const getPics = (i) => {
		var image = document.getElementById('picture');
		switch (i) {
			case 1:
				setImgSrc(Drive);
				break;
			case 2:
				setImgSrc(Control);
				break;
			case 3:
				setImgSrc(Support);
				break;
			case 4:
				setImgSrc(Extend);
				break;
			case 5:
				setImgSrc(Contest);
				break;
			case 6:
				setImgSrc(Interfere);
				break;
			default:
				setImgSrc('https://semantic-ui.com/images/wireframe/image.png');
				break;
		}
	};

	// filtering thing ID
	const selectedThing = (r) => {
		if (relationships.length > 0) {
			r = relationships;
		}
		console.log(r);
		var x = document.getElementById('mySelect');
		var i = x.options[x.selectedIndex].text;
		if (i !== 'All Things') {
			var tamp = r
				.filter((b) => b.thingID === i)
				.map((a) => {
					return (
						<tr className="row100 body" key={a.name}>
							<td className="cell100 column2">{a.thingID}</td>
							<td className="cell100 column3">{a.type}</td>
							<td className="cell100 column4">{a.firstService}</td>
							<td className="cell100 column5">{a.secondService}</td>
						</tr>
					);
				});
			//var t1 = document.getElementById("selected-relationships");
			console.log(tamp.length);
			ReactDOM.render(tamp, document.getElementById('tamp-relationships'));
		} else {
			var tamp1 = r.map((c) => {
				return (
					<tr className="row100 body" key={c.name}>
						<td className="cell100 column2">{c.thingID}</td>
						<td className="cell100 column3">{c.type}</td>
						<td className="cell100 column4">{c.firstService}</td>
						<td className="cell100 column5">{c.secondService}</td>
					</tr>
				);
			});
			console.log(tamp1.length);
			ReactDOM.render(tamp1, document.getElementById('tamp-relationships'));
		}
		//testelement=test(i);
		//document.getElementById("selected-relationships")=t1;
		//alert(t1);
	};

	return (
		<div className="main">
			<button className="ui button" onClick={getRelationships}>
				Get New Relationships
			</button>
			<br />
			<br />
			<div className="headline">
				{/* <div className="hline1">Hoverable Table</div> */}
				{/* <button className="click" onClick={dropBox}>
					Load Relationships
				</button> */}
				Filter:{' '}
				<div class="menu">
					<select
						class="select"
						id="mySelect"
						onChange={selectedThing}
					></select>
				</div>
				<div className="right-align">
					<button className="ui button" onClick={() => getPics(1)}>
						Drive
					</button>
					<button className="ui button" onClick={() => getPics(2)}>
						Control
					</button>
					<button className="ui button" onClick={() => getPics(3)}>
						Support
					</button>
					<button className="ui button" onClick={() => getPics(4)}>
						Extend
					</button>
					<button className="ui button" onClick={() => getPics(5)}>
						Contest
					</button>
					<button className="ui button" onClick={() => getPics(6)}>
						Interfere
					</button>
				</div>
			</div>
			<div style={{ display: 'flex' }}>
				<div className="table">
					<table className="tables">
						<tr>
							<th>Thing ID</th>
							<th>Relationship</th>
							<th>First Service</th>
							<th>Second Service</th>
						</tr>
						<tbody id="tamp-relationships"></tbody>
					</table>
				</div>

				<div className="type-display">
					<div className="type-element">
						{/* <div className="type-element-relation"></div> */}
						{/* <div className="type-element-picture"> */}
						{imgSrc !== '' ? (
							<img src={imgSrc} className="pics" id="picture" alt="My Pic" />
						) : (
							''
						)}
						{/* </div> */}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Relationships;
