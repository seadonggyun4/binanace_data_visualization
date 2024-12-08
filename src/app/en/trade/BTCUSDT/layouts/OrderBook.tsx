"use client";

import React, { useMemo } from "react";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";
import Card from "@/app/common/elements/Card";
import RealTimePrice from "@/app/en/trade/BTCUSDT/components/RealTimePrice";
import { useOrderBook } from "@/features/orderbook/hooks/useOrderBook";
import { useTicker } from "@/features/ticker/hooks/useTicker";
import { useTradingContext } from "@/app/en/trade/BTCUSDT/provider/TradingContext";

// 타입 정의
type Order = [string, string]; // [price, amount]
interface FormattedOrder {
    price: string;
    amount: string;
    total: string;
}

const OrderBook: React.FC = () => {
    const { symbol } = useTradingContext();

    // 데이터 훅
    const { data: queryData, isLoading } = useOrderBook(symbol);
    const { data: priceData = [], isLoading: priceLoading } = useTicker(symbol);

    // Query 및 WebSocket 데이터
    const bids: Order[] = useMemo(() => queryData?.bids || [], [queryData]);
    const asks: Order[] = useMemo(() => queryData?.asks || [], [queryData]);

    // 데이터 포맷팅 함수
    const formatOrderData = (orders: Order[]): FormattedOrder[] => {
        let total = 0;
        return orders.map(([price, amount]) => {
            total += parseFloat(price) * parseFloat(amount);
            return {
                price: parseFloat(price).toFixed(2),
                amount: parseFloat(amount).toFixed(6),
                total: total.toFixed(2),
            };
        });
    };

    const formattedBids = useMemo(() => formatOrderData(bids), [bids]);
    const formattedAsks = useMemo(() => formatOrderData(asks), [asks]);

    // 구매 및 판매 주문량 계산
    const totalBuyVolume = useMemo(
        () => bids.reduce((acc, [, amount]) => acc + parseFloat(amount), 0),
        [bids]
    );
    const totalSellVolume = useMemo(
        () => asks.reduce((acc, [, amount]) => acc + parseFloat(amount), 0),
        [asks]
    );
    const totalVolume = totalBuyVolume + totalSellVolume;

    const buyPercentage = ((totalBuyVolume / totalVolume) * 100).toFixed(2);
    const sellPercentage = ((totalSellVolume / totalVolume) * 100).toFixed(2);

    // React Table 설정
    const columnHelper = createColumnHelper<FormattedOrder>();
    const columns = [
        columnHelper.accessor("price", {
            header: "Price (USDT)",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("amount", {
            header: "Amount (BTC)",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("total", {
            header: "Total",
            cell: (info) => info.getValue(),
        }),
    ];

    const sellTable = useReactTable({
        data: formattedAsks,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const buyTable = useReactTable({
        data: formattedBids,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <Card>
            <div className="py-1 h-full min-h-96">
                <div className="px-6 py-2 border-b border-b-light-line dark:border-b-dark-line">
                    <h2 className="text-light-primaryText dark:text-dark-primaryText font-bold text-sm">
                        Order Book
                    </h2>
                </div>
                {isLoading ? (
                    "Loading..."
                ) : (
                    <div className="px-6">
                        {/* Sell Orders */}
                        <table className="table-fixed w-full text-xs">
                            <thead>
                            {sellTable.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className={`${
                                                header.id !== "price"
                                                    ? "text-right"
                                                    : "text-left"
                                            } py-3 text-light-iconNormal dark:text-dark-iconNormal`}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                            </thead>
                            <tbody>
                            {sellTable.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-800">
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className={
                                                cell.column.id === "price"
                                                    ? `text-error text-left py-1`
                                                    : "text-primaryText dark:text-dark-primaryText text-right py-1"
                                            }
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        <div className="flex items-center space-x-2 my-2">
                            <RealTimePrice
                                price={
                                    priceLoading
                                        ? "0"
                                        : parseFloat(priceData[0]?.lastPrice || "0").toFixed(2)
                                }
                                showIcon={true}
                            />
                            <span className="text-sm text-light-iconNormal dark:text-dark-iconNormal">
                                $
                                {priceLoading
                                    ? ""
                                    : parseFloat(priceData[0]?.lastPrice || "0").toFixed(2)}
                            </span>
                        </div>

                        {/* Buy Orders */}
                        <table className="table-fixed w-full text-xs">
                            <thead>
                            {buyTable.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className={`${
                                                header.id !== "price"
                                                    ? "text-right"
                                                    : "text-left"
                                            } py-3 text-light-iconNormal dark:text-dark-iconNormal`}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                            </thead>
                            <tbody>
                            {buyTable.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-800">
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className={
                                                cell.column.id === "price"
                                                    ? `text-success text-left py-1`
                                                    : "text-light-primaryText dark:text-dark-primaryText text-right py-1"
                                            }
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {/* 막대 그래프 */}
                        <div className="flex items-center justify-between text-xs my-3">
                            <div className="w-16 text-light-primaryText dark:text-dark-primaryText">
                                B
                                <span className="text-success ml-1">{buyPercentage}%</span>
                            </div>
                            <div className="w-32 h-1 flex items-center rounded overflow-hidden">
                                <div
                                    className="bg-success h-full"
                                    style={{
                                        width: `${buyPercentage}%`,
                                    }}
                                />
                                <div
                                    className="bg-error h-full"
                                    style={{
                                        width: `${sellPercentage}%`,
                                    }}
                                />
                            </div>
                            <div className="text-right w-16 text-light-primaryText dark:text-dark-primaryText">
                                <span className="text-error mr-1">{sellPercentage}%</span>
                                S
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default OrderBook;
