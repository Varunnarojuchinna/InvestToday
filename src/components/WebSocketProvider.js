import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import Config from 'react-native-config';

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const [indicesDataHl, setIndicesData] = useState({});
  const [sensexDataGraphHl, setSensexDataGraph] = useState();
  const [nifty50DataGraphHl, setNifty50DataGraph] = useState();
  const [niftyBankGraphHl, setNiftyBankGraph] = useState();
  const [loadingHl, setLoading] = useState(true);
  const [nseStockDetails, setNseStockDetails] = useState();
  const [bseStockDetails, setBseStockDetails] = useState();

  const reconnectTimeoutRef = useRef(null);

  const connectWebSocket = useCallback(() => {
    const newWs = new WebSocket(`${Config.WEB_SOCKET_URL}/?apiKey=${Config.API_KEY}`);

    newWs.onopen = () => {
      console.log('WebSocket connection opened');
      setWs(newWs);
      setLoading(false);
      if (reconnectTimeoutRef.current !== null) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null; // reset the ref value
      }
    };

    newWs.onmessage = handleWebSocketMessage;

    newWs.onerror = (e) => {
      console.log('WebSocket error:', e.message);
    };

    newWs.onclose = (e) => {
      if (reconnectTimeoutRef.current === null) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 5000);
      }
    };

    return newWs;
  }, [handleWebSocketMessage]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current !== null) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [connectWebSocket]);

  const handleWebSocketMessage = useCallback(async (e) => {
    const data = JSON.parse(e?.data);
    if (data?.NSE?.length > 0) {
      const companyDetails = await data?.NSE?.find((stock) => stock.symbol === 'NSEI');
      setNifty50DataGraph(companyDetails?.data);
      setIndicesData(prevState => ({ ...prevState, nifty50: {
        ...companyDetails?.data?.currentDetails,
        updatedOn: companyDetails?.data?.updatedOn
      } }));
      setNseStockDetails(data.NSE);
    }
    if (data?.NSE?.length > 0) {
      const companyDetails = await data?.NSE?.find((stock) => stock.symbol === 'NSEBANK');
      setNiftyBankGraph(companyDetails?.data);
      setIndicesData(prevState => ({ ...prevState, niftyBank: {
        ...companyDetails?.data?.currentDetails,
        updatedOn: companyDetails?.data?.updatedOn
     } }));
    }
    if (data?.BSE?.length > 0) {
      const companyDetails = await data?.BSE?.find((stock) => stock.symbol === 'BSESN');
      setSensexDataGraph(companyDetails?.data);
      setIndicesData(prevState => ({ ...prevState, sensex: {
        ...companyDetails?.data?.currentDetails,
        updatedOn: companyDetails?.data?.updatedOn
      } }));
      setBseStockDetails(data.BSE);
    }
    setLoading(false);
  }, []);


  return (
    <WebSocketContext.Provider value={{ ws, indicesDataHl, sensexDataGraphHl, nifty50DataGraphHl, niftyBankGraphHl, loadingHl,nseStockDetails, bseStockDetails}}>
      {children}
    </WebSocketContext.Provider>
  );
};
