import { appKit } from './appKit';

export function useWalletState() {
	let isWalletConnected = $state(appKit.getIsConnectedState());
	let walletInfo = $state(appKit.getWalletInfo());
	let address = $state(appKit.getAddress());

	$effect(() => {
		appKit.subscribeAccount((e) => {
			isWalletConnected = e.isConnected;
			address = e.address;
		});
		appKit.subscribeWalletInfo((e) => {
			walletInfo = e;
		});
	});

	return {
		get isWalletConnected() {
			return isWalletConnected;
		},
		get walletInfo() {
			return walletInfo;
		},
		get address() {
			return address;
		}
	};
}
