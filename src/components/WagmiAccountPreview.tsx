import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import type * as AvatarPrimitive from "@radix-ui/react-avatar";
import { Copy, CopyCheck, Loader, LogOut, Wallet, X } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import type { Address } from "viem";
import { useAccount, useBalance, useEnsAvatar, useEnsName } from "wagmi";
import { useAccountActions } from "@/hooks/useAccountActions";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./AlertDialog";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { Button } from "./Button";

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
