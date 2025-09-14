import { Wallet } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { type Connector, useAccount, useConnectors } from "wagmi";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./AlertDialog";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { Button } from "./Button";
import {
	AccountAvatarImage,
	AccountBalance,
	truncateAddress,
	WagmiAccount,
} from "./WagmiAccountPreview";

export function ConnectWallet() {
	const { address } = useAccount();

	if (address !== undefined) {
		return (
			<WagmiAccount address={address}>
				<Button className="w-max px-0.5 py-0.5" variant="outline">
					<AccountBalance className="leading-relaxed ml-1.5 mr-1" />

					<div className="flex gap-2 items-center bg-accent px-1.5 size-full rounded-md">
						<Avatar className="size-5">
							<AccountAvatarImage address={address} />

							<AvatarFallback className="bg-transparent">
								<Wallet />
							</AvatarFallback>
						</Avatar>

						<span className="leading-relaxed">{truncateAddress(address)}</span>
					</div>
				</Button>
			</WagmiAccount>
		);
	}

	return (
		<ConnectWalletDialog>
			<Button
				aria-label="Open wallet list modal"
				title="Open wallet list modal"
			>
				<Wallet />

				<span className="leading-relaxed">Connect Wallet</span>
			</Button>
		</ConnectWalletDialog>
	);
}

function ConnectWalletDialog({ children }: { children: React.ReactNode }) {
	const connectors = useConnectors();

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Pick Wallet</AlertDialogTitle>

					<AlertDialogDescription>
						Select your preferred wallet provider from the available wallet
						list.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="p-0.5 grid grid-cols-1 md:grid-cols-2 max-h-40 md:max-h-72 gap-4 overflow-y-auto">
					{connectors.map((connector) => (
						<WalletConnectorCard key={connector.id} connector={connector} />
					))}
				</div>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function WalletConnectorCard({ connector }: { connector: Connector }) {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		(async () => {
			const provider = await connector.getProvider();

			setReady(!!provider);
		})();
	}, [connector]);

	return (
		<button
			type="button"
			className="bg-muted dark:bg-card h-30 border hover:bg-muted-foreground/15 dark:hover:bg-foreground/10 transition-colors focus:outline-2 disabled:opacity-50 dark:hover:disabled:bg-card hover:disabled:bg-muted disabled:cursor-not-allowed"
			title={
				!ready
					? `${connector.name} not available`
					: `Connect with ${connector.name}`
			}
			disabled={!ready}
			onClick={() => connector.connect()}
		>
			<div className="flex flex-col gap-2 items-center justify-center">
				<Avatar className="size-8">
					<AvatarImage src={connector.icon} alt={`Logo of ${connector.name}`} />

					<AvatarFallback className="bg-transparent">
						<Wallet />
					</AvatarFallback>
				</Avatar>

				<span>{connector.name}</span>
			</div>
		</button>
	);
}
