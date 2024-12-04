import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { webSocketHandler } from "@/process/middleware/webSocketHandler";
import { URL_SOCKET } from "@/process/constants";
import { REALTIME_STALE_TIME, REALTIME_CACHE_TIME } from "@/process/constants";

// real time react-query handle
const updateQueryData = (queryClient, queryKey, updateFn) => {
    queryClient.setQueryData(queryKey, updateFn, {
        staleTime: REALTIME_STALE_TIME,
        cacheTime: REALTIME_CACHE_TIME,
    });
};


export const useWebSocket = (symbol = "BTCUSDT", interval = "1h") => {
    const queryClient = useQueryClient();
    const wsRef = useRef(null);

    useEffect(() => {
        if (wsRef.current) return;

        const streams = [
            `${symbol.toLowerCase()}@trade`,
            `${symbol.toLowerCase()}@ticker`,
            `${symbol.toLowerCase()}@depth`,
            `${symbol.toLowerCase()}@kline_${interval}`,
        ];
        const url = `${URL_SOCKET}/stream?streams=${streams.join("/")}`;

        wsRef.current = webSocketHandler(url, {
            onMessage: (message) => {
                const data = message.data;

                if (data.e === "trade") {
                    const newTrade = {
                        price: data.p,
                        qty: data.q,
                        time: new Date(data.T),
                        isBuyerMaker: data.m,
                    };
                    updateQueryData(queryClient, ["marketTrades", symbol], (prevTrades = []) => {
                        return [...prevTrades, newTrade].slice(-100); // 최신 100개 데이터만 유지
                    });
                } else if (data.e === "24hrTicker") {
                    const updatedTicker = {
                        symbol: data.s,
                        lastPrice: data.c,
                        priceChange: data.p,
                        priceChangePercent: data.P,
                        highPrice: data.h,
                        lowPrice: data.l,
                        volume: data.v,
                        quoteVolume: data.q,
                        time: new Date().toLocaleTimeString(),
                    };
                    updateQueryData(queryClient, ["ticker", symbol], () => [updatedTicker]);
                } else if (data.e === "depthUpdate" && data.b.length >= 17 && data.a.length >= 17) {
                    updateQueryData(queryClient, ["orderBook", symbol], () => ({
                        bids: data.b.slice(0, 17),
                        asks: data.a.slice(0, 17),
                    }));
                } else if (data.e === "kline") {
                    const candle = data.k;
                    const newPoint = {
                        x: new Date(candle.t),
                        y: [candle.o, candle.h, candle.l, candle.c],
                    };
                    updateQueryData(queryClient, ["tradingData", symbol, interval], (prevData = []) => {
                        const lastPoint = prevData[prevData.length - 1];
                        if (lastPoint?.x.getTime() === newPoint.x.getTime()) return prevData;
                        return [...prevData, newPoint].slice(-200); // 최신 200개 유지
                    });
                }
            },
        });

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [symbol, interval, queryClient]);

    return {}; // WebSocket 데이터를 직접 반환하지 않음 (React Query로 관리)
};
