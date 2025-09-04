import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
  DirectionsService,
  DirectionsRenderer,
  StandaloneSearchBox,
} from "@react-google-maps/api";
import { useState, useEffect, useRef } from "react";
import RatingStars from "./RatingStars";


const libraries = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};
const defaultCenter = { lat: 28.6139, lng: 77.209 }; // Default: New Delhi

const requestRoute = () => {
  if (!selected) return;

  const origin = center;
  const destination = {
    lat: selected.geometry.location.lat(),
    lng: selected.geometry.location.lng(),
  };

  setRouteReq({
    origin,
    destination,
    travelMode: window.google.maps.TravelMode.DRIVING,
  });
  setRouteResult(null); // reset old route
};


export default function MapContainer() {
  // ----- map + loader -----
  const searchBoxRef = useRef(null);
  const mapRef = useRef(null);
  const onMapLoad = (map) => (mapRef.current = map);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // ----- state -----
  const [center, setCenter] = useState(defaultCenter);
  const [cafes, setCafes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [query, setQuery] = useState("cafe");

  const [loading, setLoading] = useState(false);
  const paginationRef = useRef(null);
  const [hasMore, setHasMore] = useState(false);

  const [openNow, setOpenNow] = useState(false);
  const [minRating, setMinRating] = useState(0);

  const [routeReq, setRouteReq] = useState(null);
  const [routeResult, setRouteResult] = useState(null);

  // ----- helpers -----
  const mergePlaces = (oldList, newList) => {
    const byId = new Map(oldList.map((p) => [p.place_id, p]));
    newList.forEach((p) => byId.set(p.place_id, p));
    return [...byId.values()];
  };

  const filteredCafes = cafes.filter((p) => (p.rating || 0) >= minRating);

  // ----- geolocation on mount -----
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenter(loc);
      },
      () => console.log("Geolocation not available")
    );
  }, []);

  // ----- use my location -----
  const centerOnMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setCenter(loc);
      mapRef.current?.panTo(loc);
      mapRef.current?.setZoom(15);
    });
  };

  // ----- fetch places (nearby search + pagination) -----
  const fetchCafes = (keyword = "cafe", { reset = true } = {}) => {
    if (!mapRef.current) return;
    setLoading(true);

    const service = new window.google.maps.places.PlacesService(mapRef.current);

    service.nearbySearch(
      {
        location: center,
        radius: 5000, // broader search for more results
        keyword,
        openNow, // toggle-able
      },
      (results, status, pagination) => {
        setLoading(false);
        if (status !== window.google.maps.places.PlacesServiceStatus.OK || !results) {
          setHasMore(false);
          paginationRef.current = null;
          return;
        }

        setCafes((prev) => (reset ? results : mergePlaces(prev, results)));
        if (pagination && pagination.hasNextPage) {
          paginationRef.current = pagination;
          setHasMore(true);
        } else {
          paginationRef.current = null;
          setHasMore(false);
        }
      }
    );
  };

  const loadMore = () => {
    if (paginationRef.current?.hasNextPage) {
      setLoading(true);
      // Google requires a brief delay before calling nextPage()
      setTimeout(() => paginationRef.current.nextPage(), 1200);
    }
  };

  // ----- getDetails when a place is selected -----
  useEffect(() => {
    if (!selected) {
      setSelectedDetails(null);
      return;
    }
    if (!mapRef.current) return;

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    service.getDetails(
      {
        placeId: selected.place_id,
        fields: [
          "name",
          "formatted_address",
          "formatted_phone_number",
          "website",
          "opening_hours",
          "rating",
          "geometry",
          "photos",
        ],
      },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setSelectedDetails(place);
        }
      }
    );
  }, [selected]);

  // ----- directions -----
  const requestRoute = () => {
    if (!selected) return;
    const dest = {
      lat: selected.geometry.location.lat(),
      lng: selected.geometry.location.lng(),
    };
    setRouteReq({
      origin: center,
      destination: dest,
      travelMode: window.google.maps.TravelMode.DRIVING,
    });
    setRouteResult(null);
  };

  const clearRoute = () => {
    setRouteReq(null);
    setRouteResult(null);
  };

  if (loadError) return <p>Error loading maps</p>;
  if (!isLoaded) return <p>Loading Maps...</p>;

  // ----- UI -----
  const info = selectedDetails || selected;

  return (
    <>
      {/* Top controls: search + filters */}
      {/* Top controls: location autocomplete + keyword search */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-[95%] max-w-xl">
        <div className="bg-white shadow-lg rounded-xl p-3 ml-15 flex flex-wrap items-center gap-2">
          {/* Location / place autocomplete */}
          <div className="flex-1 min-w-[220px]">
            <StandaloneSearchBox
              onLoad={(ref) => (searchBoxRef.current = ref)}
              onPlacesChanged={() => {
                const places = searchBoxRef.current?.getPlaces() || [];
                const place = places[0];
                if (!place || !place.geometry) return;

                const loc = {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                };
                setCenter(loc);
                mapRef.current?.panTo(loc);
                mapRef.current?.setZoom(15);
              }}
            >
              <input
                type="text"
                placeholder="Search a location or place (e.g., Connaught Place)"
                className="w-full p-2 rounded-lg border outline-none"
              />
            </StandaloneSearchBox>
          </div>

          {/* Keyword input (what to find around that area) */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='What to find (e.g., "cafe", "bakery", "restaurant")'
              className="w-48 p-2 rounded-lg border outline-none"
            />
            <button
              onClick={() => fetchCafes(query, { reset: true })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Search this area
            </button>
          </div>
        </div>
      </div>


      {/* Left-side action buttons */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <span>
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow"
            onClick={() => fetchCafes("cafe", { reset: true })}
          >
            Find Cafes Near Me
          </button>

          <button
            className="bg-white border ml-6 px-6 py-2 rounded-lg shadow"
            onClick={centerOnMe}
          >
            Use my location
          </button>
        </span>
      </div>


      {routeReq && (
        <button
          className="absolute top-28 left-4 z-10 bg-white border px-3 py-2 rounded-lg shadow"
          onClick={clearRoute}
        >
          Clear route
        </button>
      )}

      {/* Map */}
      <div className="relative w-full h-screen">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={14}
          center={center}
          onLoad={onMapLoad}
        >
          {/* Render directions (in-app route) */}
          {routeReq && !routeResult && (
            <DirectionsService
              options={routeReq}
              callback={(res, status) => {
                if (status === "OK") {
                  setRouteResult(res);
                }
              }}
            />
          )}
          {routeResult && <DirectionsRenderer options={{ directions: routeResult }} />}

          {/* Markers */}
          {filteredCafes.map((cafe) => (
            <Marker
              key={cafe.place_id}
              position={{
                lat: cafe.geometry.location.lat(),
                lng: cafe.geometry.location.lng(),
              }}
              onClick={() => setSelected(cafe)}
            />
          ))}

          {/* InfoWindow with richer details */}
          {selected && info && (
            <InfoWindow
              position={{
                lat: selected.geometry.location.lat(),
                lng: selected.geometry.location.lng(),
              }}
              onCloseClick={() => {
                setSelected(null);
                setSelectedDetails(null);
              }}
            >
              <div className="max-w-[240px] space-y-1">
                {info.photos?.[0] && (
                  <img
                    src={info.photos[0].getUrl({ maxWidth: 400, maxHeight: 250 })}
                    alt={info.name}
                    className="w-full h-28 object-cover rounded mb-2"
                  />
                )}

                <h2 className="font-bold text-base truncate">{info.name}</h2>

                {info.formatted_address ? (
                  <p className="text-sm text-gray-700 truncate">{info.formatted_address}</p>
                ) : (
                  <p className="text-sm text-gray-700 truncate">{selected.vicinity}</p>
                )}

                <RatingStars rating={info.rating} />

                {info.formatted_phone_number && (
                  <p className="text-sm">📞 {info.formatted_phone_number}</p>
                )}

                {info.website && (
                  <a
                    href={info.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    Website
                  </a>
                )}

                <div className="mt-2 flex flex-col gap-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selected.geometry.location.lat()},${selected.geometry.location.lng()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm block text-center"
                  >
                    Open in Google Maps
                  </a>
                  <button
                    onClick={requestRoute}
                    className="text-white bg-blue-600 px-2 py-1 rounded text-sm block"
                  >
                    Show Route
                  </button>
                </div>

              </div>

            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* Sidebar list */}
      <div className="absolute top-16 left-4 w-72 bg-white shadow-xl rounded-xl p-4 max-h-[80vh] overflow-y-auto z-10">
        <h2 className="font-bold text-lg mb-2">Nearby Places</h2>
        {filteredCafes.length === 0 && (
          <p className="text-sm">No results yet. Try “Search” or “Find Cafes Near Me”.</p>
        )}

        {filteredCafes.map((cafe) => {
          const photoUrl = cafe.photos?.[0]?.getUrl({ maxWidth: 400, maxHeight: 300 });
          return (
            <div
              key={cafe.place_id}
              className="p-2 mb-2 border rounded-lg cursor-pointer hover:bg-gray-50"
              onClick={() => {
                setSelected(cafe);
                const pos = {
                  lat: cafe.geometry.location.lat(),
                  lng: cafe.geometry.location.lng(),
                };
                mapRef.current?.panTo(pos);
                mapRef.current?.setZoom(15);
              }}
            >
              {photoUrl && (
                <img
                  src={photoUrl}
                  alt={cafe.name}
                  className="w-full h-28 object-cover rounded mb-2"
                />
              )}
              <p className="font-semibold">{cafe.name}</p>
              <p className="text-sm text-gray-600">{cafe.vicinity}</p>
              <RatingStars rating={Number(cafe.rating) || 0} />
            </div>
          );
        })}

        {hasMore && (
          <button
            onClick={loadMore}
            className="mt-2 w-full bg-gray-800 text-white py-2 rounded-lg"
          >
            Load more
          </button>
        )}
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
          <div className="animate-spin h-10 w-10 rounded-full border-4 border-gray-300 border-t-transparent" />
        </div>
      )}
    </>
  );
}
