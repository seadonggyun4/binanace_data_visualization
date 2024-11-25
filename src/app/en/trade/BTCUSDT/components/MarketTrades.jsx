"use client";

import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";
import { useMarketTradeQuery } from "@/features/marketTrade/hooks/useMarketTradeQuery";
import { useMarketTradeWebSocket } from "@/features/marketTrade/hooks/useMarketTradeWebSocket";
import React, { useMemo, useDeferredValue } from "react";

const MarketTrades = ({ symbol = "BTCUSDT" }) => {
    // 데이터 훅 사용
    const { data: trades, isLoading } = useMarketTradeQuery(symbol);
    useMarketTradeWebSocket(symbol);

    // 컬럼 정의
    const columnHelper = createColumnHelper();
    const columns = [
        columnHelper.accessor("price", {
            header: "Price (USDT)",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("qty", {
            header: "Amount (BTC)",
            cell: (info) => info.getValue(),
            meta: {
                width: "90px", // 너비 설정
            },
        }),
        columnHelper.accessor("time", {
            header: "Time",
            cell: (info) =>
                new Date(info.getValue()).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                }),
        }),
    ];

    // 테이블 데이터 준비
    const formattedTrades = useMemo(() => {
        return (
            trades?.map((trade) => ({
                price: parseFloat(trade.price).toFixed(2),
                qty: parseFloat(trade.qty).toFixed(6),
                time: trade.time,
                isBuyerMaker: trade.isBuyerMaker,
            })) || []
        );
    }, [trades]);

    // useDeferredValue로 데이터 지연 렌더링
    const deferredTrades = useDeferredValue(formattedTrades);

    // React Table 인스턴스 생성
    const table = useReactTable({
        data: formattedTrades,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="overflow-auto h-full px-4">
            <table className="table-fixed w-full text-xs border-collapse">
                {/* 테이블 헤더 */}
                <thead className="sticky top-0 bg-bg dark:bg-dark-bg z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <th
                                key={header.id}
                                className={`${
                                    header.id !== "price"
                                        ? "text-right"
                                        : "text-left"
                                } py-3 text-iconNormal dark:text-dark-iconNormal`}
                                style={{
                                    width:
                                        header.column.columnDef.meta?.width || "auto",
                                }}
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

                {/* 테이블 바디 */}
                <tbody>
                {isLoading ? (
                    <tr>
                        <td colSpan={3} className="text-center py-4">
                            Loading...
                        </td>
                    </tr>
                ) : (
                    table.getRowModel().rows.map((row) => (
                        <tr
                            key={row.id}
                            className={`hover:bg-gray-800 ${
                                row.original.isBuyerMaker
                                    ? "text-error"
                                    : "text-success"
                            }`}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <td
                                    key={cell.id}
                                    className={`${
                                        cell.column.id === "price"
                                            ? "text-left py-1"
                                            : "text-right text-PrimaryText dark:text-dark-PrimaryText py-1"
                                    }`}
                                    style={{
                                        width: cell.column.columnDef.meta?.width || "auto",
                                    }}
                                >
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
};

export default MarketTrades;
