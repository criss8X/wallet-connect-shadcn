import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import type * as AvatarPrimitive from "@radix-ui/react-avatar";
import { Copy, CopyCheck, Loader, LogOut, Wallet, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Address } from "viem";
import {
	type Connector,
	useAccount,
	useBalance,
	useConnectors,
	useEnsAvatar,
	useEnsName,
} from "wagmi";
import { useAccountActions } from "@/hooks/useAccountActions";
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
			<Button>
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

const ACTION_CARD_CLASS =
	"select-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer w-full h-16 gap-1 hover:bg-accent/90 bg-accent/50 rounded-md flex items-center justify-center flex-col [&_svg]:size-5";

export function WagmiAccount({
	address,
	children,
}: {
	address: Address;
	children: React.ReactNode;
}) {
	const { handleCopyToClipboard, handleDisconnect, isCopied } =
		useAccountActions();

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

			<AlertDialogContent className="sm:max-w-xs gap-0">
				<AlertDialogHeader>
					<AlertDialogTitle hidden>Account Details</AlertDialogTitle>

					<AlertDialogDescription hidden>
						Details of account {address}
					</AlertDialogDescription>

					<AlertDialogPrimitive.AlertDialogCancel asChild>
						<Button size="icon" variant="ghost" className="ml-auto">
							<X />
						</Button>
					</AlertDialogPrimitive.AlertDialogCancel>
				</AlertDialogHeader>

				<div className="flex flex-col items-center gap-3 text-foreground">
					<Avatar className="size-16">
						<AccountAvatarImage address={address} />

						<AvatarFallback>
							<Wallet />
						</AvatarFallback>
					</Avatar>

					<div className="flex flex-col items-center">
						<span className="opacity-80">{truncateAddress(address)}</span>

						<AccountBalance as="h1" />
					</div>
				</div>

				<AlertDialogFooter className="w-full flex gap-4 justify-between mt-4">
					<button
						type="button"
						className={ACTION_CARD_CLASS}
						onClick={handleCopyToClipboard}
					>
						{isCopied ? <CopyCheck /> : <Copy />}

						<span className="text-xs">Copy Address</span>
					</button>

					<button
						type="button"
						className={ACTION_CARD_CLASS}
						onClick={handleDisconnect}
					>
						<LogOut className="size-5" />

						<span className="text-xs">Disconnect</span>
					</button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export type AccountAvatarImageProps = Omit<
	React.ComponentProps<typeof AvatarPrimitive.Image>,
	"children" | "asChild"
> & {
	address: Address;
	defaultAvatarUrl?: string | undefined;
};

export function AccountAvatarImage({
	className = "size-5",
	address,
	defaultAvatarUrl = `https://effigy.im/a/${address}.svg`,
	...props
}: AccountAvatarImageProps) {
	const { data: ensName } = useEnsName({
		address,
		query: { select: (data) => data ?? undefined },
	});

	const { data: ensAvatar } = useEnsAvatar({
		name: ensName,
		query: {
			enabled: ensName !== undefined,
			select: (data) => data ?? undefined,
		},
	});

	return <AvatarImage {...props} src={ensAvatar ?? defaultAvatarUrl} />;
}

export type AccountBalanceProps<T extends React.ElementType> = {
	as?: T;
	className?: string;
} & React.ComponentPropsWithoutRef<T>;

export function AccountBalance<T extends React.ElementType = "span">({
	className = "font-medium text-lg",
	as: Component,
	...props
}: AccountBalanceProps<T>) {
	const { address } = useAccount();

	const { data, isLoading, error, isError } = useBalance({
		address,
		query: { enabled: address !== undefined },
	});

	const Comp = Component ?? "span";

	useEffect(() => {
		if (!isError) {
			return;
		}

		toast.error("Error obtaining balance, reload the page", {
			dismissible: true,
		});

		console.error("Error obtaining balance", error);
	}, [isError, error]);

	return (
		<Comp className={className} {...props}>
			{isLoading ? (
				<Loader className="animate-spin" />
			) : isError || data === undefined ? (
				"Err"
			) : (
				`${data.formatted} ${data.symbol}`
			)}
		</Comp>
	);
}

export function truncateAddress(address: Address): string {
	const start = address.slice(0, 4);
	const end = address.slice(-10, -1);

	return `${start}...${end}`;
}
