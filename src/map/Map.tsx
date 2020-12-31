import React, {useState, useEffect} from "react";
import {TileLayer, MapContainer, ZoomControl} from "react-leaflet";

import {TelexConnection} from "@flybywiresim/api-client";

import FlightsLayer from './FlightsLayer';
import MenuPanel from './MenuPanel';

import "leaflet/dist/leaflet.css";
import "./Map.scss";

import ArrivalWhite from './icons/arrival_white.png';
import ArrivalGray from './icons/arrival_gray.png';
import DepartureWhite from './icons/departure_white.png';
import DepartureGray from './icons/arrival_gray.png';
import PlaneCyan from './icons/plane_cyan.png';
import PlaneBlue from './icons/plane_blue.png';
import {LatLng} from "leaflet";
import WeatherLayer from "./WeatherLayer";

type MapProps = {
    disableMenu?: boolean,
    disableFlights?: boolean,
    disableWeather?: boolean,
    weatherOpacity?: number,
    forceTileset?: string,
    currentFlight?: string,
    disableScroll?: boolean,
    refreshInterval?: number,
    hideOthers?: boolean,
    center?: LatLng,
    zoom?: number,
}

export type TileSet = {
    id: number,
    value: string,
    name: string,
    attribution: string,
    url: string,
    planeIcon: string,
    planeIconHighlight: string,
    departureIcon: string,
    arrivalIcon: string,
}

const Map = (props: MapProps) => {
    const availableTileSets: TileSet[] = [
        {
            id: 1,
            value: "carto-dark",
            name: "Dark",
            attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> &copy; <a href=\"http://cartodb.com/attributions\">CartoDB</a>",
            url: "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png",
            planeIcon: PlaneCyan,
            planeIconHighlight: PlaneBlue,
            departureIcon: DepartureWhite,
            arrivalIcon: ArrivalWhite,
        },
        {
            id: 2,
            value: "carto-light",
            name: "Light",
            attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> &copy; <a href=\"http://cartodb.com/attributions\">CartoDB</a>",
            url: "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
            planeIcon: PlaneCyan,
            planeIconHighlight: PlaneBlue,
            departureIcon: DepartureGray,
            arrivalIcon: ArrivalGray,
        },
        {
            id: 3,
            value: "osm",
            name: "Open Street Map",
            attribution: "&copy; <a href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors",
            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            planeIcon: PlaneCyan,
            planeIconHighlight: PlaneBlue,
            departureIcon: DepartureGray,
            arrivalIcon: ArrivalGray,
        }
    ];

    const [currentFlight, setCurrentFlight] = useState<string>(props.currentFlight || "");
    const [selectedTile, setSelectedTile] = useState<TileSet>(loadTileSet(props.forceTileset || ""));
    const [connections, setConnections] = useState<TelexConnection[]>([]);
    const [searchedFlight, setSearchedFlight] = useState<TelexConnection>();
    const [keyMap, setKeyMap] = useState<number>(Math.random());
    const [weatherOpacity, setWeatherOpacity] = useState<number>(props.weatherOpacity || 0.2);
    const [showOthers, setShowOthers] = useState<boolean>(!props.hideOthers);

    // Force map reload on tile set change
    useEffect(() => {
        setKeyMap(Math.random());
    }, [selectedTile]);

    function loadTileSet(override?: string): TileSet {
        if (override) {
            window.localStorage.setItem("PreferredTileset", override);
            return loadTileSet();
        }

        try {
            const storedTiles = window.localStorage.getItem("PreferredTileset");
            if (!storedTiles) {
                return availableTileSets[0];
            }

            return availableTileSets.find(x => x.value === storedTiles) || availableTileSets[0];
        } catch {
            return availableTileSets[0];
        }
    }

    function setAndStoreSelectedTile(tiles: TileSet) {
        setSelectedTile(tiles);
        window.localStorage.setItem("PreferredTileset", tiles.value);
    }

    return (
        <MapContainer
            id="live-map"
            key={keyMap}
            center={props.center || [50, 8]}
            zoom={props.zoom || 5}
            scrollWheelZoom={!props.disableScroll}
            worldCopyJump={true}
            zoomControl={false} >
            <TileLayer attribution={selectedTile.attribution} url={selectedTile.url} />
            {
                (!props.disableWeather) ?
                    <WeatherLayer opacity={weatherOpacity} /> : <></>
            }
            {
                (!props.disableFlights) ?
                    <FlightsLayer
                        planeIcon={selectedTile.planeIcon}
                        planeIconHighlight={selectedTile.planeIconHighlight}
                        departureIcon={selectedTile.departureIcon}
                        arrivalIcon={selectedTile.arrivalIcon}
                        onConnectionsUpdate={setConnections}
                        currentFlight={currentFlight}
                        searchedFlight={searchedFlight}
                        refreshInterval={props.refreshInterval || 10000}
                        hideOthers={!showOthers}
                    /> : <></>
            }
            {
                !props.disableMenu ?
                    <MenuPanel
                        connections={connections}
                        onFound={(conn) => setSearchedFlight(conn)}
                        onNotFound={() => setSearchedFlight(undefined)}
                        onReset={() => setSearchedFlight(undefined)}
                        weatherOpacity={weatherOpacity}
                        onWeatherOpacityChange={setWeatherOpacity}
                        activeTileSet={selectedTile}
                        availableTileSets={availableTileSets}
                        onTileSetChange={setAndStoreSelectedTile}
                        refreshInterval={props.refreshInterval || 10000}
                        currentFlight={currentFlight}
                        onCurrentFlightChange={setCurrentFlight}
                        showOthers={showOthers}
                        onShowOthersChange={setShowOthers}
                    />
                    : <></>
            }
            <ZoomControl position="bottomright" />
        </MapContainer>
    );
};

export default Map;
