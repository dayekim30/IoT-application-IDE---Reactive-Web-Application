import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ModalPopUp = ({ s, handleClose, logOutput }) => {
	const renderLines =
		logOutput.length > 0
			? logOutput.map((c) => {
					return <div key={c}>{c}</div>;
			  })
			: '';
	return (
		<>
			<Modal show={s} onHide={handleClose}>
				<Modal.Header closeButton>
					<Modal.Title>Log</Modal.Title>
				</Modal.Header>
				<Modal.Body>{renderLines}</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleClose}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default ModalPopUp;
