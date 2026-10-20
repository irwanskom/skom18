# Leaflet (vendored)

The office map in `map-kantor.html` uses Leaflet 1.9.4. These files are empty
until someone runs the fetch script — the map works either way, but it only
stops depending on a CDN once they are here and committed.

## Getting the files

```sh
./scripts/fetch-leaflet.sh
```

Downloads `leaflet.css`, `leaflet.js` and `images/` from unpkg and verifies
both entry points against their SRI digests. Then commit the result:

```sh
git add assets/vendor/leaflet
git commit -m "Vendor Leaflet 1.9.4"
```

## How the map resolves Leaflet

`map-kantor.html` tries three things in order:

1. `assets/vendor/leaflet/leaflet.js` — used when these files exist
2. `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js` — with SRI, if step 1 is missing
3. a plain address block with a Google Maps link, if both fail

So the page never renders as an empty box, and dropping the files in here
switches it to self-hosted with no code change.

## Upgrading

Bump `VERSION` in `scripts/fetch-leaflet.sh`, replace `SRI_CSS` / `SRI_JS`
with the digests for the new release, and update the CDN URL and `integrity`
values in `map-kantor.html` to match. Compute a digest with:

```sh
openssl dgst -sha384 -binary leaflet.js | openssl base64 -A
```

Leaflet is BSD-2-Clause licensed; keep `LICENSE` alongside the files if you
redistribute them.
