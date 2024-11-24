import React, { useState } from "react";
import PriceInput from "@/app/common/elements/PriceInput";
import { useSymbolPrice } from "@/features/symbolPrice/hooks/useSymbolPrice";

export default function Spot() {
    const [priceBuy, setPriceBuy] = useState(0);
    const [priceSell, setPriceSell] = useState(0);

    const { data: price, isLoading } = useSymbolPrice("BTCUSDT");

    React.useEffect(() => {
        if (!isLoading && price){
            setPriceBuy(price);
            setPriceSell(price);
        }
    }, [price]);

    return (
        <form className="flex w-full h-full px-4 space-x-6">
            {/* Buy Section */}
            <div className="flex flex-col justify-center w-full space-y-6">
                <PriceInput
                    placeholder="Price"
                    unit="USDT"
                    value={priceBuy}
                    onChange={setPriceBuy}
                />
                <PriceInput
                    placeholder="Amount"
                    unit="BTC"
                />
                <div className="w-full">
                    <div className="flex items-center w-full justify-between">
                        <span className="text-sm text-iconNormal dark:text-dark-iconNormal">Avbl</span>
                        <p className="text-sm text-PrimaryText dark:text-dark-PrimaryText">- USDT</p>
                    </div>
                    <div className="flex items-center w-full justify-between">
                        <span className="text-sm text-iconNormal dark:text-dark-iconNormal">Max Buy</span>
                        <p className="text-sm text-PrimaryText dark:text-dark-PrimaryText">-- BTC</p>
                    </div>
                </div>
                <button
                    className="w-full bg-buy text-dark-PrimaryText font-semibold py-2 px-3 rounded-md hover:opacity-80 transition duration-200"
                >
                    Log In
                </button>
            </div>

            {/* Sell Section */}
            <div className="flex flex-col justify-center w-full space-y-6">
                <PriceInput
                    placeholder="Price"
                    unit="USDT"
                    value={priceSell}
                    onChange={setPriceSell}
                />
                <PriceInput
                    placeholder="Amount"
                    unit="BTC"
                />
                <div className="w-full">
                    <div className="flex items-center w-full justify-between">
                        <span className="text-sm text-iconNormal dark:text-dark-iconNormal">Avbl</span>
                        <p className="text-sm text-PrimaryText dark:text-dark-PrimaryText">- USDT</p>
                    </div>
                    <div className="flex items-center w-full justify-between">
                        <span className="text-sm text-iconNormal dark:text-dark-iconNormal">Max Sell</span>
                        <p className="text-sm text-PrimaryText dark:text-dark-PrimaryText">-- BTC</p>
                    </div>
                </div>
                <button
                    className="w-full bg-sell text-dark-PrimaryText font-semibold py-2 px-3 rounded-md hover:opacity-80 transition duration-200"
                >
                    Log In
                </button>
            </div>
        </form>
    );
}
