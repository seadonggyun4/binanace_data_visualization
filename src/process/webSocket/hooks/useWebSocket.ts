import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { webSocketHandler } from "@/process/middleware/webSocketHandler";
import { URL_SOCKET } from "@/process/constants";
import { updateTicker } from "@/features/ticker/hooks/useTicker";
import { updateMarketTrade } from "@/features/marketTrade/hooks/useMarketTrade";
import { updateOrderBook } from "@/features/orderbook/hooks/useOrderBook";
import { updateTradingChart } from "@/features/tradingChart/hooks/useTradingChart";
import { useToast } from "@/app/common/provider/ToastContext";

export const useWebSocket = (symbol: string, interval: string): (() => void) => {
    const wsRef = useRef<WebSocket | null>(null);

    const { showToast } = useToast();
    const queryClient = useQueryClient();

    useEffect(() => {
        const connectWebSocket = () => {
            const streams = [
                `${symbol.toLowerCase()}@trade`,
                `${symbol.toLowerCase()}@ticker`,
                `${symbol.toLowerCase()}@depth`,
                `${symbol.toLowerCase()}@kline_${interval}`,
            ];
            const url = `${URL_SOCKET}/stream?streams=${streams.join("/")}`;

            wsRef.current = webSocketHandler(
                url,
                {
                    onMessage: (message) => {
                        const data = message.data;

                        switch (data.e) {
                            case "trade":
                                updateMarketTrade(queryClient, data, symbol);
                                break;
                            case "24hrTicker":
                                updateTicker(queryClient, data, symbol);
                                break;
                            case "depthUpdate":
                                if (data.b?.length >= 17 && data.a?.length >= 17) {
                                    updateOrderBook(queryClient, data, symbol);
                                }
                                break;
                            case "kline":
                                updateTradingChart(queryClient, data, symbol, interval);
                                break;
                            default:
                                console.warn(`Unhandled WebSocket event: ${data.e}`);
                        }
                    },
                },
                {},
                showToast
            );
        };

        // 연결 설정
        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [symbol, interval]);

    // clean-up 함수 반환
    return () => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    };
};