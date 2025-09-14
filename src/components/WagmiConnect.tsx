import { useAccount } from "wagmi";
import { ConnectWallet } from "./ConnectWallet";

export function WagmiConnect() {
	const { isConnected } = useAccount();

	if (!isConnected) {
		return <ConnectWallet />;
	}
}
