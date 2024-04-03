import axios from "axios";
import { SearchType } from "../types";
import { z } from "zod";
import { useMemo, useState } from "react";

const Weather = z.object({
  name: z.string(),
  main: z.object({
    temp: z.number(),
    temp_max: z.number(),
    temp_min: z.number(),
  }),
});

export type Weather = z.infer<typeof Weather>;

const initialState = {
  name: "",
  main: {
    temp: 0,
    temp_max: 0,
    temp_min: 0,
  },
};

export default function useWeather() {
  const [weather, setWeather] = useState<Weather>(initialState);
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const fetchWeather = async (search: SearchType) => {
    setLoading(true)
    setNotFound(false)
    setWeather(initialState)
    try {
      const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${
        search.city
      },${search.country}&appid=${import.meta.env.VITE_API_KEY}`;

      const { data: geo } = await axios.get(geoUrl);

      if (!geo[0]) {
        setNotFound(true)
        return
      }

      const { lat, lon } = geo[0];
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${
        import.meta.env.VITE_API_KEY
      }`;

      const { data: weatherResult } = await axios.get(weatherUrl);

      const result = Weather.safeParse(weatherResult);
      if (result.success) {
        setWeather(result.data)
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
    }
  };

  const hasWeatherData = useMemo(() => weather.name ,[weather])

  return {
    weather,
    loading,
    notFound,
    fetchWeather,
    hasWeatherData,
  };
}
