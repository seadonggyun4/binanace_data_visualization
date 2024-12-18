// 공통 데이터 타입
interface BaseData {
    price: string;
    qty: string;
    isBuyerMaker: boolean;
}

// API 응답 타입 (원본 데이터)
export interface ApiTradeResponse extends BaseData {
    time: string;
}

// WebSocket 데이터 타입 (원본 데이터)
export interface WebSocketTradeData {
    p: string; // price
    q: string; // quantity
    T: number; // timestamp
    m: boolean; // isBuyerMaker
}

// 가공된 데이터 타입
export interface MarketTradeData extends BaseData {
    time: string;
}
