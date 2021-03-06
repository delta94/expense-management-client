import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button } from 'antd';
import moment from 'moment';
import swal from 'sweetalert';
import ClipLoader from 'react-spinners/ClipLoader';

import { WalletContext } from '../../contexts/WalletContext';

import expenseApi from '../../api/expenseApi';

import ExpenseModal from '../ExpenseModal/ExpenseModal';

import './AddExpenseModal.css';

function AddExpenseModal() {
	const {
		wallets,
		updateWallet,
		setCurrentWallet,
		setVirtualWallet,
	} = useContext(WalletContext);
	const currentDate = moment();

	// Define state.
	const [date, setDate] = useState(currentDate);
	const [walletName, setWalletName] = useState(null);
	const [isIncome, setIsIncome] = useState(false);
	const [title, setTitle] = useState('');
	const [expense, setExpense] = useState('');
	const [description, setDescription] = useState('');
	const [contentBtn, setContentBtn] = useState('');

	// State for UI.
	const [visible, setVisible] = useState(false);
	const [loading, setLoading] = useState(false);

	// Side effects.
	window.addEventListener('resize', handleContentBtn);

	function handleContentBtn() {
		if (window.innerWidth <= 575.98) {
			setContentBtn('+');
			return;
		}

		setContentBtn('THÊM GIAO DỊCH');
	}

	// Handle content button
	useEffect(() => {
		handleContentBtn();
	}, []);

	useEffect(() => {
		if (wallets && wallets.length > 0) {
			setWalletName(wallets[0].walletName);
		}
	}, [wallets]);

	const addExpenseApi = async () => {
		const data = {
			date,
			walletName,
			isIncome,
			title: title.trim(),
			expense: parseInt(expense),
			description: description.trim(),
		};

		try {
			const { newData, virtualWallet } = await expenseApi.add(data);
			updateWallet(newData);
			setVirtualWallet(virtualWallet);
			setCurrentWallet(newData);

			const successStr = 'Bạn đã thêm giao dịch thành công!';
			swal({
				text: successStr,
				title: 'Xong!',
				icon: 'success',
				button: 'Tiếp tục',
			});
			setTitle('');
			setExpense('');
			setDescription('');
			setLoading(false);
			setVisible(false);
		} catch (error) {
			const errorStr = error.response.data;

			swal({
				text: errorStr,
				title: 'Lỗi!',
				icon: 'warning',
			});
			setLoading(false);
		}
	};

	// Functions for UI.
	const handleOk = async () => {
		const errorStr = 'Vui lòng điền đầy đủ số tiền (ngày, tên) giao dịch.';
		setLoading(true);

		// Validate on client side.
		if (!date || !expense || !title) {
			swal({
				text: errorStr,
				title: 'Lỗi!',
				icon: 'warning',
			});
			setLoading(false);
			return;
		}

		// Call API
		addExpenseApi();
	};

	// Helper functions.
	const changeDateSelect = (date, dateString) => {
		setDate(date);
	};

	const changeWalletSelect = (walletName) => {
		setWalletName(walletName);
	};

	const changeTypeSelect = (type) => {
		const isIncome = type || false;
		setIsIncome(isIncome);
	};

	const handleChangeTitle = (event) => {
		const newTitle = event.target.value;
		setTitle(newTitle);
	};

	const changeExpenseSelect = (event) => {
		if (event.target.value === '') {
			setExpense('');
			return;
		}

		const inputExpense = event.target.validity.valid
			? event.target.value
			: expense;

		setExpense(inputExpense);
	};

	const handleChangeDescription = (event) => {
		const newDescription = event.target.value;
		setDescription(newDescription);
	};

	const showModal = () => {
		if (wallets.length <= 0) {
			setVisible(false);
			swal({
				text: 'Xin hãy tạo ví trước khi sử dụng tính năng này!',
				title: 'Lỗi!',
				icon: 'warning',
			});
			return;
		}
		setVisible(true);
	};

	const handleCancel = () => {
		setVisible(false);
		setTitle('');
		setDescription('');
		setExpense('');
		setLoading(false);
	};

	return (
		<>
			<Button
				type="primary"
				onClick={showModal}
				disabled={!wallets && true}
				style={{
					cursor: !wallets ? 'default' : 'pointer',
				}}
			>
				{wallets ? contentBtn : <ClipLoader size="15px" color="#ffffff" />}
			</Button>
			<Modal
				title="Thêm giao dịch"
				visible={visible}
				onCancel={handleCancel}
				footer={[
					<Button key="back" onClick={handleCancel}>
						Hủy
					</Button>,
					<Button
						key="submit"
						type="primary"
						loading={loading}
						onClick={handleOk}
					>
						Thêm
					</Button>,
				]}
			>
				<ExpenseModal
					expense={expense}
					description={description}
					title={title}
					changeDateSelect={changeDateSelect}
					changeWalletSelect={changeWalletSelect}
					handleChangeTitle={handleChangeTitle}
					changeExpenseSelect={changeExpenseSelect}
					changeTypeSelect={changeTypeSelect}
					handleChangeDescription={handleChangeDescription}
				/>
			</Modal>
		</>
	);
}

export default AddExpenseModal;
