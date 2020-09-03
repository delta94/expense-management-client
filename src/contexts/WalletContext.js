import React, { useEffect, useState } from 'react';
import moment from 'moment';

import walletApi from '../api/walletApi';

export const WalletContext = React.createContext();

const calculateFlow = (transactions) => {
	let inflow = 0;
	let outflow = 0;
	transactions.forEach((transaction) => {
		transaction.expenses.forEach((expense) => {
			if (expense.isIncome) {
				inflow += expense.expense;
			}
			if (!expense.isIncome) {
				outflow += expense.expense;
			}
		});
	});
	return { inflow, outflow };
};

export const WalletProvider = (props) => {
	const [wallets, setWallets] = useState(null);
	const [currentWallet, setCurrentWallet] = useState(null);

	useEffect(() => {
		const getWalletsUser = async () => {
			try {
				const { wallets: gotWallets, virtualWallet } = await walletApi.get();
				setWallets(gotWallets);
				setCurrentWallet(virtualWallet);
			} catch (error) {
				console.log(error);
			}
		};

		getWalletsUser();
	}, []);

	const updateWallet = (updatedWallet) => {
		const newWallets = [...wallets];
		const walletIndex = newWallets.findIndex(
			(wallet) => wallet.walletName === updatedWallet.walletName
		);
		newWallets.splice(walletIndex, 1, updatedWallet);
		setWallets(newWallets);
	};

	const getExpenseOfMonth = (date) => {
		console.log(date);

		if (currentWallet) {
			if (!date) {
				let total = currentWallet.accountBalance;
				const { inflow, outflow } = calculateFlow(currentWallet.transactions);
				return { total, inflow, outflow };
			} else {
				let total = 0;

				const transactionsOfMonth = currentWallet.transactions.filter(
					(transaction) => {
						return (
							moment(transaction.date).format('MM/YYYY') ===
							moment(date).format('MM/YYYY')
						);
					}
				);

				const { inflow, outflow } = calculateFlow(transactionsOfMonth);
				total = inflow + outflow;

				return { total, inflow, outflow };
			}
		}
	};

	return (
		<WalletContext.Provider
			value={{
				wallets,
				currentWallet,
				getExpenseOfMonth,
				updateWallet,
			}}
		>
			{props.children}
		</WalletContext.Provider>
	);
};
