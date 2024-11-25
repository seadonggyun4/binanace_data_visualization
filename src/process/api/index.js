import axios from "axios";

/**
 * API 요청 함수
 * @param {string} url - API 엔드포인트
 * @param {Object} options - 요청 옵션 (method, headers, body 등)
 * @returns {Promise} - Axios 응답
 */
export const apiClient = async (url, options = {}) => {
    const defaultOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    };

    return axios({
        url,
        ...defaultOptions,
        ...options,
    });
};
