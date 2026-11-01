
import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

// Demo Chennai coordinates only
const courierLocation = [13.0604, 80.2496];
const destinationLocation = [13.0674, 80.2376];

const routeCoordinates = [
  courierLocation,
  [13.0620, 80.2470],
  [13.0640, 80.2440],
  [13.0655, 80.2410],
  destinationLocation
];

function FitRoute() {
  const map = useMap();

  React.useEffect(() => {
    map.fitBounds(routeCoordinates, {
      padding: [40, 40]
    });
  }, [map]);

  return null;
}

export default function DeliveryMap() {
  return (
    <div className="delivery-map-wrapper">
      <div className="delivery-map-heading">
        <div>
          <span>DELIVERY LOCATION</span>
          <h2>Shipment Location</h2>
        </div>

        <span className="demo-map-badge">
          DEMO TRACKING
        </span>
      </div>

      <MapContainer
        center={courierLocation}
        zoom={14}
        scrollWheelZoom={true}
        className="delivery-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitRoute />

        <Polyline
          positions={routeCoordinates}
          pathOptions={{
            color: "#2F4F4F",
            weight: 5,
            opacity: 0.85
          }}
        />

        <Marker position={courierLocation}>
          <Popup>
            <strong>Delivery Partner</strong>
            <br />
            Sample courier location
          </Popup>
        </Marker>

        <Marker position={destinationLocation}>
          <Popup>
            <strong>Delivery Destination</strong>
            <br />
            Demo destination only
          </Popup>
        </Marker>
      </MapContainer>

      <div className="delivery-map-legend">
        <div>
          <span className="legend-dot courier-dot"></span>
          <strong>Delivery Partner</strong>
        </div>

        <div>
          <span className="legend-dot destination-dot"></span>
          <strong>Delivery Destination</strong>
        </div>
      </div>

      <p className="delivery-map-disclaimer">
        This map displays sample Chennai coordinates for demonstration.
        It does not show the customer's actual address or a live courier GPS position.
      </p>
    </div>
  );
}
