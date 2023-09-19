export interface AirQualityData {
  ts: string;
  aqius: number;
  mainus: string;
  aqicn: number;
  maincn: string;
}

export interface ApiResponse {
  status: number;
  data: {
    current: {
      pollution: AirQualityData;
    };
  };
}

export interface Result {
  Pollution: AirQualityData
}

export interface AirQualityResponse {
  Result: Result
}